import Link from 'next/link';
import { ArrowRight, CheckCircle2, PackageSearch, ShieldCheck, Zap } from 'lucide-react';
import { getPublicCatalog } from '@/app/lib/public/catalog';
import { ProductCard } from '@/app/components/public/ProductCard';
import { TestimonialsCarousel } from '@/app/components/public/TestimonialsCarousel';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const catalog = await getPublicCatalog();

  return (
    <div className="min-w-0">
      <section className="relative overflow-hidden bg-midnight">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-solar-flare/20 blur-3xl" />
        <div className="absolute -bottom-48 left-1/3 h-[28rem] w-[28rem] rounded-full bg-ultramarine/15 blur-3xl" />
        <div className="site-container relative grid gap-12 py-20 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-32">
          <div>
            <p className="eyebrow text-solar-flare">EBU Flow</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-7xl">
              Business solutions without the operational friction.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Discover the solutions available to your business, complete the required steps once, and keep the entire journey visible from request to fulfillment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Explore solutions <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="btn-dark-secondary">
                Talk to us
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: Zap, title: 'Guided', text: 'Clear steps from selection to completion.' },
              { icon: ShieldCheck, title: 'Protected', text: 'Sensitive verification stays in secure flows.' },
              { icon: PackageSearch, title: 'Traceable', text: 'Track the state of every request.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <Icon className="h-5 w-5 text-solar-flare" />
                <h2 className="mt-3 font-semibold text-white">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-6">
        <div className="site-container grid gap-4 sm:grid-cols-3">
          {[
            ['Configured for the tenant', 'Solutions and categories are data-driven.'],
            ['One customer journey', 'KYC, payment and fulfillment stay connected.'],
            ['Built to scale', 'Provider integrations can change without rewriting the core.'],
          ].map(([title, text]) => (
            <div key={title} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-solar-flare" />
              <div>
                <p className="text-sm font-semibold text-midnight">{title}</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16 md:py-20">
        <div className="site-container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Solutions</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-midnight sm:text-4xl">
                What is available
              </h2>
              <p className="mt-3 max-w-2xl text-slate-500">
                This catalogue is generated from the active tenant configuration, so the experience does not assume a particular industry.
              </p>
            </div>
            <Link href="/products" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-solar-flare">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.solutions.map((solution) => (
              <Link key={solution.id} href={`/products?category=${encodeURIComponent(solution.slug)}`} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-midnight">{solution.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{solution.description || 'Explore available solutions in this category.'}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">{solution.productCount}</span>
                </div>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-solar-flare">
                  Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="site-container">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Featured</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-midnight sm:text-4xl">Start with a solution</h2>
            </div>
            <span className="hidden text-sm text-slate-400 sm:block">{catalog.featuredProducts.length} highlighted</span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="bg-midnight py-16 md:py-20">
        <div className="site-container">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow text-solar-flare">Customer stories</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Trusted because the process stays clear.</h2>
            <p className="mt-3 text-slate-400">A compact, swipeable story rail keeps the social proof useful without turning the page into a wall of testimonials.</p>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      <section className="bg-slate-100 py-16 md:py-20">
        <div className="site-container rounded-3xl bg-white p-8 shadow-sm md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="eyebrow">Next step</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-midnight sm:text-4xl">Ready to start?</h2>
              <p className="mt-3 max-w-2xl text-slate-500">Choose a solution and EBU Flow will guide the request through the required workflow.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">Browse solutions <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/contact" className="btn-secondary">Contact us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
