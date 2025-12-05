'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

export async function createQuote(clientId: number) {
    try {
        const quote = await prisma.quote.create({
            data: {
                clientId,
                status: 'DRAFT',
                date: new Date(),
            },
        })
        revalidatePath('/quotes')
        return { success: true, data: quote }
    } catch (error) {
        console.error('Failed to create quote:', error)
        return { success: false, error: 'Failed to create quote' }
    }
}

export async function getQuote(id: number) {
    try {
        const quote = await prisma.quote.findUnique({
            where: { id },
            include: {
                client: true,
                items: {
                    where: { deletedAt: null }, // Filter out soft-deleted items
                    orderBy: { displayOrder: 'asc' },
                    include: {
                        product: true, // Source product if any
                    }
                }
            }
        })
        return { success: true, data: quote }
    } catch (error) {
        console.error('Failed to get quote:', error)
        return { success: false, error: 'Failed to get quote' }
    }
}

export async function addQuoteItem(quoteId: number, itemId: number, parentId?: number) {
    try {
        // 1. Fetch the source item to create a snapshot
        const item = await prisma.item.findUnique({
            where: { id: itemId },
            include: {
                priceHistory: {
                    orderBy: { date: 'desc' },
                    take: 1,
                    where: { type: 'PURCHASE' } // Get latest purchase price for cost basis
                }
            }
        })

        if (!item) {
            return { success: false, error: 'Item not found' }
        }

        // 2. Determine display order (append to end)
        const lastItem = await prisma.quoteItem.findFirst({
            where: { quoteId },
            orderBy: { displayOrder: 'desc' }
        })
        const newOrder = (lastItem?.displayOrder || 0) + 1

        // 3. Create QuoteItem with snapshot data
        const quoteItem = await prisma.quoteItem.create({
            data: {
                quoteId,
                itemId: item.id,
                parentId, // Link to parent if provided

                // Snapshot
                name: item.name || '',
                brand: item.brand,
                model: item.model,
                description: item.description || '',

                // Defaults
                quantity: 1,
                unitPrice: item.salePrice,
                total: item.salePrice * 1, // quantity * unitPrice

                // Profitability
                costBasis: item.priceHistory[0]?.price || 0,

                displayOrder: newOrder,
                type: 'COMPONENT'
            }
        })

        // 4. Update Quote Total
        await updateQuoteTotal(quoteId)

        revalidatePath(`/quotes/${quoteId}/edit`)
        return { success: true, data: quoteItem }
    } catch (error) {
        console.error('Failed to add quote item:', error)
        return { success: false, error: 'Failed to add quote item' }
    }
}

export async function updateQuoteItem(id: number, data: {
    quantity?: number
    unitPrice?: number
    name?: string
    description?: string
}) {
    try {
        const currentItem = await prisma.quoteItem.findUnique({ where: { id } })
        if (!currentItem) return { success: false, error: 'Item not found' }

        const quantity = data.quantity ?? currentItem.quantity
        const unitPrice = data.unitPrice ?? currentItem.unitPrice
        const total = quantity * unitPrice

        await prisma.quoteItem.update({
            where: { id },
            data: {
                ...data,
                total
            }
        })

        await updateQuoteTotal(currentItem.quoteId)

        revalidatePath(`/quotes/${currentItem.quoteId}/edit`)
        return { success: true }
    } catch (error) {
        console.error('Failed to update quote item:', error)
        return { success: false, error: 'Failed to update quote item' }
    }
}

export async function deleteQuoteItem(id: number) {
    try {
        const item = await prisma.quoteItem.findUnique({ where: { id } })
        if (!item) return { success: false, error: 'Item not found' }

        // Soft delete the item and all its children
        // Note: We need to find all children recursively if we want to be thorough,
        // but for now, let's just delete the direct children or rely on the UI hiding them.
        // Better approach: Mark item as deleted. Children will be orphaned visually if we filter by parentId,
        // but to be safe, we should also soft-delete children.

        // Find all children (recursive would be better, but let's do one level for now or use a transaction)
        // Actually, if we filter `items` by `deletedAt: null` in `getQuote`, children of a deleted item 
        // might still show up if they aren't deleted themselves but their parent is hidden.
        // So we MUST soft-delete children too.

        await prisma.$transaction(async (tx) => {
            // 1. Soft delete the item
            await tx.quoteItem.update({
                where: { id },
                data: { deletedAt: new Date() }
            })

            // 2. Soft delete direct children (and their children? - simplified for 1 level nesting)
            // For deep nesting, we'd need a recursive query or a stored procedure.
            // Given the current simple nesting, let's just update where parentId = id
            await tx.quoteItem.updateMany({
                where: { parentId: id },
                data: { deletedAt: new Date() }
            })
        })

        await updateQuoteTotal(item.quoteId)

        revalidatePath(`/quotes/${item.quoteId}/edit`)
        return { success: true }
    } catch (error) {
        console.error('Failed to delete quote item:', error)
        return { success: false, error: 'Failed to delete quote item' }
    }
}

async function updateQuoteTotal(quoteId: number) {
    const items = await prisma.quoteItem.findMany({
        where: {
            quoteId,
            deletedAt: null // Only sum active items
        }
    })
    const total = items.reduce((sum, item) => sum + item.total, 0)

    await prisma.quote.update({
        where: { id: quoteId },
        data: { totalAmount: total }
    })
}

export async function updateQuoteStatus(id: number, status: string) {
    try {
        await prisma.quote.update({
            where: { id },
            data: { status }
        })
        revalidatePath(`/quotes/${id}/edit`)
        return { success: true }
    } catch (error) {
        console.error('Failed to update quote status:', error)
        return { success: false, error: 'Failed to update quote status' }
    }
}
