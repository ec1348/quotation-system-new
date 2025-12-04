import { prisma } from '@/lib/prisma';
import { ItemCostHistory } from '@/components/items/ItemCostHistory';
import { ItemDetailsHeader } from '@/components/items/ItemDetailsHeader';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ItemDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
        notFound();
    }

    const item = await prisma.item.findUnique({
        where: { id: itemId },
        include: { supplier: true },
    });

    const suppliers = await prisma.supplier.findMany({
        orderBy: { name: 'asc' },
    });

    const priceHistory = await prisma.itemPriceHistory.findMany({
        where: { itemId },
        include: { supplier: true },
        orderBy: { date: 'desc' },
    });

    if (!item) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <ItemDetailsHeader item={item} />

            <div className="grid gap-8 md:grid-cols-1">
                <ItemCostHistory
                    suppliers={suppliers}
                    initialHistory={priceHistory}
                    isArchived={item.status === 'ARCHIVED'}
                />
            </div>
        </div>
    );
}
