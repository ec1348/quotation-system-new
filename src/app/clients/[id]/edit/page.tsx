import { getClient } from '@/actions/client';
import { ClientForm } from '@/components/clients/ClientForm';
import { notFound } from 'next/navigation';

interface EditClientPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
    const { id } = await params;
    const client = await getClient(parseInt(id));

    if (!client) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Client</h1>
            <ClientForm client={client} />
        </div>
    );
}
