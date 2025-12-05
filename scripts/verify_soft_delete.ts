
import { prisma } from '../src/lib/prisma'
import { getItems } from '../src/actions/item'

async function verifySoftDelete() {
    console.log('Starting Soft Delete Verification...')

    // 1. Create a test item directly (bypassing server action to avoid revalidatePath)
    console.log('Creating test item...')
    const newItem = await prisma.item.create({
        data: {
            name: 'Test Soft Delete Item',
            description: 'This item should be soft deleted',
            year: 2024,
            salePrice: 100,
            brand: 'Test Brand',
            model: 'Test Model',
            category: 'CONTROLLER',
            status: 'ACTIVE'
        }
    })

    const itemId = newItem.id
    console.log(`Item created with ID: ${itemId}`)

    // 2. Verify it is returned by getItems
    console.log('Fetching items to verify existence...')
    const itemsBefore = await getItems()
    if (!itemsBefore.success || !itemsBefore.data) {
        console.error('Failed to get items')
        return
    }
    const foundBefore = itemsBefore.data.find(i => i.id === itemId)
    if (!foundBefore) {
        console.error('Error: Created item NOT found in getItems()')
        return
    }
    console.log('Success: Item found in getItems()')

    // 3. Delete the item (Soft Delete) directly
    console.log('Soft deleting item...')
    await prisma.item.update({
        where: { id: itemId },
        data: { status: 'ARCHIVED' }
    })

    // 4. Verify it is ARCHIVED in DB
    const itemAfterDelete = await prisma.item.findUnique({ where: { id: itemId } })
    console.log(`Item status after delete: ${itemAfterDelete?.status}`)
    if (itemAfterDelete?.status !== 'ARCHIVED') {
        console.error('Error: Item should be ARCHIVED')
        return
    }

    // 5. Verify it is NOT returned by getItems
    console.log('Fetching items to verify exclusion...')
    const itemsAfter = await getItems()
    if (!itemsAfter.success || !itemsAfter.data) {
        console.error('Failed to get items')
        return
    }

    const foundAfter = itemsAfter.data.find(i => i.id === itemId)
    if (foundAfter) {
        console.error('Error: Deleted item WAS found in getItems()')
    } else {
        console.log('Success: Deleted item was NOT found in getItems()')
    }

    // Cleanup (Hard delete)
    console.log('Cleaning up...')
    await prisma.item.delete({ where: { id: itemId } })
    console.log('Verification Complete.')
}

verifySoftDelete()
