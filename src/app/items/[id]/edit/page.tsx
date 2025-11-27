import { ItemForm } from '@/components/items/ItemForm';
import { getSuppliers } from '@/actions/supplier';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params before using its properties
    const { id } = await params;
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
        notFound();
    }

    const [item, suppliers] = await Promise.all([
        prisma.item.findUnique({
            where: { id: itemId },
        }),
        getSuppliers(),
    ]);

    if (!item) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Edit Item</h1>
            </div>
            <ItemForm item={item} suppliers={suppliers} />
        </div>
    );
}
