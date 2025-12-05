'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { addProductMaterial, updateProductMaterial, removeProductMaterial } from '@/actions/product';
import { Item, ProductMaterial } from '@prisma/client';
import { Trash2, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type MaterialWithItem = ProductMaterial & { item: Item };

interface BOMEditorProps {
    productId: number;
    materials: MaterialWithItem[];
    allItems: Item[];
}

export function BOMEditor({ productId, materials, allItems }: BOMEditorProps) {
    const { t } = useLanguage();
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = async () => {
        if (!selectedItemId) {
            alert('Please select an item');
            return;
        }

        // Use state, but validate it
        if (!quantity || quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        setIsAdding(true);
        try {
            console.log('Adding material:', { productId, itemId: selectedItemId, quantity });
            const result = await addProductMaterial({
                productId,
                itemId: parseInt(selectedItemId),
                quantity,
            });

            if (result.success) {
                console.log('Material added successfully');
                setSelectedItemId('');
                setQuantity(1);
            } else {
                console.error('Failed to add material:', result.error);
                alert('Failed to add material: ' + result.error);
            }
        } catch (error) {
            console.error('Error in handleAdd:', error);
            alert('Failed to add material');
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdate = async (id: number, newQuantity: number) => {
        try {
            await updateProductMaterial(id, newQuantity);
        } catch (error) {
            console.error(error);
            alert('Failed to update quantity');
        }
    };

    const handleRemove = async (id: number) => {
        if (!confirm(t('common.confirm') + '?')) return;
        try {
            await removeProductMaterial(id);
        } catch (error) {
            console.error(error);
            alert('Failed to remove material');
        }
    };

    const totalCost = materials.reduce((sum, m) => sum + (m.item.salePrice * m.quantity), 0);

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('product.bom')}</CardTitle>
                <div className="text-lg font-bold">
                    {t('product.totalCost')}: ${totalCost.toLocaleString()}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Add Material Section */}
                <div className="flex gap-4 items-end border-b pb-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">{t('product.selectItem')}</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedItemId}
                            onChange={(e) => setSelectedItemId(e.target.value)}
                        >
                            <option value="">-- {t('product.selectItem')} --</option>
                            {allItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({item.year}) - ${item.salePrice}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-24 space-y-2">
                        <label className="text-sm font-medium">{t('common.quantity')}</label>
                        <Input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                        />
                    </div>
                    <Button onClick={handleAdd} disabled={!selectedItemId || isAdding}>
                        <Plus className="mr-2 h-4 w-4" /> {t('common.add')}
                    </Button>
                </div>

                {/* Materials List */}
                <div className="space-y-4">
                    {materials.map((material) => (
                        <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                            <div className="flex-1">
                                <div className="font-medium">{material.item.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    ${material.item.salePrice} x {material.quantity} = ${(material.item.salePrice * material.quantity).toLocaleString()}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">{t('common.quantity')}:</span>
                                    <Input
                                        type="number"
                                        className="w-20 h-8"
                                        defaultValue={material.quantity}
                                        onBlur={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (val !== material.quantity && val > 0) {
                                                handleUpdate(material.id, val);
                                            }
                                        }}
                                    />
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRemove(material.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {materials.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            {t('product.noMaterials')}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
