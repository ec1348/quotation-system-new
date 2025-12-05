/*
  Warnings:

  - You are about to drop the column `costPrice` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Item` table. All the data in the column will be lost.
  - Added the required column `brand` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER NOT NULL,
    "salePrice" REAL NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Item" ("createdAt", "description", "id", "salePrice", "status", "updatedAt", "year") SELECT "createdAt", "description", "id", "salePrice", "status", "updatedAt", "year" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE UNIQUE INDEX "Item_brand_model_key" ON "Item"("brand", "model");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
