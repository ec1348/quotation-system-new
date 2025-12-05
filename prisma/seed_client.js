const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const client = await prisma.client.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Test Client',
            email: 'test@client.com',
            address: '123 Test St',
        },
    })
    console.log({ client })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
