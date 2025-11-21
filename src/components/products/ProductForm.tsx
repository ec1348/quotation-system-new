'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { createProduct, updateProduct } from '@/actions/product';
import { Product } from '@prisma/client';

interface ProductFormProps {
    product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
        };

        try {
            if (product) {
                await updateProduct(product.id, data);
            } else {
                const result = await createProduct(data);
                if (result.success && result.data) {
                    // Redirect to edit page to add materials if new
                    router.push(`/products/${result.data.id}/edit`);
                    return;
                }
            }
            router.push('/products');
        } catch (error) {
            console.error(error);
            alert('Failed to save product');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{product ? 'Edit Product' : 'Create New Product'}</CardTitle>
            </CardHeader>
            <form action={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Product Name</label>
                        <Input id="name" name="name" defaultValue={product?.name} required placeholder="e.g. Conveyor Belt System" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium">Description</label>
                        <Input id="description" name="description" defaultValue={product?.description || ''} placeholder="Machine description" />
                    </div>
                </CardContent>
                <CardFooter className="justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : (product ? 'Save Changes' : 'Create & Add Materials')}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
