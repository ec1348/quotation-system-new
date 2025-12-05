
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Chinese dummy data generation...');

    // 1. Create Clients (10)
    const clientsData = [
        '台積電', '鴻海精密', '聯發科', '台達電', '廣達電腦',
        '華碩電腦', '宏碁', '研華科技', '日月光', '聯電'
    ];

    const clients = [];
    for (const name of clientsData) {
        const client = await prisma.client.create({
            data: {
                name,
                email: `contact@${name.includes('台') ? 'tsmc' : 'tech'}.com.tw`,
                phone: '02-23456789',
                address: '新竹科學園區'
            }
        });
        clients.push(client);
    }
    console.log(`Created ${clients.length} clients.`);

    // 2. Create Suppliers (20)
    const suppliersData = [
        '台灣西門子', '三菱電機台灣', '士林電機', '羅克韋爾自動化', '施耐德電機',
        '台灣歐姆龍', '安川電機', '台達電子', '東元電機', '松下產業科技',
        '台灣基恩斯', '菲尼克斯電氣', '台灣倍加福', '台灣西克', '台灣費斯托',
        '上銀科技', '亞德客', '盟立自動化', '所羅門', '友士'
    ];

    const suppliers = [];
    for (const name of suppliersData) {
        const supplier = await prisma.supplier.create({
            data: {
                name,
                contact: '業務經理',
                phone: '02-87654321',
                email: `sales@${name.includes('西') ? 'siemens' : 'supplier'}.com.tw`
            }
        });
        suppliers.push(supplier);
    }
    console.log(`Created ${suppliers.length} suppliers.`);

    // 3. Create Items (30) & History
    // Scenario A: Same Name, Different Brand/Model (PLC)
    const plcBrands = [
        { brand: 'Siemens', model: 'S7-1200 CPU 1214C' },
        { brand: 'Mitsubishi', model: 'FX5U-32MT/ES' },
        { brand: 'Omron', model: 'CP1H-X40DT-D' },
        { brand: 'Delta', model: 'DVP-12SE' },
        { brand: 'Allen-Bradley', model: 'Micro850' }
    ];

    for (const b of plcBrands) {
        const item = await prisma.item.create({
            data: {
                name: 'PLC 可程式控制器',
                brand: b.brand,
                model: b.model,
                category: 'CONTROLLER',
                year: 2024,
                salePrice: 15000,
                status: 'ACTIVE'
            }
        });

        // Add history for 2023 and 2024
        await prisma.itemPriceHistory.create({
            data: {
                itemId: item.id,
                supplierId: suppliers[Math.floor(Math.random() * 5)].id, // First 5 are major brands
                price: 12000,
                date: new Date('2023-05-15'),
                type: 'PURCHASE'
            }
        });
        await prisma.itemPriceHistory.create({
            data: {
                itemId: item.id,
                supplierId: suppliers[Math.floor(Math.random() * 5)].id,
                price: 12500,
                date: new Date('2024-02-20'),
                type: 'PURCHASE'
            }
        });
    }

    // Scenario B: Same Model, Different Suppliers (HMI)
    const hmiItem = await prisma.item.create({
        data: {
            name: '人機介面 HMI 10吋',
            brand: 'Proface',
            model: 'PFXGP4501TADW',
            category: 'CONTROLLER',
            year: 2024,
            salePrice: 25000,
            status: 'ACTIVE'
        }
    });

    // Price from Supplier A (2022)
    await prisma.itemPriceHistory.create({
        data: {
            itemId: hmiItem.id,
            supplierId: suppliers[0].id,
            price: 18000,
            date: new Date('2022-06-10'),
            type: 'PURCHASE'
        }
    });
    // Price from Supplier B (2023)
    await prisma.itemPriceHistory.create({
        data: {
            itemId: hmiItem.id,
            supplierId: suppliers[1].id,
            price: 19000,
            date: new Date('2023-08-15'),
            type: 'PURCHASE'
        }
    });
    // Price from Supplier C (2024)
    await prisma.itemPriceHistory.create({
        data: {
            itemId: hmiItem.id,
            supplierId: suppliers[2].id,
            price: 20000,
            date: new Date('2024-01-20'),
            type: 'PURCHASE'
        }
    });

    // Scenario C: Purchase with different years (Servo Motor)
    const servoItem = await prisma.item.create({
        data: {
            name: '伺服馬達 400W',
            brand: 'Yaskawa',
            model: 'SGM7J-04AFC6S',
            category: 'MOTION',
            year: 2024,
            salePrice: 12000,
            status: 'ACTIVE'
        }
    });

    const years = [2020, 2021, 2022, 2023, 2024];
    let basePrice = 8000;
    for (const year of years) {
        await prisma.itemPriceHistory.create({
            data: {
                itemId: servoItem.id,
                supplierId: suppliers[6].id, // Yaskawa supplier
                price: basePrice,
                date: new Date(`${year}-03-10`),
                type: 'PURCHASE'
            }
        });
        basePrice += 500; // Price increase matching inflation/year
    }

    // Fill remaining items to reach 30
    const commonItems = [
        { name: '光電開關', category: 'SENSOR', brand: 'Keyence', model: 'PZ-G41N' },
        { name: '近接開關', category: 'SENSOR', brand: 'Omron', model: 'E2E-X7D1' },
        { name: '電磁接觸器', category: 'RELAY', brand: 'Shihlin', model: 'S-P11' },
        { name: '無熔絲斷路器', category: 'POWER', brand: 'Mitsubishi', model: 'NF30-CS' },
        { name: '變頻器 1HP', category: 'MOTION', brand: 'Delta', model: 'VFD007M21A' },
        { name: '開關電源 24V 5A', category: 'POWER', brand: 'MeanWell', model: 'MDR-60-24' },
        { name: '端子台', category: 'CONNECTIVITY', brand: 'Dinkle', model: 'DK2.5' },
        { name: '繼電器', category: 'RELAY', brand: 'Omron', model: 'MY2N-GS' },
        { name: '氣壓缸', category: 'ACCESSORY', brand: 'Festo', model: 'DSBC-32-100' },
        { name: '電磁閥', category: 'ACCESSORY', brand: 'SMC', model: 'SY3120' },
        { name: '線性滑軌', category: 'ACCESSORY', brand: 'HIWIN', model: 'HG15' },
        { name: '滾珠螺桿', category: 'ACCESSORY', brand: 'HIWIN', model: 'R16-5' },
        { name: '步進馬達', category: 'MOTION', brand: 'Oriental', model: 'PKP266' },
        { name: '行星減速機', category: 'MOTION', brand: 'Apex', model: 'AB090' },
        { name: '工業電腦', category: 'CONTROLLER', brand: 'Advantech', model: 'IPC-610' },
        { name: '網路交換器', category: 'CONNECTIVITY', brand: 'Moxa', model: 'EDS-205' },
        { name: '訊號隔離器', category: 'INTERFACE', brand: 'Phoenix', model: 'MINI MCR' },
        { name: '溫控器', category: 'CONTROLLER', brand: 'Omron', model: 'E5CC' },
        { name: '計時器', category: 'RELAY', brand: 'Omron', model: 'H3CR' },
        { name: '計數器', category: 'RELAY', brand: 'Omron', model: 'H7CX' },
        { name: '按鈕開關', category: 'INTERFACE', brand: 'Tend', model: 'T2BF' },
        { name: '急停開關', category: 'INTERFACE', brand: 'IDEC', model: 'XA1E' },
        { name: '警示燈', category: 'INTERFACE', brand: 'Patlite', model: 'LME' }
    ];

    for (const itemData of commonItems) {
        const item = await prisma.item.create({
            data: {
                name: itemData.name,
                brand: itemData.brand,
                model: itemData.model,
                category: itemData.category as any,
                year: 2024,
                salePrice: Math.floor(Math.random() * 5000) + 500,
                status: 'ACTIVE'
            }
        });

        // Random history
        await prisma.itemPriceHistory.create({
            data: {
                itemId: item.id,
                supplierId: suppliers[Math.floor(Math.random() * suppliers.length)].id,
                price: Math.floor(Math.random() * 4000) + 400,
                date: new Date('2024-01-15'),
                type: 'PURCHASE'
            }
        });
    }

    console.log('Dummy data generation complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
