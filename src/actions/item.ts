'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { ItemStatus, PriceType } from '@/types/enums'

export async function getItems(status: string = 'ACTIVE') {
    try {
        const where: any = {}

        if (status !== 'ALL') {
            where.status = status
        }

        const items = await prisma.item.findMany({
            where,
            include: {
                priceHistory: {
                    orderBy: { date: 'desc' },
                    take: 1,
                    include: { supplier: true }
                }
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })
        return { success: true, data: items }
    } catch (error) {
        console.error('Failed to fetch items:', error)
        return { success: false, error: 'Failed to fetch items' }
    }
}

export async function getItem(id: number) {
    try {
        const item = await prisma.item.findUnique({
            where: { id },
            include: {
                priceHistory: {
                    orderBy: { date: 'desc' },
                    include: { supplier: true }
                }
            }
        })
        return { success: true, data: item }
    } catch (error) {
        console.error('Failed to get item:', error)
        return { success: false, error: 'Failed to get item' }
    }
}

export async function createItem(data: {
    name: string
    brand: string
    model: string
    description?: string
    year: number
    salePrice: number
    category: string
    initialCost?: number
    supplierId?: number
}) {
    try {
        // Check for duplicate brand+model
        const existingItem = await prisma.item.findUnique({
            where: {
                brand_model: {
                    brand: data.brand,
                    model: data.model
                }
            }
        })

        if (existingItem) {
            return { success: false, error: 'Item with this Brand and Model already exists.' }
        }

        const item = await prisma.item.create({
            data: {
                name: data.name,
                brand: data.brand,
                model: data.model,
                description: data.description,
                year: data.year,
                salePrice: data.salePrice,
                category: data.category,
                status: ItemStatus.ACTIVE,
            },
        })

        // Create initial price history if cost and supplier are provided
        if (data.initialCost && data.supplierId) {
            await prisma.itemPriceHistory.create({
                data: {
                    itemId: item.id,
                    price: data.initialCost,
                    date: new Date(),
                    supplierId: data.supplierId,
                    type: PriceType.PURCHASE,
                },
            })
        }

        revalidatePath('/items')
        return { success: true, data: item }
    } catch (error) {
        console.error('Failed to create item:', error)
        return { success: false, error: 'Failed to create item' }
    }
}

export async function updateItem(
    id: number,
    data: {
        name: string
        brand: string
        model: string
        description?: string
        year: number
        salePrice: number
        category: string
        status?: string
        newCost?: number
        supplierId?: number
    }
) {
    try {
        const existingItem = await prisma.item.findUnique({
            where: { id },
        })

        if (!existingItem) {
            return { success: false, error: 'Item not found' }
        }

        const item = await prisma.item.update({
            where: { id },
            data: {
                name: data.name,
                brand: data.brand,
                model: data.model,
                description: data.description,
                year: data.year,
                salePrice: data.salePrice,
                category: data.category,
                status: data.status || existingItem.status,
            },
        })

        // Add to price history if new cost is provided
        if (data.newCost && data.supplierId) {
            await prisma.itemPriceHistory.create({
                data: {
                    itemId: item.id,
                    price: data.newCost,
                    date: new Date(),
                    supplierId: data.supplierId,
                    type: PriceType.PURCHASE,
                },
            })
        }

        revalidatePath('/items')
        return { success: true, data: item }
    } catch (error) {
        console.error('Failed to update item:', error)
        // Handle unique constraint violation
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { success: false, error: 'Item with this Brand and Model already exists.' }
        }
        return { success: false, error: 'Failed to update item' }
    }
}

export async function deleteItem(id: number) {
    try {
        // Soft delete: update status to ARCHIVED
        await prisma.item.update({
            where: { id },
            data: {
                status: ItemStatus.ARCHIVED,
            },
        })
        revalidatePath('/items')
    } catch (error) {
        console.error('Failed to delete item:', error)
        throw error
    }
}

export async function deleteItemAction(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    await deleteItem(id);
}

export async function activateItem(id: number) {
    try {
        await prisma.item.update({
            where: { id },
            data: {
                status: ItemStatus.ACTIVE,
            },
        })
        revalidatePath('/items')
        revalidatePath(`/items/${id}`)
        revalidatePath(`/items/${id}/edit`)
    } catch (error) {
        console.error('Failed to activate item:', error)
        throw error
    }
}
