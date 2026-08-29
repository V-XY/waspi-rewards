import 'server-only';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { findActiveProductsByIds } from '@/app/lib/repositories/products';
import { resolveCustomer } from '@/app/lib/domain/customers/service';
import { assignCustomer } from '@/app/lib/domain/assignments/service';
import { audit } from '@/app/lib/domain/audit/service';
import { createOrderAccessToken } from '@/app/lib/domain/customers/access';
import { enqueueEvent } from '@/app/lib/domain/audit/events';

export async function createOrder(input: {
  tenantId: string;
  actorUserId?: string;
  customer: { name: string; phone: string; email?: string; address?: string; landmark?: string };
  items: Array<{ productId: string; quantity: number }>;
  source?: string;
}) {
  if (!input.items.length) throw new Error('EMPTY_CART');
  const customer = await resolveCustomer({ tenantId: input.tenantId, ...input.customer });
  const agentId = await assignCustomer(input.tenantId, customer.id, input.actorUserId);

  const productIds = [...new Set(input.items.map(i => i.productId))];
  const products = await findActiveProductsByIds(input.tenantId, productIds);
  if (!products || products.length !== productIds.length) throw new Error('PRODUCT_NOT_AVAILABLE');

  const byId = new Map(products.map(p => [p.id, p]));
  const lineItems = input.items.map(item => {
    const product = byId.get(item.productId);
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) throw new Error('INVALID_ITEM');
    return { product_id: product.id, product_name: product.name, unit_price: product.price, quantity: item.quantity };
  });
  const subtotal = lineItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const year = new Date().getFullYear();
  const { data: prefixSetting } = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('tenant_id', input.tenantId)
    .eq('key', 'order_prefix')
    .maybeSingle();
  const prefixValue = prefixSetting?.value;
  const configuredPrefix = prefixValue && typeof prefixValue === 'object' && !Array.isArray(prefixValue)
    ? (prefixValue as Record<string, unknown>).prefix
    : null;
  const prefix = typeof configuredPrefix === 'string' && configuredPrefix.trim() ? configuredPrefix.trim().toUpperCase() : 'EBU';
  const orderNumber = `${prefix}-${year}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  const { data: order, error } = await supabaseAdmin.from('orders').insert({
    tenant_id: input.tenantId,
    order_number: orderNumber,
    customer_id: customer.id,
    agent_id: agentId,
    status: 'awaiting_kyc',
    subtotal,
    discount_amount: 0,
    total_amount: subtotal,
    currency_code: 'XAF',
    source: input.source || 'website',
    delivery_address: input.customer.address || null,
    delivery_landmark: input.customer.landmark || null,
  }).select().single();
  if (error) throw error;

  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(lineItems.map(item => ({ ...item, order_id: order.id })));
  if (itemsError) { await supabaseAdmin.from('orders').delete().eq('id', order.id); throw itemsError; }

  const { error: kycError } = await supabaseAdmin.from('kyc_submissions').insert({ tenant_id: input.tenantId, order_id: order.id, customer_id: customer.id, status: 'not_started' });
  if (kycError) { await supabaseAdmin.from('orders').delete().eq('id', order.id); throw kycError; }

  await audit({ tenantId: input.tenantId, actorUserId: input.actorUserId, action: 'order.created', resourceType: 'order', resourceId: order.id, after: order });
  await enqueueEvent({tenantId: input.tenantId,eventType:'OrderCreated',aggregateType:'order',aggregateId:order.id,payload:{order_number:order.order_number}});
  const trackingToken = await createOrderAccessToken(input.tenantId, customer.id, order.id);
  return { order, customer, agentId, trackingToken };
}
