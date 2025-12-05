/*
  Warnings:

  - You are about to drop the column `price` on the `Item` table. All the data in the column will be lost.
  - Added the required column `salePrice` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER NOT NULL,
    "costPrice" REAL NOT NULL DEFAULT 0,
    "salePrice" REAL NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'COMPONENT',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "supplierId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Item_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("createdAt", "description", "id", "name", "supplierId", "type", "updatedAt", "year") SELECT "createdAt", "description", "id", "name", "supplierId", "type", "updatedAt", "year" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
