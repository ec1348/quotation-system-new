'use client';

import React, { useState } from 'react';
import { History, Plus, ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { createPriceHistory } from '@/actions/priceHistory';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface CostEntry {
    id: number;
    date: Date;
    supplier: {
        name: string;
    };
    unitCost: number;
    currency: string;
    sourceType: string;
}

interface ItemCostHistoryProps {
    suppliers?: { id: number; name: string }[];
    initialHistory?: any[];
    relatedHistory?: any[];
    isArchived?: boolean;
}

export function ItemCostHistory({ suppliers = [], initialHistory = [], relatedHistory = [], isArchived = false }: ItemCostHistoryProps) {
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterSupplier, setFilterSupplier] = useState<string>("");
    const [filterStartDate, setFilterStartDate] = useState<string>("");
    const [filterEndDate, setFilterEndDate] = useState<string>("");
    const params = useParams();
    const router = useRouter();

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        supplierId: "",
        price: "",
        type: "QUOTATION"
    });

    const [activeTab, setActiveTab] = useState<'specific' | 'global'>('specific');

    const handleSave = async () => {
        if (!formData.supplierId || !formData.price || !formData.date) return;

        const result = await createPriceHistory({
            itemId: parseInt(params.id as string),
            date: new Date(formData.date),
            supplierId: parseInt(formData.supplierId),
            price: parseFloat(formData.price),
            type: formData.type
        });

        if (result.success) {
            setIsModalOpen(false);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                supplierId: "",
                price: "",
                type: "QUOTATION"
            });
            router.refresh();
        } else {
            alert('Failed to save record');
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getPriceChangeIcon = (currentPrice: number, index: number, allData: any[]) => {
        if (index === allData.length - 1) return null;
        const previousPrice = allData[index + 1].unitCost;

        if (currentPrice < previousPrice) {
            return <ArrowDown className="h-4 w-4 text-green-500 ml-2" />;
        } else if (currentPrice > previousPrice) {
            return <ArrowUp className="h-4 w-4 text-red-500 ml-2" />;
        }
        return null;
    };

    const mapHistoryData = (data: any[]) => data.map(h => ({
        id: h.id,
        date: new Date(h.date),
        supplier: h.supplier,
        unitCost: h.price,
        currency: h.currency || 'TWD',
        sourceType: h.type,
        item: h.item // Include item info for global view
    }));

    const historyData = mapHistoryData(activeTab === 'specific' ? initialHistory : relatedHistory);

    const filteredData = historyData.filter(entry => {
        const entryDateStr = entry.date.toISOString().split('T')[0];
        const matchesSupplier = filterSupplier ? entry.supplier.name === filterSupplier : true;
        const matchesStartDate = filterStartDate ? entryDateStr >= filterStartDate : true;
        const matchesEndDate = filterEndDate ? entryDateStr <= filterEndDate : true;
        return matchesSupplier && matchesStartDate && matchesEndDate;
    });

    const getSourceTypeLabel = (type: string) => {
        if (type === 'PURCHASE') return t('common.purchase');
        if (type === 'QUOTATION') return t('quote.title');
        return type;
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col space-y-4 pb-2">
                <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <History className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>{t('item.priceHistory')}</CardTitle>
                        </div>
                        <div className="flex bg-muted rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('specific')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === 'specific'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {t('item.specificItem')}
                            </button>
                            <button
                                onClick={() => setActiveTab('global')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === 'global'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {t('item.allItemsSameName')}
                            </button>
                        </div>
                    </div>
                    {!isArchived && activeTab === 'specific' && (
                        <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('item.addNewPrice')}
                        </Button>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                    <div className="w-[200px]">
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={filterSupplier}
                            onChange={(e) => setFilterSupplier(e.target.value)}
                        >
                            <option value="">{t('common.allSuppliers')}</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.name}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            className="w-[150px] h-9"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                            placeholder={t('common.startDate')}
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                            type="date"
                            className="w-[150px] h-9"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                            placeholder={t('common.endDate')}
                        />
                    </div>
                    {(filterSupplier || filterStartDate || filterEndDate) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setFilterSupplier("");
                                setFilterStartDate("");
                                setFilterEndDate("");
                            }}
                            className="h-9 px-2 lg:px-3"
                        >
                            {t('common.reset')}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">{t('common.date')}</TableHead>
                            {activeTab === 'global' && (
                                <>
                                    <TableHead>{t('item.brand')}</TableHead>
                                    <TableHead>{t('item.model')}</TableHead>
                                </>
                            )}
                            <TableHead>{t('supplier.title')}</TableHead>
                            <TableHead>{t('common.type')}</TableHead>
                            <TableHead className="text-right">{t('common.unitPrice')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((entry, index) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="text-muted-foreground font-medium">
                                        {entry.date.toISOString().split('T')[0]}
                                    </TableCell>
                                    {activeTab === 'global' && (
                                        <>
                                            <TableCell>{entry.item?.brand}</TableCell>
                                            <TableCell>{entry.item?.model}</TableCell>
                                        </>
                                    )}
                                    <TableCell className="font-bold">
                                        {entry.supplier.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={entry.sourceType === 'PURCHASE' ? 'success' : 'secondary'}
                                        >
                                            {getSourceTypeLabel(entry.sourceType)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right flex items-center justify-end">
                                        {formatCurrency(entry.unitCost, entry.currency)}
                                        {getPriceChangeIcon(entry.unitCost, index, filteredData)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={activeTab === 'global' ? 6 : 4} className="h-24 text-center">
                                    {t('common.noResults')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t('item.recordNewPrice')}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('common.date')}</label>
                        <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('supplier.title')}</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.supplierId}
                            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                        >
                            <option value="">{t('item.selectSupplier')}</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('common.price')}</label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('common.type')}</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="QUOTATION">{t('quote.title')}</option>
                            <option value="PURCHASE">{t('common.purchase')}</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleSave}>{t('common.save')}</Button>
                    </div>
                </div>
            </Modal>
        </Card>
    );
}
