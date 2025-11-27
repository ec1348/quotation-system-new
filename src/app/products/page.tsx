import { getProducts } from '@/actions/product';
import { ProductList } from '@/components/products/ProductList';
import { Product, ProductMaterial, Item } from '@prisma/client';

type ProductWithMaterials = Product & {
    materials: (ProductMaterial & { item: Item })[];
};

export default async function ProductsPage() {
    const { data } = await getProducts();
    const products = data as ProductWithMaterials[] | undefined;

    return <ProductList products={products || []} />;
}
