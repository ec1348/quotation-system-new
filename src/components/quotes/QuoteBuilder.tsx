'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { addQuoteItem, updateQuoteItem, removeQuoteItem, updateQuote } from '@/actions/quote';
import { Quote, QuoteItem, Client, Product, Item, ProductMaterial } from '@prisma/client';
import { Trash2, Plus, FileText, Save, Printer } from 'lucide-react';

type QuoteWithDetails = Quote & {
    client: Client;
    items: QuoteItem[];
};

type ProductWithMaterials = Product & {
    materials: (ProductMaterial & { item: Item })[];
};

interface QuoteBuilderProps {
    quote: QuoteWithDetails;
    products: ProductWithMaterials[];
    items: Item[];
}

export function QuoteBuilder({ quote, products, items }: QuoteBuilderProps) {
    const router = useRouter();
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [isAddingItem, setIsAddingItem] = useState(false);

    // Product Selection State
    const [selectedProductId, setSelectedProductId] = useState('');

    // Item Selection State
    const [selectedItemId, setSelectedItemId] = useState('');
    const [customDescription, setCustomDescription] = useState('');
    const [customPrice, setCustomPrice] = useState<number>(0);
    const [customQty, setCustomQty] = useState<number>(1);

    const handleAddProduct = async () => {
        if (!selectedProductId) return;
        const product = products.find(p => p.id === parseInt(selectedProductId));
        if (!product) return;

        // Calculate base cost from BOM
        const baseCost = product.materials.reduce((sum, m) => sum + (m.item.price * m.quantity), 0);

        await addQuoteItem({
            quoteId: quote.id,
            productId: product.id,
            description: product.name, // Or product.description
            quantity: 1,
            unitPrice: baseCost, // Default to BOM cost
            type: 'PRODUCT',
        });

        setIsAddingProduct(false);
        setSelectedProductId('');
    };

    const handleAddItem = async () => {
        if (!selectedItemId) return;
        const item = items.find(i => i.id === parseInt(selectedItemId));
        if (!item) return;

        await addQuoteItem({
            quoteId: quote.id,
            itemId: item.id,
            description: item.name,
            quantity: customQty,
            unitPrice: item.price,
            type: item.type,
        });

        setIsAddingItem(false);
        setSelectedItemId('');
        setCustomQty(1);
    };

    const handleUpdateItem = async (id: number, field: keyof QuoteItem, value: any) => {
        await updateQuoteItem(id, { [field]: value });
    };

    const handleRemoveItem = async (id: number) => {
        if (!confirm('Remove this item?')) return;
        await removeQuoteItem(id);
    };

    const handleStatusChange = async (status: string) => {
        await updateQuote(quote.id, { status });
    };

    return (
        <div className="space-y-6">
            {/* Header / Client Info */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Quote #{quote.id}</CardTitle>
                        <p className="text-sm text-muted-foreground">Client: {quote.client.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            value={quote.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="SENT">Sent</option>
                            <option value="ACCEPTED">Accepted</option>
                        </select>
                        <Button variant="outline">
                            <Printer className="mr-2 h-4 w-4" /> Print PDF
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Items List */}
            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="h-10 px-4 text-left font-medium">Description</th>
                                <th className="h-10 px-4 text-left font-medium">Type</th>
                                <th className="h-10 px-4 text-right font-medium w-24">Qty</th>
                                <th className="h-10 px-4 text-right font-medium w-32">Unit Price</th>
                                <th className="h-10 px-4 text-right font-medium w-32">Total</th>
                                <th className="h-10 px-4 text-right font-medium w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {quote.items.map((item) => (
                                <tr key={item.id} className="border-b last:border-0">
                                    <td className="p-4">
                                        <Input
                                            defaultValue={item.description}
                                            onBlur={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-4 text-muted-foreground text-xs uppercase">{item.type}</td>
                                    <td className="p-4 text-right">
                                        <Input
                                            type="number"
                                            className="text-right"
                                            defaultValue={item.quantity}
                                            onBlur={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value))}
                                        />
                                    </td>
                                    <td className="p-4 text-right">
                                        <Input
                                            type="number"
                                            className="text-right"
                                            defaultValue={item.unitPrice}
                                            onBlur={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                                        />
                                    </td>
                                    <td className="p-4 text-right font-medium">
                                        ${item.total.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {quote.items.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No items in this quote. Add products or items below.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-muted/50 font-medium">
                            <tr>
                                <td colSpan={4} className="p-4 text-right">Total:</td>
                                <td className="p-4 text-right text-lg">${quote.total.toLocaleString()}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
                {/* Add Product Button */}
                <div className="flex-1 p-4 border rounded-lg bg-card space-y-4">
                    <h3 className="font-semibold flex items-center"><Plus className="mr-2 h-4 w-4" /> Add Machine (Product)</h3>
                    <div className="flex gap-2">
                        <select
                            className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                        >
                            <option value="">-- Select Machine --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <Button onClick={handleAddProduct} disabled={!selectedProductId}>Add</Button>
                    </div>
                </div>

                {/* Add Item Button */}
                <div className="flex-1 p-4 border rounded-lg bg-card space-y-4">
                    <h3 className="font-semibold flex items-center"><Plus className="mr-2 h-4 w-4" /> Add Spare Part / Service</h3>
                    <div className="flex gap-2">
                        <select
                            className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                            value={selectedItemId}
                            onChange={(e) => setSelectedItemId(e.target.value)}
                        >
                            <option value="">-- Select Item --</option>
                            {items.map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.year})</option>
                            ))}
                        </select>
                        <Button onClick={handleAddItem} disabled={!selectedItemId}>Add</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
