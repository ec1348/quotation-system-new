import { ItemForm } from '@/components/items/ItemForm';
import { getSuppliers } from '@/actions/supplier';

export default async function NewItemPage() {
    const suppliers = await getSuppliers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">New Item</h1>
            </div>
            <ItemForm suppliers={suppliers} />
        </div>
    );
}
