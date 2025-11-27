'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { Quote, Client } from '@prisma/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { deleteQuoteAction } from '@/actions/quote';

type QuoteWithClient = Quote & { client: Client };

interface QuoteListProps {
    quotes: QuoteWithClient[];
}

export function QuoteList({ quotes }: QuoteListProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t('nav.quotes')}</h1>
                <Link href="/quotes/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> {t('quote.newQuote')}
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t('quote.client')}</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t('common.date')}</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t('common.status')}</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">{t('common.total')}</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {quotes.map((quote) => (
                                <tr key={quote.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-mono">#{quote.id}</td>
                                    <td className="p-4 align-middle font-medium">{quote.client.name}</td>
                                    <td className="p-4 align-middle">{new Date(quote.date).toLocaleDateString()}</td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${quote.status === 'DRAFT' ? 'bg-secondary text-secondary-foreground' :
                                            quote.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {t(`quote.status.${quote.status.toLowerCase()}`)}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle text-right font-bold">
                                        ${quote.total.toLocaleString()}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/quotes/${quote.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="mr-2 h-4 w-4" /> {t('common.edit')}
                                                </Button>
                                            </Link>
                                            <form action={deleteQuoteAction}>
                                                <input type="hidden" name="id" value={quote.id} />
                                                <Button variant="destructive" size="icon" className="h-9 w-9">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {quotes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                        {t('quote.noItems')}
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
