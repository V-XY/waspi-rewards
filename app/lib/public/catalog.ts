import 'server-only';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { getDefaultTenant, getTenantBySlug } from '@/app/lib/tenancy';
import type { Product, PublicCatalog, PublicSolution } from '@/app/lib/types';

const FALLBACK_ICONS: Record<string, string> = {
  connectivity: 'wifi',
  voice: 'phone',
  data: 'database',
  marketing: 'megaphone',
  security: 'shield',
  identity: 'badge',
};

function labelize(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function getPublicCatalog(tenantSlug?: string): Promise<PublicCatalog> {
  const tenant = tenantSlug ? await getTenantBySlug(tenantSlug) : await getDefaultTenant();
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const typedProducts = (products ?? []) as Product[];
  const groups = new Map<string, PublicSolution>();

  for (const product of typedProducts) {
    const existing = groups.get(product.category);
    if (existing) {
      existing.productCount += 1;
    } else {
      groups.set(product.category, {
        id: product.category,
        name: labelize(product.category),
        slug: product.category,
        description: product.subcategory ? labelize(product.subcategory) : null,
        icon: FALLBACK_ICONS[product.category] ?? 'package',
        productCount: 1,
      });
    }
  }

  return {
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      logo_url: tenant.logo_url,
      primary_color: tenant.primary_color,
      secondary_color: tenant.secondary_color,
      currency_code: tenant.currency_code,
    },
    solutions: [...groups.values()],
    featuredProducts: typedProducts.slice(0, 6),
  };
}
