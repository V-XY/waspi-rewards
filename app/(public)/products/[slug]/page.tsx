// app/(public)/products/[slug]/page.tsx
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata dynamically using server-side data
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await getDefaultTenant();
  const { data: product, error } = await supabaseAdmin.from('products').select('*').eq('tenant_id', tenant.id).eq('id', slug).eq('is_active', true).single();

  if (error || !product) {
    return {
      title: 'Product Not Found — EBU Flow',
      description: 'The product you are looking for does not exist.',
    };
  }

  const title = `${product.name} — Business Connectivity Products`;
  const description = product.description || `Get ${product.name} for your business. Free delivery and easy setup.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://ebu-flow.vercel.app/products/${slug}`,
      siteName: 'EBU Flow',
      type: 'website',
    },
    alternates: {
      canonical: `https://ebu-flow.vercel.app/products/${slug}`,
    },
  };
}

// Page component
export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tenant = await getDefaultTenant();
  const { data: product, error } = await supabaseAdmin.from('products').select('*').eq('tenant_id', tenant.id).eq('id', slug).eq('is_active', true).single();

  if (error || !product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}