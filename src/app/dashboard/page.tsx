'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardPage() {
    const { t } = useLanguage();

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('nav.dashboard')}</h1>
            <p className="text-muted-foreground mt-4">Welcome to the AutoControl Quotation System.</p>
        </div>
    );
}
