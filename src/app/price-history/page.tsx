
import { PriceHistorySearch } from '@/components/price-history/PriceHistorySearch';

export default function PriceHistoryPage() {
    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Price History Search</h1>
            <PriceHistorySearch />
        </div>
    );
}
