# Quotation System

A comprehensive quotation management system built with Next.js 15, Prisma, and SQLite for auto control companies.

## Features

### Core Modules
- **Suppliers Management** - Manage supplier information and contacts
- **Clients Management** - Track client details and business information
- **Items Management** - Components, labor, and expenses with yearly versioning
- **Products Management** - Machine types with Bill of Materials (BOM)
- **Quotation Builder** - Create and manage quotes with automatic cost calculation

### Key Capabilities
- ✅ Full CRUD operations for all entities
- ✅ Bill of Materials (BOM) editor for products
- ✅ Automatic cost calculation from BOM when adding products to quotes
- ✅ Quote status tracking (Draft, Sent, Accepted)
- ✅ Real-time total calculation
- ✅ Premium UI with Tailwind CSS
- ✅ Server-side rendering with Next.js App Router
- ✅ **Soft Delete / Archiving**: Items can be archived to preserve history.
- ✅ **Multi-language Support**: English and Traditional Chinese (繁體中文).

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PDF Generation**: jsPDF (coming soon)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd quotation_system_new
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up the database:
```bash
# Create .env file
echo "DATABASE_URL=\"file:./dev.db\"" > .env

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

- **Supplier** - Supplier information
- **Client** - Client information  
- **Item** - Components, labor, and expenses with yearly pricing
- **Product** - Machine types
- **ProductMaterial** - Bill of Materials linking products to items
- **Quote** - Quotations for clients
- **QuoteItem** - Individual line items in quotes

## Project Structure

```
src/
├── actions/          # Server actions for data operations
├── app/              # Next.js app router pages
│   ├── clients/
│   ├── items/
│   ├── products/
│   ├── quotes/
│   └── suppliers/
├── components/       # React components
│   ├── clients/
│   ├── items/
│   ├── products/
│   ├── quotes/
│   ├── suppliers/
│   └── ui/          # Reusable UI components
└── lib/             # Utility functions and Prisma client
```

## Usage

### Creating a Quote

1. Navigate to **Quotes** → **New Quote**
2. Select a client
3. Add products (machines) - costs are calculated from BOM
4. Add individual items (spare parts, labor, expenses)
5. Adjust quantities and prices as needed
6. Update status (Draft → Sent → Accepted)
7. Generate PDF (coming soon)

### Managing Products

1. Navigate to **Products** → **Add Product**
2. Enter product details
3. Click **Edit** to manage Bill of Materials
4. Add items with quantities to define the BOM
5. Product cost is automatically calculated when added to quotes

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Database management
npx prisma studio          # Open Prisma Studio
npx prisma migrate dev     # Run migrations
npx prisma generate        # Regenerate client
```

## License

MIT

## Author

Eric Chen
