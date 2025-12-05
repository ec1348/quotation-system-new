/*
  Warnings:

  - You are about to drop the column `total` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `QuoteItem` table. All the data in the column will be lost.
  - Added the required column `name` to the `QuoteItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Quote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Quote" ("clientId", "createdAt", "date", "id", "status", "updatedAt") SELECT "clientId", "createdAt", "date", "id", "status", "updatedAt" FROM "Quote";
DROP TABLE "Quote";
ALTER TABLE "new_Quote" RENAME TO "Quote";
CREATE TABLE "new_QuoteItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quoteId" INTEGER NOT NULL,
    "sourceProductId" INTEGER,
    "itemId" INTEGER,
    "parentId" INTEGER,
    "isBundleHeader" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "brand" TEXT,
    "model" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "total" REAL NOT NULL,
    "costBasis" REAL,
    "type" TEXT NOT NULL DEFAULT 'COMPONENT',
    CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuoteItem_sourceProductId_fkey" FOREIGN KEY ("sourceProductId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "QuoteItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "QuoteItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "QuoteItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_QuoteItem" ("description", "id", "itemId", "quantity", "quoteId", "total", "type", "unitPrice") SELECT "description", "id", "itemId", "quantity", "quoteId", "total", "type", "unitPrice" FROM "QuoteItem";
DROP TABLE "QuoteItem";
ALTER TABLE "new_QuoteItem" RENAME TO "QuoteItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Item_name_idx" ON "Item"("name");
