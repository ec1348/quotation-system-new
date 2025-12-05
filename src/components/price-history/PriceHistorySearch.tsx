'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { searchPriceHistory } from '@/actions/priceHistory';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search } from 'lucide-react';

export function PriceHistorySearch() {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const res = await searchPriceHistory(query);
            if (res.success) {
                setResults(res.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setHasSearched(true);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <Input
                    placeholder={t('common.search') + '...'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                    <Search className="mr-2 h-4 w-4" />
                    {loading ? t('common.loading') : t('common.search')}
                </Button>
            </div>

            {hasSearched && (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="p-3 text-left">{t('common.date')}</th>
                                <th className="p-3 text-left">{t('item.name')}</th>
                                <th className="p-3 text-left">{t('item.brand')}</th>
                                <th className="p-3 text-left">{t('item.model')}</th>
                                <th className="p-3 text-left">{t('supplier.title')}</th>
                                <th className="p-3 text-right">{t('item.price')}</th>
                                <th className="p-3 text-left">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                        {t('common.noResults')}
                                    </td>
                                </tr>
                            ) : (
                                results.map((record) => (
                                    <tr key={record.id} className="border-t hover:bg-muted/50">
                                        <td className="p-3">
                                            {new Date(record.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-3 font-medium">{record.item.name}</td>
                                        <td className="p-3">{record.item.brand}</td>
                                        <td className="p-3">{record.item.model}</td>
                                        <td className="p-3">{record.supplier.name}</td>
                                        <td className="p-3 text-right font-mono">
                                            ${record.price.toLocaleString()}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${record.type === 'PURCHASE'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {record.type}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
