import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Auto Control Quotation System",
    description: "Manage clients, parts, and generate quotations.",
};

import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <LanguageProvider>
                    <div className="flex h-screen overflow-hidden bg-background">
                        <Sidebar />
                        <main className="flex-1 overflow-y-auto p-8">
                            <div className="flex justify-end mb-4">
                                <LanguageSwitcher />
                            </div>
                            {children}
                        </main>
                    </div>
                </LanguageProvider>
            </body>
        </html>
    );
}
