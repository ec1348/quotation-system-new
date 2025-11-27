/* eslint-disable jsx-a11y/alt-text */
'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Quote, QuoteItem, Client } from '@prisma/client';

// Register Traditional Chinese font
// Using Noto Sans TC from jsDelivr (WOFF format)
Font.register({
    family: 'Noto Sans TC',
    src: 'https://fonts.gstatic.com/s/notosanstc/v38/-nFuOG829Oofr2wohFbTp9ifNAn722rq0MXz76Cy_Co.ttf'
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Noto Sans TC',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 12,
        color: '#666666',
    },
    clientInfo: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        backgroundColor: '#F3F4F6',
        padding: 5,
    },
    text: {
        fontSize: 10,
        marginBottom: 3,
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderColor: '#E5E7EB',
        marginBottom: 20,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableColHeader: {
        width: '40%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        padding: 5,
    },
    tableColHeaderSmall: {
        width: '15%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        padding: 5,
    },
    tableCol: {
        width: '40%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#E5E7EB',
        padding: 5,
    },
    tableColSmall: {
        width: '15%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#E5E7EB',
        padding: 5,
    },
    tableCellHeader: {
        margin: 'auto',
        fontSize: 10,
        fontWeight: 'bold',
    },
    tableCell: {
        margin: 'auto',
        fontSize: 10,
    },
    tableCellLeft: {
        margin: 0,
        fontSize: 10,
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 10,
    },
    totalValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#9CA3AF',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: 10,
    },
});

type QuoteWithDetails = Quote & {
    client: Client;
    items: QuoteItem[];
};

interface QuotePDFProps {
    quote: QuoteWithDetails;
}

export const QuotePDF = ({ quote }: QuotePDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>報價單 (Quotation)</Text>
                <Text style={styles.subtitle}>單號 (Quote #): {quote.id}</Text>
                <Text style={styles.subtitle}>日期 (Date): {new Date(quote.date).toLocaleDateString()}</Text>
            </View>

            {/* Client Info */}
            <View style={styles.clientInfo}>
                <Text style={styles.sectionTitle}>客戶資料 (Client Info)</Text>
                <Text style={styles.text}>客戶名稱 (Client): {quote.client.name}</Text>
                {/* <Text style={styles.text}>聯絡人 (Contact): {quote.client.contact || '-'}</Text> */}
                <Text style={styles.text}>電話 (Phone): {quote.client.phone || '-'}</Text>
                <Text style={styles.text}>地址 (Address): {quote.client.address || '-'}</Text>
            </View>

            {/* Items Table */}
            <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableRow}>
                    <View style={styles.tableColHeader}>
                        <Text style={styles.tableCellHeader}>項目 (Description)</Text>
                    </View>
                    <View style={styles.tableColHeaderSmall}>
                        <Text style={styles.tableCellHeader}>類型 (Type)</Text>
                    </View>
                    <View style={styles.tableColHeaderSmall}>
                        <Text style={styles.tableCellHeader}>數量 (Qty)</Text>
                    </View>
                    <View style={styles.tableColHeaderSmall}>
                        <Text style={styles.tableCellHeader}>單價 (Price)</Text>
                    </View>
                    <View style={styles.tableColHeaderSmall}>
                        <Text style={styles.tableCellHeader}>總計 (Total)</Text>
                    </View>
                </View>

                {/* Table Rows */}
                {quote.items.map((item) => (
                    <View style={styles.tableRow} key={item.id}>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCellLeft}>{item.description}</Text>
                        </View>
                        <View style={styles.tableColSmall}>
                            <Text style={styles.tableCell}>{item.type}</Text>
                        </View>
                        <View style={styles.tableColSmall}>
                            <Text style={styles.tableCell}>{item.quantity}</Text>
                        </View>
                        <View style={styles.tableColSmall}>
                            <Text style={styles.tableCell}>${item.unitPrice.toLocaleString()}</Text>
                        </View>
                        <View style={styles.tableColSmall}>
                            <Text style={styles.tableCell}>${item.total.toLocaleString()}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Total */}
            <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>總金額 (Grand Total):</Text>
                <Text style={styles.totalValue}>${quote.total.toLocaleString()}</Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>感謝您的惠顧 (Thank you for your business)</Text>
                <Text>此報價單由系統自動產生 (This quote is automatically generated)</Text>
            </View>
        </Page>
    </Document>
);
