import { getQuotes } from '@/actions/quote';
import { QuoteList } from '@/components/quotes/QuoteList';
import { Quote, Client } from '@prisma/client';

type QuoteWithClient = Quote & { client: Client };

export default async function QuotesPage() {
    const { data } = await getQuotes();
    const quotes = data as QuoteWithClient[] | undefined;

    return <QuoteList quotes={quotes || []} />;
}
