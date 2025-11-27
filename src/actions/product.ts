'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Product Actions
export async function getProducts() {
    try {
        const products = await prisma.product.findMany({
            include: {
                materials: {
                    include: {
                        item: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })
        return { success: true, data: products }
    } catch (error) {
        console.error('Failed to fetch products:', error)
        return { success: false, error: 'Failed to fetch products' }
    }
}

export async function createProduct(data: {
    name: string
    description?: string
}) {
    try {
        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
            },
        })
        revalidatePath('/products')
        return { success: true, data: product }
    } catch (error) {
        console.error('Failed to create product:', error)
        return { success: false, error: 'Failed to create product' }
    }
}

export async function updateProduct(
    id: number,
    data: {
        name: string
        description?: string
    }
) {
    try {
        const product = await prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
            },
        })
        revalidatePath('/products')
        return { success: true, data: product }
    } catch (error) {
        console.error('Failed to update product:', error)
        return { success: false, error: 'Failed to update product' }
    }
}

export async function deleteProduct(id: number) {
    try {
        await prisma.product.delete({
            where: { id },
        })
        revalidatePath('/products')
    } catch (error) {
        console.error('Failed to delete product:', error)
        throw error
    }
}

export async function deleteProductAction(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    await deleteProduct(id);
}

// Product Material Actions (BOM)
export async function addProductMaterial(data: {
    productId: number
    itemId: number
    quantity: number
}) {
    try {
        const material = await prisma.productMaterial.create({
            data: {
                productId: data.productId,
                itemId: data.itemId,
                quantity: data.quantity,
            },
        })
        revalidatePath(`/products/${data.productId}/edit`)
        return { success: true, data: material }
    } catch (error) {
        console.error('Failed to add material:', error)
        return { success: false, error: 'Failed to add material' }
    }
}

export async function updateProductMaterial(
    id: number,
    quantity: number
) {
    try {
        const material = await prisma.productMaterial.update({
            where: { id },
            data: { quantity },
        })
        revalidatePath('/products') // Revalidate list too just in case
        return { success: true, data: material }
    } catch (error) {
        console.error('Failed to update material:', error)
        return { success: false, error: 'Failed to update material' }
    }
}

export async function removeProductMaterial(id: number) {
    try {
        await prisma.productMaterial.delete({
            where: { id },
        })
        revalidatePath('/products')
    } catch (error) {
        console.error('Failed to remove material:', error)
        throw error
    }
}
