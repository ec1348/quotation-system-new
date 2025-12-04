'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Package, Wrench, DollarSign } from 'lucide-react';
import { Item, Supplier } from '@prisma/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { deleteItemAction } from '@/actions/item';
import { Badge } from '@/components/ui/Badge';

type ItemWithSupplier = Item & { supplier: Supplier | null };

interface ItemListProps {
    items: ItemWithSupplier[];
    currentStatus: string;
}

export function ItemList({ items, currentStatus }: ItemListProps) {
    const { t } = useLanguage();

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'LABOR': return <Wrench className="h-4 w-4 text-blue-500" />;
            case 'EXPENSE': return <DollarSign className="h-4 w-4 text-green-500" />;
            default: return <Package className="h-4 w-4 text-orange-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'ARCHIVED') {
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{t('common.archived')}</Badge>;
        }
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">{t('common.active')}</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">{t('nav.items')}</h1>
                    <div className="flex items-center rounded-lg border bg-card p-1 text-card-foreground shadow-sm">
                        <Link href="/items?status=ACTIVE">
                            <Button
                                variant={currentStatus === 'ACTIVE' ? 'secondary' : 'ghost'}
                                size="sm"
                                className={currentStatus === 'ACTIVE' ? 'bg-white shadow-sm' : ''}
                            >
                                {t('common.active')}
                            </Button>
                        </Link>
                        <Link href="/items?status=ARCHIVED">
                            <Button
                                variant={currentStatus === 'ARCHIVED' ? 'secondary' : 'ghost'}
                                size="sm"
                                className={currentStatus === 'ARCHIVED' ? 'bg-white shadow-sm' : ''}
                            >
                                {t('common.archived')}
                            </Button>
                        </Link>
                        <Link href="/items?status=ALL">
                            <Button
                                variant={currentStatus === 'ALL' ? 'secondary' : 'ghost'}
                                size="sm"
                                className={currentStatus === 'ALL' ? 'bg-white shadow-sm' : ''}
                            >
                                {t('common.all')}
                            </Button>
                        </Link>
                    </div>
                </div>
                <Link href="/items/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('item.newItem')}
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t('common.type')}</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t('common.name')}</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t('common.status')}</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t('common.description')}</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t('common.year')}</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">{t('common.price')}</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{t('supplier.title')}</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">{t('common.actions')}</th>
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
                                    <td className="p-4 align-middle font-medium">
                                        <Link href={`/items/${item.id}`} className="hover:underline text-primary">
                                            {item.name}
                                        </Link>
                                    </td>
                                    <td className="p-4 align-middle">
                                        {getStatusBadge(item.status)}
                                    </td>
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
                                            {item.status !== 'ARCHIVED' && (
                                                <form action={deleteItemAction}>
                                                    <input type="hidden" name="id" value={item.id} />
                                                    <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!items || items.length === 0) && (
                                <tr>
                                    <td colSpan={8} className="p-4 text-center text-muted-foreground">
                                        {t('common.noResults')}
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
