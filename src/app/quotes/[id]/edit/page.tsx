import { getQuote } from '@/actions/quote';
import { getItems } from '@/actions/item';
import { QuoteBuilder } from '@/components/quotes/QuoteBuilder';
import { notFound } from 'next/navigation';

export default async function EditQuotePage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    const [quoteResult, itemsResult] = await Promise.all([
        getQuote(id),
        getItems('ACTIVE')
    ]);

    if (!quoteResult.success || !quoteResult.data) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10">
            <QuoteBuilder
                quote={quoteResult.data}
                availableItems={itemsResult.data || []}
            />
        </div>
    );
}
