'use client';

import Link from 'next/link';
import { Quote, Client } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/Badge';

type QuoteWithClient = Quote & {
    client: Client;
};

interface QuoteListProps {
    quotes: QuoteWithClient[];
}

export function QuoteList({ quotes }: QuoteListProps) {
    const { t } = useLanguage();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800">{t('quote.status.draft')}</Badge>;
            case 'SENT':
                return <Badge variant="default" className="bg-blue-100 text-blue-800">{t('quote.status.sent')}</Badge>;
            case 'ACCEPTED':
                return <Badge variant="default" className="bg-green-100 text-green-800">{t('quote.status.accepted')}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t('nav.quotes')}</h1>
                <Link href="/quotes/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('quote.newQuote')}
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">#</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t('quote.client')}</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t('quote.date')}</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t('common.status')}</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">{t('quote.totalAmount')}</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {quotes.map((quote) => (
                                <tr key={quote.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium">{quote.id}</td>
                                    <td className="p-4 align-middle">{quote.client.name}</td>
                                    <td className="p-4 align-middle">{new Date(quote.date).toLocaleDateString()}</td>
                                    <td className="p-4 align-middle">{getStatusBadge(quote.status)}</td>
                                    <td className="p-4 align-middle text-right font-mono font-medium">
                                        ${quote.totalAmount.toLocaleString()}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/quotes/${quote.id}/edit`}>
                                                <Button variant="ghost" size="icon">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {quotes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                        {t('common.noResults')}
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
