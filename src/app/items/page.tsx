import { getItems } from '@/actions/item';
import { ItemList } from '@/components/items/ItemList';
import { Item, Supplier } from '@prisma/client';

type ItemWithSupplier = Item & { supplier: Supplier | null };

export default async function ItemsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const { status = 'ACTIVE' } = await searchParams
    const { data } = await getItems(status)
    const items = data as ItemWithSupplier[] | undefined
    return <ItemList items={items || []} currentStatus={status} />
}
