'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { Client } from '@prisma/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { deleteClient } from '@/actions/client';

interface ClientListProps {
    clients: Client[];
}

export function ClientList({ clients }: ClientListProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t('nav.clients')}</h1>
                <Link href="/clients/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> {t('client.newClient')}
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {clients.map((client) => (
                    <Card key={client.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {client.name}
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                {client.email}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {client.phone}
                            </p>
                            {client.businessNumber && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('common.businessNumber')}: {client.businessNumber}
                                </p>
                            )}
                            {client.address && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                    {client.address}
                                </p>
                            )}
                            <div className="mt-4 flex space-x-2">
                                <Link href={`/clients/${client.id}/edit`}>
                                    <Button variant="outline" size="sm">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <form action={deleteClient.bind(null, client.id)}>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
