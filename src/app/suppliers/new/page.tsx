import { SupplierForm } from '@/components/suppliers/SupplierForm';

export default function NewSupplierPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Add Supplier</h1>
            <SupplierForm />
        </div>
    );
}
