import { getItems } from '@/actions/item';
import { ItemList } from '@/components/items/ItemList';
import { Item, Supplier } from '@prisma/client';

type ItemWithSupplier = Item & { supplier: Supplier | null };

export default async function ItemsPage() {
    const { data } = await getItems();
    const items = data as ItemWithSupplier[] | undefined;

    return <ItemList items={items || []} />;
}
