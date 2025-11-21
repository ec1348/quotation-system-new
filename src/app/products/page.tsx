import Link from 'next/link';
import { getProducts, deleteProduct } from '@/actions/product';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Settings } from 'lucide-react';
import { Product, ProductMaterial, Item } from '@prisma/client';

type ProductWithMaterials = Product & {
    materials: (ProductMaterial & { item: Item })[];
};

export default async function ProductsPage() {
    const { data } = await getProducts();
    const products = data as ProductWithMaterials[] | undefined;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Products (Machines)</h1>
                <Link href="/products/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products?.map((product) => {
                    const totalCost = product.materials.reduce((sum, m) => sum + (m.item.price * m.quantity), 0);

                    return (
                        <div key={product.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="flex flex-col space-y-1.5 p-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold leading-none tracking-tight">{product.name}</h3>
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">{product.description || 'No description'}</p>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-muted-foreground">Materials Cost:</span>
                                    <span className="text-lg font-bold">${totalCost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                    <span>{product.materials.length} components</span>
                                </div>
                            </div>
                            <div className="flex items-center p-6 pt-0 gap-2">
                                <Link href={`/products/${product.id}/edit`} className="w-full">
                                    <Button variant="outline" className="w-full">
                                        <Pencil className="mr-2 h-4 w-4" /> Edit / BOM
                                    </Button>
                                </Link>
                                <form action={deleteProduct.bind(null, product.id)}>
                                    <Button variant="destructive" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    );
                })}
                {(!products || products.length === 0) && (
                    <div className="col-span-full text-center text-muted-foreground py-12">
                        No products found. Create one to start building machines.
                    </div>
                )}
            </div>
        </div>
    );
}
