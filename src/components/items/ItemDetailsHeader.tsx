'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/contexts/LanguageContext';

import { activateItem } from '@/actions/item';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ItemDetailsHeaderProps {
    item: {
        id: number;
        name: string;
        type: string;
        description: string | null;
        price: number;
        year: number;
        status: string;
        supplier: {
            name: string;
        } | null;
    };
}

export function ItemDetailsHeader({ item }: ItemDetailsHeaderProps) {
    const { t } = useLanguage();
    const router = useRouter();
    const [isActivating, setIsActivating] = useState(false);
    const isArchived = item.status === 'ARCHIVED';

    const handleActivate = async () => {
        setIsActivating(true);
        try {
            await activateItem(item.id);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to activate item');
        } finally {
            setIsActivating(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <Link href="/items">
                    <Button variant="ghost" className="pl-0">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('common.backToItems')}
                    </Button>
                </Link>
                {isArchived && (
                    <Button
                        onClick={handleActivate}
                        disabled={isActivating}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isActivating ? t('common.loading') : t('common.activate')}
                    </Button>
                )}
            </div>
            <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
                    <Badge variant="outline">{item.type}</Badge>
                    {isArchived && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            {t('common.archived')}
                        </Badge>
                    )}
                </div>
                <p className="text-muted-foreground">{item.description}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{t('item.currentPrice')}: ${item.price}</span>
                    <span>•</span>
                    <span>{t('common.year')}: {item.year}</span>
                    {item.supplier && (
                        <>
                            <span>•</span>
                            <span>{t('supplier.title')}: {item.supplier.name}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
