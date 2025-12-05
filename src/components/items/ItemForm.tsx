'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { createItem, updateItem, activateItem } from '@/actions/item';
import { Item, Supplier } from '@prisma/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { ItemCategory } from '@/types/enums';

// Extended type to include missing fields
type ItemWithDetails = Item & {
    brand?: string;
    model?: string;
    category?: string;
    salePrice?: number;
};

interface ItemFormProps {
    item?: ItemWithDetails;
    suppliers: Supplier[];
}

export function ItemForm({ item, suppliers }: ItemFormProps) {
    const router = useRouter();
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEditing = !!item;
    const isArchived = item?.status === 'ARCHIVED';

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        setError(null);

        const data = {
            name: formData.get('name') as string,
            brand: formData.get('brand') as string,
            model: formData.get('model') as string,
            description: formData.get('description') as string,
            year: parseInt(formData.get('year') as string),
            salePrice: parseFloat(formData.get('salePrice') as string),
            category: formData.get('category') as string,
            // Only for create or if specifically adding cost
            initialCost: formData.get('initialCost') ? parseFloat(formData.get('initialCost') as string) : undefined,
            newCost: formData.get('newCost') ? parseFloat(formData.get('newCost') as string) : undefined,
            supplierId: formData.get('supplierId') ? parseInt(formData.get('supplierId') as string) : undefined,
            status: formData.get('status') as string,
        };

        try {
            let result;
            if (isEditing) {
                result = await updateItem(item.id, data);
            } else {
                result = await createItem(data);
            }

            if (result.success) {
                router.push('/items');
                router.refresh();
            } else {
                setError(result.error as string);
            }
        } catch (e) {
            setError('An unexpected error occurred');
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
                    <span>{isEditing ? t('item.editItem') : t('item.newItem')}</span>
                    {isArchived && (
                        <span className="text-sm font-normal px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                            {t('common.archived')}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <form action={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">{t('item.itemName')}</label>
                        <Input id="name" name="name" defaultValue={item?.name} required disabled={isArchived} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="brand" className="text-sm font-medium">{t('item.brand')}</label>
                            <Input id="brand" name="brand" defaultValue={item?.brand} required disabled={isArchived} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="model" className="text-sm font-medium">{t('item.model')}</label>
                            <Input id="model" name="model" defaultValue={item?.model} required disabled={isArchived} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-medium">{t('item.category')}</label>
                        <select
                            id="category"
                            name="category"
                            defaultValue={item?.category || ''}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                            disabled={isArchived}
                        >
                            <option value="" disabled>{t('common.select')}</option>
                            {Object.values(ItemCategory).map((cat) => (
                                <option key={cat} value={cat}>
                                    {t(`item.categories.${cat}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium">{t('common.description')}</label>
                        <Textarea id="description" name="description" defaultValue={item?.description || ''} disabled={isArchived} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="year" className="text-sm font-medium">{t('common.year')}</label>
                            <Input id="year" name="year" type="number" defaultValue={item?.year || new Date().getFullYear()} required disabled={isArchived} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="salePrice" className="text-sm font-medium">{t('item.salePrice')}</label>
                            <Input id="salePrice" name="salePrice" type="number" step="0.01" defaultValue={item?.salePrice} required disabled={isArchived} />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="space-y-2">
                            <label htmlFor="status" className="text-sm font-medium">{t('common.status')}</label>
                            <select
                                id="status"
                                name="status"
                                defaultValue={item?.status}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="ACTIVE">{t('common.active')}</option>
                                <option value="ARCHIVED">{t('common.archived')}</option>
                            </select>
                        </div>
                    )}

                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-sm font-medium mb-4">{isEditing ? t('item.recordNewPrice') : t('item.initialCost')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor={isEditing ? "newCost" : "initialCost"} className="text-sm font-medium">
                                    {t('item.costPrice')}
                                </label>
                                <Input
                                    id={isEditing ? "newCost" : "initialCost"}
                                    name={isEditing ? "newCost" : "initialCost"}
                                    type="number"
                                    step="0.01"
                                    placeholder={isEditing ? t('item.addNewPrice') : "0.00"}
                                    disabled={isArchived}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="supplierId" className="text-sm font-medium">{t('item.selectSupplier')}</label>
                                <select
                                    id="supplierId"
                                    name="supplierId"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={isArchived}
                                >
                                    <option value="">{t('common.select')}</option>
                                    {suppliers.map((supplier) => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
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
