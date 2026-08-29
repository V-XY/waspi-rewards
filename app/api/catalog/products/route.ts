import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { getCurrentMembership, getCurrentUser } from '@/app/lib/auth/session';
import { audit } from '@/app/lib/domain/audit/service';
import { handleRouteError } from '@/app/lib/http';
import type { JsonObject } from '@/app/lib/types';

type ProductInput = {
  sku?: unknown;
  slug?: unknown;
  name?: unknown;
  category?: unknown;
  subcategory?: unknown;
  description?: unknown;
  price?: unknown;
  commission?: unknown;
  commission_type?: unknown;
  billing_cycle?: unknown;
  features?: unknown;
  industry_tags?: unknown;
  kyc_requirements?: unknown;
  is_active?: unknown;
};

function isAdminRole(role: string): boolean {
  return role === 'superadmin' || role === 'tenant_admin';
}

function cleanJson(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
}

export async function GET(request: NextRequest) {
  try {
    const tenant = await getDefaultTenant();
    const category = new URL(request.url).searchParams.get('category');

    let query = supabaseAdmin
      .from('products')
      .select('*')
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .order('category')
      .order('name');

    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      products: data ?? [],
      tenant: { id: tenant.id, name: tenant.name, currency_code: tenant.currency_code },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const membership = await getCurrentMembership();
    if (!user) throw new Error('UNAUTHORIZED');
    if (!membership || !isAdminRole(membership.role)) throw new Error('FORBIDDEN');

    const tenant = await getDefaultTenant();
    const body = await request.json() as ProductInput;

    const { data, error } = await supabaseAdmin.from('products').insert({
      tenant_id: tenant.id,
      sku: String(body.sku ?? ''),
      slug: String(body.slug ?? ''),
      name: String(body.name ?? ''),
      category: String(body.category ?? 'general'),
      subcategory: body.subcategory ? String(body.subcategory) : null,
      description: String(body.description ?? ''),
      price: Number(body.price ?? 0),
      commission: Number(body.commission ?? 0),
      commission_type: body.commission_type === 'percentage' ? 'percentage' : 'fixed',
      billing_cycle: body.billing_cycle === 'monthly' ? 'monthly' : 'one-time',
      features: cleanJson(body.features),
      industry_tags: Array.isArray(body.industry_tags) ? body.industry_tags.map(String) : [],
      kyc_requirements: cleanJson(body.kyc_requirements),
    }).select().single();

    if (error) throw error;

    await audit({ tenantId: tenant.id, actorUserId: user.id, action: 'product.created', resourceType: 'product', resourceId: data.id, after: data });
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const membership = await getCurrentMembership();
    if (!user) throw new Error('UNAUTHORIZED');
    if (!membership || !isAdminRole(membership.role)) throw new Error('FORBIDDEN');

    const tenant = await getDefaultTenant();
    const body = await request.json() as ProductInput & { id?: unknown };
    const id = String(body.id ?? '');
    if (!id) throw new Error('PRODUCT_ID_REQUIRED');

    const updates: Record<string, unknown> = {};
    const allowed = ['sku', 'slug', 'name', 'category', 'subcategory', 'description', 'price', 'commission', 'commission_type', 'billing_cycle', 'features', 'industry_tags', 'kyc_requirements', 'is_active'] as const;

    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (updates.features !== undefined) updates.features = cleanJson(updates.features);
    if (updates.industry_tags !== undefined) updates.industry_tags = Array.isArray(updates.industry_tags) ? updates.industry_tags.map(String) : [];

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('tenant_id', tenant.id)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await audit({ tenantId: tenant.id, actorUserId: user.id, action: 'product.updated', resourceType: 'product', resourceId: id, after: data });
    return NextResponse.json({ product: data });
  } catch (error) {
    return handleRouteError(error);
  }
}
