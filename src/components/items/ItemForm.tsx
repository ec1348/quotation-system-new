'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { createItem, updateItem } from '@/actions/item';
import { Item, Supplier } from '@prisma/client';

interface ItemFormProps {
    item?: Item;
    suppliers: Supplier[];
}

export function ItemForm({ item, suppliers }: ItemFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            year: parseInt(formData.get('year') as string),
            price: parseFloat(formData.get('price') as string),
            type: formData.get('type') as string,
            supplierId: formData.get('supplierId') ? parseInt(formData.get('supplierId') as string) : undefined,
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

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{item ? 'Edit Item' : 'Add New Item'}</CardTitle>
            </CardHeader>
            <form action={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Item Name</label>
                            <Input id="name" name="name" defaultValue={item?.name} required placeholder="e.g. Servo Motor" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="year" className="text-sm font-medium">Year</label>
                            <Input id="year" name="year" type="number" defaultValue={item?.year || new Date().getFullYear()} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium">Description</label>
                        <Input id="description" name="description" defaultValue={item?.description || ''} placeholder="Optional details" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="price" className="text-sm font-medium">Price</label>
                            <Input id="price" name="price" type="number" step="0.01" defaultValue={item?.price} required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="type" className="text-sm font-medium">Type</label>
                            <select
                                id="type"
                                name="type"
                                defaultValue={item?.type || 'COMPONENT'}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="COMPONENT">Component</option>
                                <option value="LABOR">Labor</option>
                                <option value="EXPENSE">Expense</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="supplierId" className="text-sm font-medium">Supplier</label>
                        <select
                            id="supplierId"
                            name="supplierId"
                            defaultValue={item?.supplierId || ''}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Select a Supplier (Optional)</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
                <CardFooter className="justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Item'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
