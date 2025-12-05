-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT '',
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
INSERT INTO "new_Item" ("brand", "category", "createdAt", "description", "id", "model", "salePrice", "status", "updatedAt", "year") SELECT "brand", "category", "createdAt", "description", "id", "model", "salePrice", "status", "updatedAt", "year" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE UNIQUE INDEX "Item_brand_model_key" ON "Item"("brand", "model");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
