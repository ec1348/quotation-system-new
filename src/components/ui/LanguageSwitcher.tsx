'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex gap-2">
            <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
                className="w-12"
            >
                EN
            </Button>
            <Button
                variant={language === 'zh-TW' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('zh-TW')}
                className="w-12"
            >
                繁中
            </Button>
        </div>
    );
}
