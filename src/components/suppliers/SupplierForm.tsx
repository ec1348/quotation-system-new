'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { createSupplier, updateSupplier } from '@/actions/supplier';
import { Supplier } from '@prisma/client';

interface SupplierFormProps {
    supplier?: Supplier;
}

export function SupplierForm({ supplier }: SupplierFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        const data = {
            name: formData.get('name') as string,
            contact: formData.get('contact') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            businessNumber: formData.get('businessNumber') as string,
            address: formData.get('address') as string,
        };

        try {
            if (supplier) {
                await updateSupplier(supplier.id, data);
            } else {
                await createSupplier(data);
            }
            router.push('/suppliers');
        } catch (error) {
            console.error(error);
            alert('Failed to save supplier');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</CardTitle>
            </CardHeader>
            <form action={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Company Name</label>
                        <Input id="name" name="name" defaultValue={supplier?.name} required />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="businessNumber" className="text-sm font-medium">Business Number</label>
                        <Input id="businessNumber" name="businessNumber" defaultValue={supplier?.businessNumber || ''} />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="contact" className="text-sm font-medium">Contact Person</label>
                        <Input id="contact" name="contact" defaultValue={supplier?.contact || ''} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input id="email" name="email" type="email" defaultValue={supplier?.email || ''} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                            <Input id="phone" name="phone" defaultValue={supplier?.phone || ''} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="address" className="text-sm font-medium">Address</label>
                        <Input id="address" name="address" defaultValue={supplier?.address || ''} />
                    </div>
                </CardContent>
                <CardFooter className="justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Supplier'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
