'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dictionary, Locale } from '@/lib/dictionary';

type LanguageContextType = {
    language: Locale;
    setLanguage: (lang: Locale) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Locale>('en');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Locale;
        if (savedLang && (savedLang === 'en' || savedLang === 'zh-TW')) {
            setLanguage(savedLang);
        }
        setIsLoaded(true);
    }, []);

    const handleSetLanguage = (lang: Locale) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (path: string): string => {
        const keys = path.split('.');
        let current: any = dictionary[language];

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation missing for key: ${path} in language: ${language}`);
                return path;
            }
            current = current[key];
        }

        return current as string;
    };

    if (!isLoaded) {
        return null; // Or a loading spinner
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
