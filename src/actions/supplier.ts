'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSuppliers() {
    return await prisma.supplier.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function getSupplier(id: number) {
    return await prisma.supplier.findUnique({
        where: { id },
    });
}

export async function createSupplier(data: {
    name: string;
    contact?: string;
    email?: string;
    phone?: string;
    businessNumber?: string;
    address?: string;
}) {
    const supplier = await prisma.supplier.create({
        data,
    });

    revalidatePath('/suppliers');
    return supplier;
}

export async function updateSupplier(id: number, data: {
    name: string;
    contact?: string;
    email?: string;
    phone?: string;
    businessNumber?: string;
    address?: string;
}) {
    const supplier = await prisma.supplier.update({
        where: { id },
        data,
    });

    revalidatePath('/suppliers');
    return supplier;
}

export async function deleteSupplier(id: number) {
    await prisma.supplier.delete({
        where: { id },
    });

    revalidatePath('/suppliers');
}
