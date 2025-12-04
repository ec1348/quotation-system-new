/*
  Warnings:

  - You are about to drop the column `supplierName` on the `ItemPriceHistory` table. All the data in the column will be lost.
  - Added the required column `supplierId` to the `ItemPriceHistory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItemPriceHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TWD',
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ItemPriceHistory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemPriceHistory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ItemPriceHistory" ("createdAt", "currency", "date", "id", "itemId", "price", "type", "updatedAt") SELECT "createdAt", "currency", "date", "id", "itemId", "price", "type", "updatedAt" FROM "ItemPriceHistory";
DROP TABLE "ItemPriceHistory";
ALTER TABLE "new_ItemPriceHistory" RENAME TO "ItemPriceHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
