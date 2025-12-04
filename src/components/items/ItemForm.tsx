'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { createItem, updateItem, activateItem } from '@/actions/item';
import { Item, Supplier } from '@prisma/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface ItemFormProps {
    item?: Item;
    suppliers: Supplier[];
}

export function ItemForm({ item, suppliers }: ItemFormProps) {
    const router = useRouter();
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isArchived = item?.status === 'ARCHIVED';

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            year: parseInt(formData.get('year') as string),
            price: parseFloat(formData.get('price') as string),
            type: formData.get('type') as string,
            supplierId: formData.get('supplierId') ? parseInt(formData.get('supplierId') as string) : undefined,
            priceType: formData.get('priceType') as string,
        };

        try {
            if (item) {
                await updateItem(item.id, data);
            } else {
                await createItem(data);
            }
            router.push('/items');
        } catch (error) {
            console.error(error);
            alert('Failed to save item');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleActivate = async () => {
        if (!item) return;
        setIsSubmitting(true);
        try {
            await activateItem(item.id);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to activate item');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{item ? t('item.editItem') : t('item.newItem')}</span>
                    {isArchived && (
                        <span className="text-sm font-normal px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                            {t('common.archived')}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <form action={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">{t('item.itemName')}</label>
                            <Input id="name" name="name" defaultValue={item?.name} required placeholder="e.g. Servo Motor" disabled={isArchived} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="year" className="text-sm font-medium">{t('common.year')}</label>
                            <Input id="year" name="year" type="number" defaultValue={item?.year || new Date().getFullYear()} required disabled={isArchived} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium">{t('common.description')}</label>
                        <Input id="description" name="description" defaultValue={item?.description || ''} placeholder={t('common.description')} disabled={isArchived} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="price" className="text-sm font-medium">{t('common.price')}</label>
                            <Input id="price" name="price" type="number" step="0.01" defaultValue={item?.price} required disabled={isArchived} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="type" className="text-sm font-medium">{t('common.type')}</label>
                            <select
                                id="type"
                                name="type"
                                defaultValue={item?.type || 'COMPONENT'}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isArchived}
                            >
                                <option value="COMPONENT">{t('item.component')}</option>
                                <option value="LABOR">{t('item.labor')}</option>
                                <option value="EXPENSE">{t('item.expense')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="supplierId" className="text-sm font-medium">{t('supplier.title')}</label>
                        <select
                            id="supplierId"
                            name="supplierId"
                            defaultValue={item?.supplierId || ''}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isArchived}
                        >
                            <option value="">{t('item.selectSupplier')}</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="priceType" className="text-sm font-medium">{t('common.type')}</label>
                        <select
                            id="priceType"
                            name="priceType"
                            defaultValue="PURCHASE"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isArchived}
                        >
                            <option value="PURCHASE">{t('common.purchase')}</option>
                            <option value="QUOTATION">{t('quote.title')}</option>
                        </select>
                    </div>
                </CardContent>
                <CardFooter className="justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        {t('common.cancel')}
                    </Button>
                    {isArchived ? (
                        <Button type="button" onClick={handleActivate} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                            {isSubmitting ? t('common.loading') : t('common.activate')}
                        </Button>
                    ) : (
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? t('common.loading') : t('common.save')}
                        </Button>
                    )}
                </CardFooter>
            </form>
        </Card>
    );
}
