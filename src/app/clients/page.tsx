import { getClients } from '@/actions/client';
import { ClientList } from '@/components/clients/ClientList';

export default async function ClientsPage() {
    const clients = await getClients();

    return <ClientList clients={clients} />;
}
