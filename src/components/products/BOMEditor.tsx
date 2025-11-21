'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { addProductMaterial, updateProductMaterial, removeProductMaterial } from '@/actions/product';
import { Item, ProductMaterial } from '@prisma/client';
import { Trash2, Plus } from 'lucide-react';

type MaterialWithItem = ProductMaterial & { item: Item };

interface BOMEditorProps {
    productId: number;
    materials: MaterialWithItem[];
    allItems: Item[];
}

export function BOMEditor({ productId, materials, allItems }: BOMEditorProps) {
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = async () => {
        if (!selectedItemId) return;
        setIsAdding(true);
        try {
            await addProductMaterial({
                productId,
                itemId: parseInt(selectedItemId),
                quantity,
            });
            setSelectedItemId('');
            setQuantity(1);
        } catch (error) {
            console.error(error);
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
        if (!confirm('Are you sure?')) return;
        try {
            await removeProductMaterial(id);
        } catch (error) {
            console.error(error);
            alert('Failed to remove material');
        }
    };

    const totalCost = materials.reduce((sum, m) => sum + (m.item.price * m.quantity), 0);

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Bill of Materials</CardTitle>
                <div className="text-lg font-bold">
                    Total Cost: ${totalCost.toLocaleString()}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Add Material Section */}
                <div className="flex gap-4 items-end border-b pb-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Select Item</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedItemId}
                            onChange={(e) => setSelectedItemId(e.target.value)}
                        >
                            <option value="">-- Select Item --</option>
                            {allItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({item.year}) - ${item.price}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-24 space-y-2">
                        <label className="text-sm font-medium">Qty</label>
                        <Input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                        />
                    </div>
                    <Button onClick={handleAdd} disabled={!selectedItemId || isAdding}>
                        <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                </div>

                {/* Materials List */}
                <div className="space-y-4">
                    {materials.map((material) => (
                        <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                            <div className="flex-1">
                                <div className="font-medium">{material.item.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    ${material.item.price} x {material.quantity} = ${(material.item.price * material.quantity).toLocaleString()}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Qty:</span>
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
                            No materials added yet.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
