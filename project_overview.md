# Project Overview

## Tech Stack
- **Framework**: Next.js 15.0.3
- **Language**: TypeScript
- **Database**: SQLite (via Prisma ORM 5.22.0)
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Radix UI, Lucide React
- **PDF Generation**: @react-pdf/renderer, jspdf

## Project Structure
- **`src/app`**: Application routes and pages.
  - `clients/`: Client management pages.
  - `suppliers/`: Supplier management pages.
  - `items/`: Item (components, labor, expense) management.
  - `products/`: Product (machines/BOM) management.
  - `quotes/`: Quotation management and builder.
  - `dashboard/`: Main dashboard.
- **`src/components`**: Reusable UI components.
- **`src/actions`**: Server actions for database mutations.
- **`src/lib`**: Utility functions (e.g., dictionary, helpers).
- **`prisma`**: Database schema (`schema.prisma`) and migrations.

## Data Schema
```prisma
model Supplier {
  id             Int      @id @default(autoincrement())
  name           String
  contact        String?
  email          String?
  phone          String?
  businessNumber String?
  address        String?
  items          Item[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Client {
  id             Int      @id @default(autoincrement())
  name           String
  address        String?
  email          String?
  phone          String?
  businessNumber String?
  quotes         Quote[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Item {
  id          Int               @id @default(autoincrement())
  name        String
  description String?
  year        Int
  price       Float
  type        String            @default("COMPONENT") // COMPONENT, LABOR, EXPENSE
  status      String            @default("ACTIVE")    // ACTIVE, ARCHIVED
  supplierId  Int?
  supplier    Supplier?         @relation(fields: [supplierId], references: [id])
  materials   ProductMaterial[]
  quoteItems  QuoteItem[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}

model Product {
  id          Int               @id @default(autoincrement())
  name        String
  description String?
  materials   ProductMaterial[]
  quoteItems  QuoteItem[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}

model ProductMaterial {
  id        Int     @id @default(autoincrement())
  productId Int
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  itemId    Int
  item      Item    @relation(fields: [itemId], references: [id])
  quantity  Int
}

model Quote {
  id        Int         @id @default(autoincrement())
  clientId  Int
  client    Client      @relation(fields: [clientId], references: [id])
  date      DateTime    @default(now())
  status    String      @default("DRAFT") // DRAFT, SENT, ACCEPTED
  total     Float       @default(0)
  items     QuoteItem[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model QuoteItem {
  id          Int      @id @default(autoincrement())
  quoteId     Int
  quote       Quote    @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  productId   Int?
  product     Product? @relation(fields: [productId], references: [id])
  itemId      Int?
  item        Item?    @relation(fields: [itemId], references: [id])
  description String
  quantity    Int
  unitPrice   Float
  total       Float
  type        String   @default("COMPONENT") // COMPONENT, LABOR, EXPENSE
}
```
