'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getItems() {
    try {
        const items = await prisma.item.findMany({
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
            },
        })
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
    }
) {
    try {
        const item = await prisma.item.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                year: data.year,
                price: data.price,
                type: data.type,
                supplierId: data.supplierId,
            },
        })
        revalidatePath('/items')
        return { success: true, data: item }
    } catch (error) {
        console.error('Failed to update item:', error)
        return { success: false, error: 'Failed to update item' }
    }
}

export async function deleteItem(id: number) {
    try {
        await prisma.item.delete({
            where: { id },
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
