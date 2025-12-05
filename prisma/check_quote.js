const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const items = await prisma.quoteItem.findMany({
        where: { quoteId: 1 }
    })
    console.log(JSON.stringify(items, null, 2))

    const quote = await prisma.quote.findUnique({
        where: { id: 1 }
    })
    console.log('Quote Total:', quote.totalAmount)
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
