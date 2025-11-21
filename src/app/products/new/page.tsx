import { ProductForm } from '@/components/products/ProductForm';

export default function NewProductPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">New Product</h1>
            </div>
            <ProductForm />
        </div>
    );
}
