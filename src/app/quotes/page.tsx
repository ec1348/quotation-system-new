import Link from 'next/link';
import { getQuotes, deleteQuote } from '@/actions/quote';
import { Button } from '@/components/ui/Button';
import { Plus, FileText, Trash2, Pencil } from 'lucide-react';
import { Quote, Client } from '@prisma/client';

type QuoteWithClient = Quote & { client: Client };

export default async function QuotesPage() {
    const { data } = await getQuotes();
    const quotes = data as QuoteWithClient[] | undefined;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
                <Link href="/quotes/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Quote
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Client</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Total</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {quotes?.map((quote) => (
                                <tr key={quote.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-mono">#{quote.id}</td>
                                    <td className="p-4 align-middle font-medium">{quote.client.name}</td>
                                    <td className="p-4 align-middle">{new Date(quote.date).toLocaleDateString()}</td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${quote.status === 'DRAFT' ? 'bg-secondary text-secondary-foreground' :
                                                quote.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {quote.status}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle text-right font-bold">
                                        ${quote.total.toLocaleString()}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/quotes/${quote.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </Button>
                                            </Link>
                                            <form action={deleteQuote.bind(null, quote.id)}>
                                                <Button variant="destructive" size="icon" className="h-9 w-9">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!quotes || quotes.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                        No quotes found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
