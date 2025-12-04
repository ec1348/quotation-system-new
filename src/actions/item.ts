'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getItems(status: string = 'ACTIVE') {
    try {
        const where: any = {}

        if (status !== 'ALL') {
            where.status = status
        }

        const items = await prisma.item.findMany({
            where,
            include: {
                supplier: true,
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

export async function createItem(data: {
    name: string
    description?: string
    year: number
    price: number
    type: string
    supplierId?: number
    priceType?: string // 'QUOTATION' | 'PURCHASE'
}) {
    try {
        const item = await prisma.item.create({
            data: {
                name: data.name,
                description: data.description,
                year: data.year,
                price: data.price,
                type: data.type,
                supplierId: data.supplierId,
                status: 'ACTIVE',
            },
        })

        if (data.supplierId) {
            await prisma.itemPriceHistory.create({
                data: {
                    itemId: item.id,
                    price: data.price,
                    date: new Date(),
                    supplierId: data.supplierId,
                    type: data.priceType || 'QUOTATION',
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
        description?: string
        year: number
        price: number
        type: string
        supplierId?: number
        priceType?: string // 'QUOTATION' | 'PURCHASE'
    }
) {
    try {
        const existingItem = await prisma.item.findUnique({
            where: { id },
        })

        if (!existingItem) {
            return { success: false, error: 'Item not found' }
        }

        // Only update the item's price if the new price type is PURCHASE
        // OR if the price hasn't changed (to allow updating other fields)
        // BUT if price changed and it's QUOTATION, we keep the old price on the item
        let newPrice = existingItem.price;
        if (data.priceType === 'PURCHASE' || existingItem.price === data.price) {
            newPrice = data.price;
        }

        const item = await prisma.item.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                year: data.year,
                price: newPrice, // Use the conditional price
                type: data.type,
                supplierId: data.supplierId,
            },
        })

        // Create price history if price changed (from input) and supplier is available
        // We record the input price in history regardless of whether we updated the item's main price
        if (existingItem.price !== data.price && data.supplierId) {
            await prisma.itemPriceHistory.create({
                data: {
                    itemId: item.id,
                    price: data.price,
                    date: new Date(),
                    supplierId: data.supplierId,
                    type: data.priceType || 'QUOTATION',
                },
            })
        }

        revalidatePath('/items')
        return { success: true, data: item }
    } catch (error) {
        console.error('Failed to update item:', error)
        return { success: false, error: 'Failed to update item' }
    }
}

export async function deleteItem(id: number) {
    try {
        // Soft delete: update status to ARCHIVED
        await prisma.item.update({
            where: { id },
            data: {
                status: 'ARCHIVED',
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
                status: 'ACTIVE',
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
