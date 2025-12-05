import { prisma } from '@/lib/prisma';
import { QuoteList } from '@/components/quotes/QuoteList';

export default async function QuotesPage() {
    const quotes = await prisma.quote.findMany({
        include: {
            client: true
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    return (
        <div className="container mx-auto py-10">
            <QuoteList quotes={quotes} />
        </div>
    );
}
