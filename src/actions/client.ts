'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getClients() {
    return await prisma.client.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function getClient(id: number) {
    return await prisma.client.findUnique({
        where: { id },
    });
}

export async function createClient(data: {
    name: string;
    address?: string;
    email?: string;
    phone?: string;
    businessNumber?: string;
}) {
    const client = await prisma.client.create({
        data,
    });

    revalidatePath('/clients');
    return client;
}

export async function updateClient(id: number, data: {
    name: string;
    address?: string;
    email?: string;
    phone?: string;
    businessNumber?: string;
}) {
    const client = await prisma.client.update({
        where: { id },
        data,
    });

    revalidatePath('/clients');
    return client;
}

export async function deleteClient(id: number) {
    await prisma.client.delete({
        where: { id },
    });

    revalidatePath('/clients');
}
