'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { addQuoteItem, updateQuoteItem, removeQuoteItem, updateQuote } from '@/actions/quote';
import { Quote, QuoteItem, Client, Product, Item, ProductMaterial } from '@prisma/client';
import { Trash2, Plus, FileText, Save, Printer, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { QuotePDF } from './QuotePDF';

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
    const { t } = useLanguage();
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
            description: product.name,
            quantity: 1,
            unitPrice: baseCost,
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
        if (!confirm(t('common.confirm') + '?')) return;
        await removeQuoteItem(id);
    };

    const handleStatusChange = async (status: string) => {
        await updateQuote(quote.id, { status });
    };

    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [PDFViewer, setPDFViewer] = useState<any>(null);

    useEffect(() => {
        // Dynamically load PDFViewer to avoid SSR issues
        import('@react-pdf/renderer').then((mod) => {
            setPDFViewer(() => mod.PDFViewer);
        });
    }, []);

    const handlePrintPDF = async () => {
        try {
            console.log('Starting PDF generation...');
            const { pdf } = await import('@react-pdf/renderer');
            const { QuotePDF } = await import('./QuotePDF');

            const blob = await pdf(<QuotePDF quote={quote} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Quote_${quote.id}_${quote.client.name.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log('PDF generated and download triggered.');
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Client Info */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{t('quote.quoteNumber')} {quote.id}</CardTitle>
                        <p className="text-sm text-muted-foreground">{t('quote.client')}: {quote.client.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            value={quote.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            <option value="DRAFT">{t('quote.status.draft')}</option>
                            <option value="SENT">{t('quote.status.sent')}</option>
                            <option value="ACCEPTED">{t('quote.status.accepted')}</option>
                        </select>
                        <Button variant="outline" onClick={() => setShowPdfPreview(true)}>
                            <FileText className="mr-2 h-4 w-4" /> {t('common.preview')}
                        </Button>
                        <Button variant="outline" onClick={handlePrintPDF}>
                            <Printer className="mr-2 h-4 w-4" /> {t('quote.printPdf')}
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
                                <th className="h-10 px-4 text-left font-medium">{t('common.description')}</th>
                                <th className="h-10 px-4 text-left font-medium">{t('common.type')}</th>
                                <th className="h-10 px-4 text-right font-medium w-24">{t('common.quantity')}</th>
                                <th className="h-10 px-4 text-right font-medium w-32">{t('common.unitPrice')}</th>
                                <th className="h-10 px-4 text-right font-medium w-32">{t('common.total')}</th>
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
                                        {t('quote.noItems')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-muted/50 font-medium">
                            <tr>
                                <td colSpan={4} className="p-4 text-right">{t('common.total')}:</td>
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
                    <h3 className="font-semibold flex items-center"><Plus className="mr-2 h-4 w-4" /> {t('quote.addProduct')}</h3>
                    <div className="flex gap-2">
                        <select
                            className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                        >
                            <option value="">-- {t('product.selectItem')} --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <Button onClick={handleAddProduct} disabled={!selectedProductId}>{t('common.add')}</Button>
                    </div>
                </div>

                {/* Add Item Button */}
                <div className="flex-1 p-4 border rounded-lg bg-card space-y-4">
                    <h3 className="font-semibold flex items-center"><Plus className="mr-2 h-4 w-4" /> {t('quote.addService')}</h3>
                    <div className="flex gap-2">
                        <select
                            className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                            value={selectedItemId}
                            onChange={(e) => setSelectedItemId(e.target.value)}
                        >
                            <option value="">-- {t('product.selectItem')} --</option>
                            {items.map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.year})</option>
                            ))}
                        </select>
                        <Button onClick={handleAddItem} disabled={!selectedItemId}>{t('common.add')}</Button>
                    </div>
                </div>
            </div>

            {/* PDF Preview Modal */}
            {showPdfPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowPdfPreview(false)}>
                    <div className="relative w-full max-w-5xl h-[85vh] bg-background rounded-lg shadow-lg flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">{t('common.preview')} PDF</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowPdfPreview(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-hidden bg-gray-100 p-4">
                            {PDFViewer ? (
                                <PDFViewer width="100%" height="100%" className="border rounded shadow-sm">
                                    {/* @ts-ignore - Dynamic import component type issue */}
                                    <QuotePDF quote={quote} />
                                </PDFViewer>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p>{t('common.loading')}...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
