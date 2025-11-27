'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Quote, QuoteItem } from '@prisma/client';

export async function getQuotes() {
    try {
        const quotes = await prisma.quote.findMany({
            include: {
                client: true,
                items: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        return { success: true, data: quotes };
    } catch (error) {
        console.error('Failed to fetch quotes:', error);
        return { success: false, error: 'Failed to fetch quotes' };
    }
}

export async function getQuote(id: number) {
    try {
        const quote = await prisma.quote.findUnique({
            where: { id },
            include: {
                client: true,
                items: {
                    include: {
                        product: true,
                        item: true,
                    },
                    orderBy: {
                        id: 'asc',
                    }
                },
            },
        });
        return { success: true, data: quote };
    } catch (error) {
        console.error('Failed to fetch quote:', error);
        return { success: false, error: 'Failed to fetch quote' };
    }
}

export async function createQuote(clientId: number) {
    try {
        const quote = await prisma.quote.create({
            data: {
                clientId,
                status: 'DRAFT',
                total: 0,
            },
        });
        return { success: true, data: quote };
    } catch (error) {
        console.error('Failed to create quote:', error);
        return { success: false, error: 'Failed to create quote' };
    }
}

export async function updateQuote(id: number, data: Partial<Quote>) {
    try {
        const quote = await prisma.quote.update({
            where: { id },
            data,
        });
        revalidatePath(`/quotes/${id}/edit`);
        revalidatePath('/quotes');
        return { success: true, data: quote };
    } catch (error) {
        console.error('Failed to update quote:', error);
        return { success: false, error: 'Failed to update quote' };
    }
}

export async function deleteQuote(id: number) {
    try {
        await prisma.quote.delete({
            where: { id },
        });
        revalidatePath('/quotes');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete quote:', error);
        return { success: false, error: 'Failed to delete quote' };
    }
}

export async function deleteQuoteAction(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    await deleteQuote(id);
}


export async function addQuoteItem(data: {
    quoteId: number;
    productId?: number;
    itemId?: number;
    description: string;
    quantity: number;
    unitPrice: number;
    type: string;
}) {
    try {
        const total = data.quantity * data.unitPrice;
        const item = await prisma.quoteItem.create({
            data: {
                ...data,
                total,
            },
        });

        // Recalculate quote total
        await recalculateQuoteTotal(data.quoteId);

        revalidatePath(`/quotes/${data.quoteId}/edit`);
        return { success: true, data: item };
    } catch (error) {
        console.error('Failed to add quote item:', error);
        return { success: false, error: 'Failed to add quote item' };
    }
}

export async function updateQuoteItem(id: number, data: Partial<QuoteItem>) {
    try {
        // If quantity or unitPrice changes, recalculate total
        let total = undefined;
        if (data.quantity !== undefined || data.unitPrice !== undefined) {
            const currentItem = await prisma.quoteItem.findUnique({ where: { id } });
            if (currentItem) {
                const qty = data.quantity ?? currentItem.quantity;
                const price = data.unitPrice ?? currentItem.unitPrice;
                total = qty * price;
            }
        }

        const item = await prisma.quoteItem.update({
            where: { id },
            data: {
                ...data,
                ...(total !== undefined && { total }),
            },
        });

        await recalculateQuoteTotal(item.quoteId);
        revalidatePath(`/quotes/${item.quoteId}/edit`);
        return { success: true, data: item };
    } catch (error) {
        console.error('Failed to update quote item:', error);
        return { success: false, error: 'Failed to update quote item' };
    }
}

export async function removeQuoteItem(id: number) {
    try {
        const item = await prisma.quoteItem.delete({
            where: { id },
        });
        await recalculateQuoteTotal(item.quoteId);
        revalidatePath(`/quotes/${item.quoteId}/edit`);
        return { success: true };
    } catch (error) {
        console.error('Failed to remove quote item:', error);
        return { success: false, error: 'Failed to remove quote item' };
    }
}

async function recalculateQuoteTotal(quoteId: number) {
    const items = await prisma.quoteItem.findMany({
        where: { quoteId },
    });
    const total = items.reduce((sum, item) => sum + item.total, 0);
    await prisma.quote.update({
        where: { id: quoteId },
        data: { total },
    });
}
