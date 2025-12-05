'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Client } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { createQuote } from '@/actions/quote';
import { useLanguage } from '@/contexts/LanguageContext';

interface NewQuoteFormProps {
    clients: Client[];
}

export function NewQuoteForm({ clients }: NewQuoteFormProps) {
    const { t } = useLanguage();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        try {
            const clientId = parseInt(formData.get('clientId') as string);
            const result = await createQuote(clientId);
            if (result.success && result.data) {
                router.push(`/quotes/${result.data.id}/edit`);
            }
        } catch (error) {
            console.error('Failed to create quote:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">{t('quote.selectClient')}</label>
                <select
                    name="clientId"
                    required
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                    <option value="">{t('common.select')}</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t('common.saving') : t('quote.newQuote')}
            </Button>
        </form>
    );
}
