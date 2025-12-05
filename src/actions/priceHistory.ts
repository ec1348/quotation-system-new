'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPriceHistory(data: {
    itemId: number;
    date: Date;
    supplierId: number;
    price: number;
    type: string;
}) {
    try {
        // 1. Create the history record
        const history = await prisma.itemPriceHistory.create({
            data: {
                itemId: data.itemId,
                date: data.date,
                supplierId: data.supplierId,
                price: data.price,
                type: data.type,
            },
        });

        // 2. Check if this is the latest record for the item
        const latestHistory = await prisma.itemPriceHistory.findFirst({
            where: { itemId: data.itemId },
            orderBy: { date: 'desc' },
        });

        // 3. If the new record is the latest (or same date as latest), update the Item
        // BUT only if the new record is a PURCHASE price.
        // We want to keep the Item price as the latest PURCHASE price.
        if (latestHistory && latestHistory.id === history.id && data.type === 'PURCHASE') {
            // We no longer cache price/supplier on Item. It's all in priceHistory.
            // But we might want to update the year?
            await prisma.item.update({
                where: { id: data.itemId },
                data: {
                    year: data.date.getFullYear(),
                },
            });
        }

        revalidatePath(`/items/${data.itemId}`);
        return { success: true, data: history };
    } catch (error) {
        console.error('Failed to create price history:', error);
        return { success: false, error: 'Failed to create price history' };
    }
}

export async function searchPriceHistory(query: string) {
    try {
        const history = await prisma.itemPriceHistory.findMany({
            where: {
                item: {
                    OR: [
                        { name: { contains: query } },
                        { brand: { contains: query } },
                        { model: { contains: query } },
                    ]
                }
            },
            include: {
                item: true,
                supplier: true,
            },
            orderBy: {
                date: 'desc',
            },
        });
        return { success: true, data: history };
    } catch (error) {
        console.error('Failed to search price history:', error);
        return { success: false, error: 'Failed to search price history' };
    }
}

export async function getRelatedPriceHistory(itemName: string) {
    try {
        const history = await prisma.itemPriceHistory.findMany({
            where: {
                item: {
                    name: itemName
                }
            },
            include: {
                item: true,
                supplier: true,
            },
            orderBy: {
                date: 'desc',
            },
        });
        return { success: true, data: history };
    } catch (error) {
        console.error('Failed to get related price history:', error);
        return { success: false, error: 'Failed to get related price history' };
    }
}
