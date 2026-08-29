import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { getPublicCatalog } from '@/app/lib/public/catalog';
import { ProductCard } from '@/app/components/public/ProductCard';
import { TestimonialsCarousel } from '@/app/components/public/TestimonialsCarousel';

export const dynamic = 'force-dynamic';

export default async function TenantLandingPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const catalog = await getPublicCatalog(tenant);

  return (
    <div className="min-w-0">
      <section className="bg-midnight text-white">
        <div className="site-container grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-4xl">
            <p className="eyebrow text-solar-flare">{catalog.tenant.name}</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">Solutions configured for your business.</h1>
            <p className="mt-5 max-w-2xl text-slate-300">Explore the services available from {catalog.tenant.name} and move through one clear request and fulfillment journey.</p>
            <Link href={`/t/${catalog.tenant.slug}/products`} className="btn-primary mt-7">Explore solutions <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
            <ShieldCheck className="h-6 w-6 text-solar-flare" />
            <p className="mt-3 text-sm font-semibold">Secure, traceable workflow</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">KYC, payment and fulfillment remain connected.</p>
          </div>
        </div>
      </section>

      <section className="site-container py-16 md:py-20">
        <p className="eyebrow">Available solutions</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.solutions.map((solution) => (
            <Link key={solution.id} href={`/t/${catalog.tenant.slug}/products?category=${encodeURIComponent(solution.slug)}`} className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-lg">
              <h2 className="font-semibold text-midnight">{solution.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{solution.description || 'Explore available solutions.'}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="site-container">
          <div className="flex items-end justify-between gap-4">
            <div><p className="eyebrow">Featured</p><h2 className="mt-2 text-3xl font-bold text-midnight">Popular choices</h2></div>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="bg-midnight py-16">
        <div className="site-container"><TestimonialsCarousel /></div>
      </section>
    </div>
  );
}
