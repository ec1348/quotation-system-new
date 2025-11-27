'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Settings } from 'lucide-react';
import { Product, ProductMaterial, Item } from '@prisma/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { deleteProductAction } from '@/actions/product';

type ProductWithMaterials = Product & {
    materials: (ProductMaterial & { item: Item })[];
};

interface ProductListProps {
    products: ProductWithMaterials[];
}

export function ProductList({ products }: ProductListProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t('product.title')}</h1>
                <Link href="/products/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> {t('product.newProduct')}
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => {
                    const totalCost = product.materials.reduce((sum, m) => sum + (m.item.price * m.quantity), 0);

                    return (
                        <div key={product.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="flex flex-col space-y-1.5 p-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold leading-none tracking-tight">{product.name}</h3>
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">{product.description || '-'}</p>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-muted-foreground">{t('product.totalCost')}:</span>
                                    <span className="text-lg font-bold">${totalCost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                    <span>{product.materials.length} {t('item.component')}</span>
                                </div>
                            </div>
                            <div className="flex items-center p-6 pt-0 gap-2">
                                <Link href={`/products/${product.id}/edit`} className="w-full">
                                    <Button variant="outline" className="w-full">
                                        <Pencil className="mr-2 h-4 w-4" /> {t('common.edit')} / {t('product.bom')}
                                    </Button>
                                </Link>
                                <form action={deleteProductAction}>
                                    <input type="hidden" name="id" value={product.id} />
                                    <Button variant="destructive" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    );
                })}
                {products.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-12">
                        {t('product.noMaterials')}
                    </div>
                )}
            </div>
        </div>
    );
}
