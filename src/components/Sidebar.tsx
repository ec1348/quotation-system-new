'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Package, FileText, Truck, Settings, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export function Sidebar() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navigation = [
        { name: t('nav.dashboard'), href: '/', icon: LayoutDashboard }, // Changed href to / as per page.tsx location
        { name: t('nav.suppliers'), href: '/suppliers', icon: Truck },
        { name: t('nav.clients'), href: '/clients', icon: Users },
        { name: t('nav.items'), href: '/items', icon: Package },
        { name: t('nav.products'), href: '/products', icon: Package },
        { name: t('nav.quotes'), href: '/quotes', icon: FileText },
        { name: t('item.priceHistory'), href: '/price-history', icon: History },
    ];

    return (
        <div className="flex h-full w-64 flex-col bg-card border-r">
            <div className="flex h-16 items-center justify-center border-b px-6">
                <h1 className="text-xl font-bold text-primary">AutoControl Quote</h1>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0",
                                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
