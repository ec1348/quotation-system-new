
import { prisma } from '../src/lib/prisma'
import { getItems } from '../src/actions/item'

async function verifyFiltering() {
    console.log('Starting Filtering Verification...')

    // 1. Create test items
    console.log('Creating test items...')
    const activeItem = await prisma.item.create({
        data: {
            name: 'Active Item',
            year: 2024,
            salePrice: 100,
            brand: 'Test Brand',
            model: 'Test Model',
            category: 'CONTROLLER',
            status: 'ACTIVE'
        }
    })
    const archivedItem = await prisma.item.create({
        data: {
            name: 'Archived Item',
            year: 2024,
            salePrice: 100,
            category: 'CONTROLLER',
            status: 'ARCHIVED'
        }
    })

    // 2. Test Default (ACTIVE)
    console.log('Testing Default (ACTIVE)...')
    const defaultItems = await getItems()
    const foundActiveInDefault = defaultItems.data?.find(i => i.id === activeItem.id)
    const foundArchivedInDefault = defaultItems.data?.find(i => i.id === archivedItem.id)

    if (foundActiveInDefault && !foundArchivedInDefault) {
        console.log('PASS: Default filter returns ACTIVE only')
    } else {
        console.error('FAIL: Default filter incorrect', { foundActiveInDefault: !!foundActiveInDefault, foundArchivedInDefault: !!foundArchivedInDefault })
    }

    // 3. Test ACTIVE explicitly
    console.log('Testing ACTIVE filter...')
    const activeItems = await getItems('ACTIVE')
    const foundActive = activeItems.data?.find(i => i.id === activeItem.id)
    const foundArchived = activeItems.data?.find(i => i.id === archivedItem.id)

    if (foundActive && !foundArchived) {
        console.log('PASS: ACTIVE filter returns ACTIVE only')
    } else {
        console.error('FAIL: ACTIVE filter incorrect')
    }

    // 4. Test ARCHIVED
    console.log('Testing ARCHIVED filter...')
    const archivedItems = await getItems('ARCHIVED')
    const foundActiveInArchived = archivedItems.data?.find(i => i.id === activeItem.id)
    const foundArchivedInArchived = archivedItems.data?.find(i => i.id === archivedItem.id)

    if (!foundActiveInArchived && foundArchivedInArchived) {
        console.log('PASS: ARCHIVED filter returns ARCHIVED only')
    } else {
        console.error('FAIL: ARCHIVED filter incorrect')
    }

    // 5. Test ALL
    console.log('Testing ALL filter...')
    const allItems = await getItems('ALL')
    const foundActiveInAll = allItems.data?.find(i => i.id === activeItem.id)
    const foundArchivedInAll = allItems.data?.find(i => i.id === archivedItem.id)

    if (foundActiveInAll && foundArchivedInAll) {
        console.log('PASS: ALL filter returns both')
    } else {
        console.error('FAIL: ALL filter incorrect')
    }

    // Cleanup
    console.log('Cleaning up...')
    await prisma.item.delete({ where: { id: activeItem.id } })
    await prisma.item.delete({ where: { id: archivedItem.id } })
    console.log('Verification Complete.')
}

verifyFiltering()
