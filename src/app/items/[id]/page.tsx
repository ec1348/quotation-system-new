import { prisma } from '@/lib/prisma';
import { ItemCostHistory } from '@/components/items/ItemCostHistory';
import { getRelatedPriceHistory } from '@/actions/priceHistory';
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
        // include: { supplier: true }, // Supplier is not on Item directly anymore
    });

    const suppliers = await prisma.supplier.findMany({
        orderBy: { name: 'asc' },
    });

    const priceHistory = await prisma.itemPriceHistory.findMany({
        where: { itemId },
        include: { supplier: true },
        orderBy: { date: 'desc' },
    });

    const relatedHistoryRes = await getRelatedPriceHistory(item?.name || '');
    const relatedHistory = relatedHistoryRes.success ? relatedHistoryRes.data : [];

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
                    relatedHistory={relatedHistory}
                    isArchived={item.status === 'ARCHIVED'}
                />
            </div>
        </div>
    );
}
