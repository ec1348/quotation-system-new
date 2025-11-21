import Link from 'next/link';
import { getItems, deleteItem } from '@/actions/item';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Package, Wrench, DollarSign } from 'lucide-react';
import { Item, Supplier } from '@prisma/client';

type ItemWithSupplier = Item & { supplier: Supplier | null };

export default async function ItemsPage() {
    const { data } = await getItems();
    const items = data as ItemWithSupplier[] | undefined;

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'LABOR': return <Wrench className="h-4 w-4 text-blue-500" />;
            case 'EXPENSE': return <DollarSign className="h-4 w-4 text-green-500" />;
            default: return <Package className="h-4 w-4 text-orange-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Items & Services</h1>
                <Link href="/items/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Year</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Price</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Supplier</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {items?.map((item) => (
                                <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-2">
                                            {getItemIcon(item.type)}
                                            <span className="capitalize text-xs font-medium text-muted-foreground">{item.type.toLowerCase()}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle font-medium">{item.name}</td>
                                    <td className="p-4 align-middle text-muted-foreground">{item.description || '-'}</td>
                                    <td className="p-4 align-middle">{item.year}</td>
                                    <td className="p-4 align-middle text-right font-mono">
                                        ${item.price.toLocaleString()}
                                    </td>
                                    <td className="p-4 align-middle">
                                        {item.supplier ? (
                                            <Link href={`/suppliers/${item.supplier.id}/edit`} className="hover:underline text-primary">
                                                {item.supplier.name}
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/items/${item.id}/edit`}>
                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <form action={deleteItem.bind(null, item.id)}>
                                                <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!items || items.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                        No items found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
