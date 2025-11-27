'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Pencil, Trash2, Truck } from 'lucide-react';
import { Supplier } from '@prisma/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { deleteSupplier } from '@/actions/supplier';

interface SupplierListProps {
    suppliers: Supplier[];
}

export function SupplierList({ suppliers }: SupplierListProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t('nav.suppliers')}</h1>
                <Link href="/suppliers/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> {t('supplier.newSupplier')}
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((supplier) => (
                    <Card key={supplier.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {supplier.name}
                            </CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-bold">{supplier.contact}</div>
                            <p className="text-xs text-muted-foreground">
                                {supplier.email}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {supplier.phone}
                            </p>
                            {supplier.businessNumber && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('common.businessNumber')}: {supplier.businessNumber}
                                </p>
                            )}
                            <div className="mt-4 flex space-x-2">
                                <Link href={`/suppliers/${supplier.id}/edit`}>
                                    <Button variant="outline" size="sm">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <form action={deleteSupplier.bind(null, supplier.id)}>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
