import { QuoteBuilder } from '@/components/quotes/QuoteBuilder';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getProducts } from '@/actions/product';
import { getItems } from '@/actions/item';

export default async function EditQuotePage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const quoteId = parseInt(id);

    if (isNaN(quoteId)) {
        notFound();
    }

    const [quote, productsResult, itemsResult] = await Promise.all([
        prisma.quote.findUnique({
            where: { id: quoteId },
            include: {
                client: true,
                items: {
                    orderBy: { id: 'asc' }
                }
            }
        }),
        prisma.product.findMany({
            include: {
                materials: {
                    include: { item: true }
                }
            }
        }),
        getItems()
    ]);

    if (!quote) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto">
            <QuoteBuilder
                quote={quote}
                products={productsResult}
                items={itemsResult.data || []}
            />
        </div>
    );
}
