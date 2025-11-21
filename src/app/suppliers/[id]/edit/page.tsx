import { getSupplier } from '@/actions/supplier';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import { notFound } from 'next/navigation';

interface EditSupplierPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditSupplierPage({ params }: EditSupplierPageProps) {
    const { id } = await params;
    const supplier = await getSupplier(parseInt(id));

    if (!supplier) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Supplier</h1>
            <SupplierForm supplier={supplier} />
        </div>
    );
}
