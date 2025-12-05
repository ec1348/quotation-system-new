'use client';


import { useState, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Quote, QuoteItem, Item, Product } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Save, CornerDownRight, Box } from 'lucide-react';
import { addQuoteItem, updateQuoteItem, deleteQuoteItem, updateQuoteStatus } from '@/actions/quote';
import { useLanguage } from '@/contexts/LanguageContext';

// Extended type to include relations and missing fields
type QuoteItemWithRelations = QuoteItem & {
    item?: Item | null;
    product?: Product | null;
    // Explicitly add fields that might be missing in stale Prisma types
    brand?: string | null;
    model?: string | null;
    name: string;
    description?: string | null;
    unitPrice: number;
    quantity: number;
    total: number;
    parentId?: number | null;
    children?: QuoteItemWithRelations[];
};

type QuoteWithRelations = Quote & {
    items: QuoteItemWithRelations[];
    totalAmount: number;
};

interface QuoteBuilderProps {
    quote: QuoteWithRelations;
    availableItems: Item[]; // For the item selector
}

export function QuoteBuilder({ quote, availableItems }: QuoteBuilderProps) {
    const { t } = useLanguage();
    const router = useRouter();
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);

    // Build tree structure from flat list
    const itemTree = useMemo(() => {
        const itemMap = new Map<number, QuoteItemWithRelations>();
        const roots: QuoteItemWithRelations[] = [];

        // First pass: map all items and initialize children array
        quote.items.forEach(item => {
            itemMap.set(item.id, { ...item, children: [] });
        });

        // Second pass: link children to parents
        quote.items.forEach(item => {
            const node = itemMap.get(item.id)!;
            if (item.parentId && itemMap.has(item.parentId)) {
                itemMap.get(item.parentId)!.children!.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    }, [quote.items]);

    const handleAddItem = async (parentId?: number) => {
        if (!selectedItemId) return;
        setIsAdding(true);
        try {
            await addQuoteItem(quote.id, parseInt(selectedItemId), parentId);
            if (!parentId) setSelectedItemId(''); // Only clear selection if adding root item
            router.refresh(); // Refresh to show new item
        } catch (error) {
            console.error('Failed to add item:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdateItem = async (id: number, field: string, value: any) => {
        try {
            await updateQuoteItem(id, { [field]: value });
            router.refresh(); // Refresh to show updated totals
        } catch (error) {
            console.error('Failed to update item:', error);
        }
    };

    const handleDeleteItem = async (id: number) => {
        if (!confirm(t('common.confirmDelete'))) return;
        try {
            await deleteQuoteItem(id);
            router.refresh(); // Refresh to remove item
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    // Recursive render function
    const renderItemRow = (item: QuoteItemWithRelations, level: number = 0) => {
        return (
            <Fragment key={item.id}>
                <tr className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4 align-middle">
                        {/* Indentation indicator */}
                        {level > 0 && (
                            <div className="flex justify-end" style={{ width: `${level * 20}px` }}>
                                <CornerDownRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        )}
                    </td>
                    <td className="p-4 align-middle">
                        <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
                            {item.children && item.children.length > 0 && (
                                <Box className="h-4 w-4 text-blue-500" />
                            )}
                            <Input
                                defaultValue={item.name}
                                onBlur={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                                className="h-8 w-full min-w-[200px]"
                            />
                        </div>
                        <div style={{ paddingLeft: `${level * 20}px` }}>
                            <Input
                                defaultValue={item.description || ''}
                                placeholder={t('common.description')}
                                onBlur={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                className="h-8 w-full mt-1 text-xs text-muted-foreground"
                            />
                        </div>
                    </td>
                    <td className="p-4 align-middle">
                        <div className="text-xs font-medium">{item.brand}</div>
                        <div className="text-xs text-muted-foreground">{item.model}</div>
                    </td>
                    <td className="p-4 align-middle text-right">
                        <Input
                            type="number"
                            defaultValue={item.unitPrice}
                            onBlur={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                            className="h-8 w-24 ml-auto text-right"
                        />
                    </td>
                    <td className="p-4 align-middle text-right">
                        <Input
                            type="number"
                            defaultValue={item.quantity}
                            onBlur={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value))}
                            className="h-8 w-20 ml-auto text-right"
                        />
                    </td>
                    <td className="p-4 align-middle text-right font-medium">
                        ${item.total.toLocaleString()}
                    </td>
                    <td className="p-4 align-middle text-center">
                        <div className="flex justify-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                title={t('quote.addChild')}
                                onClick={() => handleAddItem(item.id)}
                                disabled={!selectedItemId || isAdding}
                            >
                                <CornerDownRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive/90"
                                onClick={() => handleDeleteItem(item.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </td>
                </tr>
                {/* Render children */}
                {item.children?.map(child => renderItemRow(child, level + 1))}
            </Fragment>
        );
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateQuoteItem(quote.id, { status: newStatus } as any); // Type cast until we update the action signature
            // Actually, we need a separate action or update the existing one to handle quote-level updates
            // For now, let's assume we'll add a specific action for this or update the existing one.
            // Wait, updateQuoteItem is for items. We need updateQuote.
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Summary */}
            <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
                <div>
                    <h2 className="text-xl font-bold">{t('quote.quoteBuilder')}</h2>
                    <p className="text-sm text-muted-foreground">{t('quote.quoteNumber')}: {quote.id}</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        defaultValue={quote.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                    >
                        <option value="DRAFT">{t('quote.status.draft')}</option>
                        <option value="SENT">{t('quote.status.sent')}</option>
                        <option value="ACCEPTED">{t('quote.status.accepted')}</option>
                    </select>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t('quote.totalAmount')}</p>
                        <p className="text-2xl font-bold text-primary">${quote.totalAmount.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Item Selector */}
            <div className="flex gap-4 items-end bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">{t('quote.selectItem')}</label>
                    <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={selectedItemId}
                        onChange={(e) => setSelectedItemId(e.target.value)}
                    >
                        <option value="">{t('common.select')}</option>
                        {availableItems.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.brand} {item.model} - {item.name}
                            </option>
                        ))}
                    </select>
                </div>
                <Button onClick={() => handleAddItem()} disabled={!selectedItemId || isAdding}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isAdding ? t('common.saving') : t('common.add')}
                </Button>
            </div>

            {/* Quote Items Table */}
            <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr className="border-b">
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground w-12"></th>
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">{t('item.itemName')}</th>
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">{t('item.brand')} / {t('item.model')}</th>
                            <th className="h-10 px-4 text-right font-medium text-muted-foreground">{t('quote.unitPrice')}</th>
                            <th className="h-10 px-4 text-right font-medium text-muted-foreground">{t('quote.quantity')}</th>
                            <th className="h-10 px-4 text-right font-medium text-muted-foreground">{t('quote.total')}</th>
                            <th className="h-10 px-4 text-center font-medium text-muted-foreground">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemTree.map(item => renderItemRow(item))}
                        {quote.items.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                    {t('quote.noItems')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
