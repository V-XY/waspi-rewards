import { getPublicCatalog } from '@/app/lib/public/catalog';
import { ProductCard } from '@/app/components/public/ProductCard';

export const dynamic = 'force-dynamic';

export default async function TenantProductsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const catalog = await getPublicCatalog(tenant);
  return (
    <div className="bg-slate-50 py-10 md:py-16">
      <div className="site-container">
        <p className="eyebrow">{catalog.tenant.name}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-midnight sm:text-5xl">Available solutions</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.featuredProducts.map((product) => <ProductCard key={product.id} product={product} hrefPrefix={`/t/${catalog.tenant.slug}`} />)}
        </div>
      </div>
    </div>
  );
}
