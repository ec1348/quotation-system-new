
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up Chinese dummy data...');

    // 1. Define data to delete
    const clientsData = [
        '台積電', '鴻海精密', '聯發科', '台達電', '廣達電腦',
        '華碩電腦', '宏碁', '研華科技', '日月光', '聯電'
    ];

    const suppliersData = [
        '台灣西門子', '三菱電機台灣', '士林電機', '羅克韋爾自動化', '施耐德電機',
        '台灣歐姆龍', '安川電機', '台達電子', '東元電機', '松下產業科技',
        '台灣基恩斯', '菲尼克斯電氣', '台灣倍加福', '台灣西克', '台灣費斯托',
        '上銀科技', '亞德客', '盟立自動化', '所羅門', '友士'
    ];

    const itemsData = [
        'PLC 可程式控制器', '人機介面 HMI 10吋', '伺服馬達 400W',
        '光電開關', '近接開關', '電磁接觸器', '無熔絲斷路器',
        '變頻器 1HP', '開關電源 24V 5A', '端子台', '繼電器',
        '氣壓缸', '電磁閥', '線性滑軌', '滾珠螺桿', '步進馬達',
        '行星減速機', '工業電腦', '網路交換器', '訊號隔離器',
        '溫控器', '計時器', '計數器', '按鈕開關', '急停開關', '警示燈'
    ];

    // 2. Delete Price History first
    const deleteHistory = await prisma.itemPriceHistory.deleteMany({
        where: {
            item: {
                name: {
                    in: itemsData
                }
            }
        }
    });
    console.log(`Deleted ${deleteHistory.count} price history records.`);

    // 3. Delete Items
    const deleteItems = await prisma.item.deleteMany({
        where: {
            name: {
                in: itemsData
            }
        }
    });
    console.log(`Deleted ${deleteItems.count} items.`);

    // 4. Delete Suppliers
    const deleteSuppliers = await prisma.supplier.deleteMany({
        where: {
            name: {
                in: suppliersData
            }
        }
    });
    console.log(`Deleted ${deleteSuppliers.count} suppliers.`);

    // 5. Delete Clients
    const deleteClients = await prisma.client.deleteMany({
        where: {
            name: {
                in: clientsData
            }
        }
    });
    console.log(`Deleted ${deleteClients.count} clients.`);

    console.log('Cleanup complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
