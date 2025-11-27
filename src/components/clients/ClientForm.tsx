'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { createClient, updateClient } from '@/actions/client';
import { Client } from '@prisma/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClientFormProps {
    client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
    const router = useRouter();
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        const data = {
            name: formData.get('name') as string,
            address: formData.get('address') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            businessNumber: formData.get('businessNumber') as string,
        };

        try {
            if (client) {
                await updateClient(client.id, data);
            } else {
                await createClient(data);
            }
            router.push('/clients');
        } catch (error) {
            console.error(error);
            alert('Failed to save client');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{client ? t('client.editClient') : t('client.newClient')}</CardTitle>
            </CardHeader>
            <form action={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">{t('client.clientName')}</label>
                        <Input id="name" name="name" defaultValue={client?.name} required />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="businessNumber" className="text-sm font-medium">{t('common.businessNumber')}</label>
                        <Input id="businessNumber" name="businessNumber" defaultValue={client?.businessNumber || ''} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">{t('common.email')}</label>
                            <Input id="email" name="email" type="email" defaultValue={client?.email || ''} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium">{t('common.phone')}</label>
                            <Input id="phone" name="phone" defaultValue={client?.phone || ''} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="address" className="text-sm font-medium">{t('common.address')}</label>
                        <Input id="address" name="address" defaultValue={client?.address || ''} />
                    </div>
                </CardContent>
                <CardFooter className="justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? t('common.loading') : t('common.save')}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
