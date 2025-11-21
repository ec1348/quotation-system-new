import { ProductForm } from '@/components/products/ProductForm';
import { BOMEditor } from '@/components/products/BOMEditor';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getItems } from '@/actions/item';

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
        notFound();
    }

    const [product, itemsResult] = await Promise.all([
        prisma.product.findUnique({
            where: { id: productId },
            include: {
                materials: {
                    include: {
                        item: true
                    }
                }
            }
        }),
        getItems()
    ]);

    if (!product) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Product</h1>
                <ProductForm product={product} />
            </div>

            <div>
                <BOMEditor
                    productId={product.id}
                    materials={product.materials}
                    allItems={itemsResult.data || []}
                />
            </div>
        </div>
    );
}
