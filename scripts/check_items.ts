import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.item.count();
    console.log(`Found ${count} items.`);

    if (count === 0) {
        console.log('Creating a dummy supplier and item...');
        const supplier = await prisma.supplier.create({
            data: {
                name: 'Test Supplier',
                contact: 'Test Contact',
            },
        });

        const item = await prisma.item.create({
            data: {
                name: 'Test Item',
                description: 'A test item for verification',
                year: 2024,
                price: 100,
                type: 'COMPONENT',
                supplierId: supplier.id,
            },
        });
        console.log(`Created item with ID: ${item.id}`);
    } else {
        const item = await prisma.item.findFirst();
        console.log(`Using existing item with ID: ${item?.id}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
