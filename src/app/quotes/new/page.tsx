import { prisma } from '@/lib/prisma';
import { NewQuoteForm } from '@/components/quotes/NewQuoteForm';

export default async function NewQuotePage() {
    const clients = await prisma.client.findMany();

    return (
        <div className="container mx-auto py-10 max-w-md">
            <h1 className="text-2xl font-bold mb-6">Create New Quote</h1>
            <NewQuoteForm clients={clients} />
        </div>
    );
}
