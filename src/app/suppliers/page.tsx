import { getSuppliers } from '@/actions/supplier';
import { SupplierList } from '@/components/suppliers/SupplierList';

export default async function SuppliersPage() {
    const suppliers = await getSuppliers();

    return <SupplierList suppliers={suppliers} />;
}
