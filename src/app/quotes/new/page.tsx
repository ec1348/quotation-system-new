'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClients } from '@/actions/client';
import { createQuote } from '@/actions/quote';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Client } from '@prisma/client';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NewQuotePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        async function loadClients() {
            const result = await getClients();
            setClients(result);
            setIsLoading(false);
        }
        loadClients();
    }, []);

    const handleCreate = async () => {
        if (!selectedClientId) return;
        setIsCreating(true);
        try {
            const result = await createQuote(parseInt(selectedClientId));
            if (result.success && result.data) {
                router.push(`/quotes/${result.data.id}/edit`);
            } else {
                alert('Failed to create quote');
                setIsCreating(false);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to create quote');
            setIsCreating(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card>
                <CardHeader>
                    <CardTitle>{t('quote.newQuote')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('quote.selectClient')}</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">-- {t('quote.selectClient')} --</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button
                        className="w-full"
                        onClick={handleCreate}
                        disabled={!selectedClientId || isCreating || isLoading}
                    >
                        {isCreating ? t('common.loading') : t('common.confirm')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
