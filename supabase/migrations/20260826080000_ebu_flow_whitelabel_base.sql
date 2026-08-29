create extension if not exists pgcrypto;

create type public.member_role as enum ('superadmin','tenant_admin','agent');
create type public.member_status as enum ('invited','active','suspended','disabled');
create type public.order_status as enum ('draft','awaiting_kyc','kyc_review','awaiting_payment','payment_review','ready_for_activation','activation_in_progress','completed','cancelled','failed');
create type public.kyc_status as enum ('not_started','draft','submitted','validating','approved','manual_review','correction_required','rejected');
create type public.payment_status as enum ('pending','processing','submitted','verified','failed','expired','cancelled','refunded');
create type public.payment_attempt_status as enum ('created','pending','processing','submitted','verified','failed','expired','cancelled');
create type public.activation_status as enum ('pending','configured','mapped','active','failed','cancelled');
create type public.delivery_status as enum ('pending','scheduled','delivered','failed');
create type public.commission_status as enum ('pending','approved','paid','cancelled');

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  legal_name text,
  country_code text not null default 'CM',
  currency_code text not null default 'XAF',
  timezone text not null default 'Africa/Douala',
  logo_url text,
  primary_color text,
  secondary_color text,
  settings jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null,
  status public.member_status not null default 'active',
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id),
  check (role = 'superadmin' or tenant_id is not null)
);

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  auth_user_id uuid not null unique references auth.users(id) on delete restrict,
  email text,
  full_name text not null,
  phone text,
  role public.member_role not null default 'agent',
  status public.member_status not null default 'active',
  assignment_weight integer not null default 1 check (assignment_weight > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  full_name text not null,
  phone text not null,
  phone_normalized text not null,
  email text,
  address text,
  landmark text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  identity_confidence numeric(5,4),
  metadata jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, phone_normalized)
);

create table public.customer_access_tokens (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  token_hash text not null unique,
  purpose text not null default 'customer_portal',
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.agent_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete restrict,
  reason text not null default 'rule',
  is_current boolean not null default true,
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);
create unique index agent_assignments_one_current on public.agent_assignments(customer_id) where is_current;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sku text not null,
  slug text not null,
  name text not null,
  category text not null,
  subcategory text,
  description text not null default '',
  price bigint not null check (price >= 0),
  commission bigint not null default 0 check (commission >= 0),
  commission_type text not null default 'fixed' check (commission_type in ('fixed','percentage')),
  billing_cycle text not null default 'one-time' check (billing_cycle in ('one-time','monthly')),
  features jsonb not null default '{}'::jsonb,
  industry_tags text[] not null default '{}',
  kyc_requirements jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, sku),
  unique (tenant_id, slug)
);

create table public.pain_points (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  icon text,
  description text,
  related_product_ids uuid[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  order_number text not null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  agent_id uuid references public.agents(id) on delete set null,
  status public.order_status not null default 'awaiting_kyc',
  subtotal bigint not null default 0 check (subtotal >= 0),
  discount_amount bigint not null default 0 check (discount_amount >= 0),
  total_amount bigint not null default 0 check (total_amount >= 0),
  currency_code text not null default 'XAF',
  source text not null default 'website',
  delivery_address text,
  delivery_landmark text,
  delivery_latitude numeric(10,7),
  delivery_longitude numeric(10,7),
  delivery_status public.delivery_status not null default 'pending',
  scheduled_delivery_date date,
  delivered_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, order_number)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  unit_price bigint not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total bigint generated always as (unit_price * quantity) stored,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  amount bigint not null check (amount > 0),
  currency_code text not null default 'XAF',
  status public.payment_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index payment_intents_one_open on public.payment_intents(order_id) where status in ('pending','processing','submitted');

create table public.merchant_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  provider text not null,
  display_name text not null,
  merchant_code text,
  account_number text,
  currency_code text not null default 'XAF',
  ussd_template text,
  configuration jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  payment_intent_id uuid not null references public.payment_intents(id) on delete cascade,
  provider text not null,
  merchant_account_id uuid references public.merchant_accounts(id) on delete set null,
  status public.payment_attempt_status not null default 'created',
  external_transaction_id text,
  external_reference text,
  requested_amount bigint not null check (requested_amount > 0),
  received_amount bigint,
  currency_code text not null default 'XAF',
  evidence_path text,
  provider_response jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  initiated_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  status public.kyc_status not null default 'not_started',
  id_type text,
  rejection_step text,
  rejection_reason text,
  correction_count integer not null default 0,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index kyc_one_submission_per_order on public.kyc_submissions(order_id);

create table public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  kyc_submission_id uuid not null references public.kyc_submissions(id) on delete cascade,
  document_type text not null,
  storage_bucket text not null default 'kyc-documents',
  storage_path text not null,
  mime_type text,
  file_size bigint,
  checksum text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (kyc_submission_id, document_type)
);

create table public.activations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.activation_status not null default 'pending',
  sim_migration_done boolean not null default false,
  inov_logged boolean not null default false,
  external_reference text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_id)
);

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  agent_id uuid not null references public.agents(id) on delete restrict,
  amount bigint not null check (amount >= 0),
  currency_code text not null default 'XAF',
  status public.commission_status not null default 'pending',
  payout_date timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, key)
);

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  channel text not null,
  provider text not null,
  recipient text not null,
  template text,
  status text not null default 'queued',
  provider_message_id text,
  attempts integer not null default 0,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  delivered_at timestamptz
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  tenant_id uuid references public.tenants(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  before_data jsonb,
  after_data jsonb,
  request_id text,
  correlation_id text,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.system_errors (
  id bigint generated always as identity primary key,
  tenant_id uuid references public.tenants(id) on delete set null,
  severity text not null default 'error' check (severity in ('debug','info','warning','error','critical')),
  domain text not null,
  component text,
  code text,
  message text not null,
  stack text,
  request_id text,
  correlation_id text,
  fingerprint text,
  context jsonb not null default '{}'::jsonb,
  occurrence_count integer not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null
);

create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete set null,
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','processing','published','failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create index customers_phone_idx on public.customers(tenant_id, phone_normalized);
create index orders_customer_idx on public.orders(customer_id, created_at desc);
create index orders_agent_idx on public.orders(agent_id, created_at desc);
create index orders_status_idx on public.orders(tenant_id, status, created_at desc);
create index kyc_status_idx on public.kyc_submissions(tenant_id, status, created_at desc);
create index payment_status_idx on public.payment_intents(tenant_id, status, created_at desc);
create index audit_tenant_time_idx on public.audit_logs(tenant_id, created_at desc);
create index errors_tenant_time_idx on public.system_errors(tenant_id, last_seen_at desc);
create index outbox_pending_idx on public.outbox_events(status, available_at);

create or replace function public.is_superadmin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.tenant_memberships where user_id = auth.uid() and role = 'superadmin' and status = 'active'); $$;

create or replace function public.is_tenant_member(p_tenant uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select public.is_superadmin() or exists (select 1 from public.tenant_memberships where user_id = auth.uid() and tenant_id = p_tenant and status = 'active'); $$;

create or replace function public.has_tenant_role(p_tenant uuid, p_role public.member_role)
returns boolean language sql stable security definer set search_path = public
as $$ select public.is_superadmin() or exists (select 1 from public.tenant_memberships where user_id = auth.uid() and tenant_id = p_tenant and role = p_role and status = 'active'); $$;

create or replace function public.has_tenant_permission(p_tenant uuid, p_permission text)
returns boolean language plpgsql stable security definer set search_path = public
as $$
declare m public.tenant_memberships;
begin
  if public.is_superadmin() then return true; end if;
  select * into m from public.tenant_memberships where user_id = auth.uid() and tenant_id = p_tenant and status = 'active' limit 1;
  if not found then return false; end if;
  if m.role in ('tenant_admin') then return true; end if;
  return coalesce((m.permissions ->> p_permission)::boolean, false);
end; $$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

do $$ declare t text; begin
  foreach t in array array['tenants','profiles','tenant_memberships','agents','customers','orders','payment_intents','payment_attempts','kyc_submissions','activations','commissions','settings','products'] loop
    execute format('drop trigger if exists %I_updated_at on public.%I', t, t);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.agents enable row level security;
alter table public.customers enable row level security;
alter table public.customer_access_tokens enable row level security;
alter table public.agent_assignments enable row level security;
alter table public.products enable row level security;
alter table public.pain_points enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_intents enable row level security;
alter table public.merchant_accounts enable row level security;
alter table public.payment_attempts enable row level security;
alter table public.kyc_submissions enable row level security;
alter table public.kyc_documents enable row level security;
alter table public.activations enable row level security;
alter table public.commissions enable row level security;
alter table public.settings enable row level security;
alter table public.notification_logs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_errors enable row level security;
alter table public.outbox_events enable row level security;

create policy tenant_read on public.tenants for select using (public.is_tenant_member(id));
create policy profile_self on public.profiles for all using (id = auth.uid() or public.is_superadmin()) with check (id = auth.uid() or public.is_superadmin());
create policy membership_read on public.tenant_memberships for select using (user_id = auth.uid() or public.is_superadmin());
create policy membership_admin on public.tenant_memberships for all using (public.is_superadmin() or public.has_tenant_role(tenant_id,'tenant_admin')) with check (public.is_superadmin() or public.has_tenant_role(tenant_id,'tenant_admin'));

create policy agents_read on public.agents for select using (public.is_tenant_member(tenant_id));
create policy agents_admin on public.agents for all using (public.has_tenant_role(tenant_id,'tenant_admin')) with check (public.has_tenant_role(tenant_id,'tenant_admin'));
create policy customer_member_read on public.customers for select using (public.is_tenant_member(tenant_id));
create policy customer_member_write on public.customers for all using (public.has_tenant_permission(tenant_id,'customers.write')) with check (public.has_tenant_permission(tenant_id,'customers.write'));
create policy assignment_member on public.agent_assignments for select using (public.is_tenant_member(tenant_id));
create policy assignment_admin on public.agent_assignments for all using (public.has_tenant_permission(tenant_id,'assignments.manage')) with check (public.has_tenant_permission(tenant_id,'assignments.manage'));

create policy products_public_read on public.products for select using (is_active = true);
create policy products_admin on public.products for all using (public.has_tenant_role(tenant_id,'tenant_admin')) with check (public.has_tenant_role(tenant_id,'tenant_admin'));
create policy pain_points_public_read on public.pain_points for select using (is_active = true);
create policy pain_points_admin on public.pain_points for all using (public.has_tenant_role(tenant_id,'tenant_admin')) with check (public.has_tenant_role(tenant_id,'tenant_admin'));

create policy orders_member_read on public.orders for select using (public.is_tenant_member(tenant_id));
create policy orders_member_write on public.orders for update using (public.has_tenant_permission(tenant_id,'orders.write')) with check (public.has_tenant_permission(tenant_id,'orders.write'));
create policy order_items_member_read on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and public.is_tenant_member(o.tenant_id)));
create policy payment_member_read on public.payment_intents for select using (public.is_tenant_member(tenant_id));
create policy payment_admin_write on public.payment_intents for update using (public.has_tenant_permission(tenant_id,'payments.verify')) with check (public.has_tenant_permission(tenant_id,'payments.verify'));
create policy merchant_admin on public.merchant_accounts for all using (public.has_tenant_role(tenant_id,'tenant_admin')) with check (public.has_tenant_role(tenant_id,'tenant_admin'));
create policy payment_attempt_member on public.payment_attempts for select using (exists (select 1 from public.payment_intents p where p.id = payment_intent_id and public.is_tenant_member(p.tenant_id)));
create policy kyc_member_read on public.kyc_submissions for select using (public.is_tenant_member(tenant_id));
create policy kyc_reviewer_write on public.kyc_submissions for update using (public.has_tenant_permission(tenant_id,'kyc.review')) with check (public.has_tenant_permission(tenant_id,'kyc.review'));
create policy kyc_docs_member_read on public.kyc_documents for select using (exists (select 1 from public.kyc_submissions k where k.id = kyc_submission_id and public.is_tenant_member(k.tenant_id)));
create policy activation_member on public.activations for select using (public.is_tenant_member(tenant_id));
create policy activation_admin on public.activations for all using (public.has_tenant_permission(tenant_id,'activation.manage')) with check (public.has_tenant_permission(tenant_id,'activation.manage'));
create policy commission_member on public.commissions for select using (public.is_tenant_member(tenant_id));
create policy commission_admin on public.commissions for update using (public.has_tenant_permission(tenant_id,'commissions.manage')) with check (public.has_tenant_permission(tenant_id,'commissions.manage'));
create policy settings_member_read on public.settings for select using (public.is_tenant_member(tenant_id));
create policy settings_admin_write on public.settings for all using (public.has_tenant_role(tenant_id,'tenant_admin')) with check (public.has_tenant_role(tenant_id,'tenant_admin'));
create policy notifications_member on public.notification_logs for select using (tenant_id is null or public.is_tenant_member(tenant_id));
create policy audit_admin on public.audit_logs for select using (tenant_id is null or public.has_tenant_permission(tenant_id,'audit.read'));
create policy errors_admin on public.system_errors for select using (tenant_id is null or public.has_tenant_permission(tenant_id,'observability.read'));
create policy outbox_admin on public.outbox_events for select using (tenant_id is null or public.has_tenant_permission(tenant_id,'observability.read'));

insert into public.tenants (id, slug, name, legal_name, country_code, currency_code, timezone, primary_color)
values ('00000000-0000-4000-8000-000000000001','ebu-flow','EBU Flow','EBU Flow','CM','XAF','Africa/Douala','#F59E0B')
on conflict (slug) do nothing;

insert into public.merchant_accounts (tenant_id, provider, display_name, merchant_code, currency_code, ussd_template, is_default)
select id, 'mtn_momo', 'Millenian Ngu Ngangmi', '045934', 'XAF', '*126*4*{merchant_code}*{amount}#', true
from public.tenants where slug = 'ebu-flow'
and not exists (select 1 from public.merchant_accounts where provider='mtn_momo' and merchant_code='045934');

insert into public.settings (tenant_id,key,value)
select id,'daily_goal','{"target":5}'::jsonb from public.tenants where slug='ebu-flow'
on conflict (tenant_id,key) do nothing;
insert into public.settings (tenant_id,key,value)
select id,'order_prefix','{"prefix":"EBU"}'::jsonb from public.tenants where slug='ebu-flow'
on conflict (tenant_id,key) do nothing;
insert into public.settings (tenant_id,key,value)
select id,'demo_mode','{"enabled":false}'::jsonb from public.tenants where slug='ebu-flow'
on conflict (tenant_id,key) do nothing;

insert into storage.buckets (id,name,public) values ('kyc-documents','kyc-documents',false) on conflict (id) do update set public=false;
insert into storage.buckets (id,name,public) values ('payment-proofs','payment-proofs',false) on conflict (id) do update set public=false;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.profiles(id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email)) on conflict (id) do nothing; return new; end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.kyc_access_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.kyc_access_sessions enable row level security;
create policy kyc_session_none on public.kyc_access_sessions for select using (false);
create index kyc_access_token_idx on public.kyc_access_sessions(token_hash);

insert into public.products (tenant_id, sku, slug, name, category, subcategory, description, price, commission, commission_type, billing_cycle, features, industry_tags)
select id,'HOMEBOX-25K','homebox-bundle','HomeBox Bundle','connectivity','homebox','4G Wi-Fi router with SIM and first month unlimited service.',24900,0,'fixed','one-time','{"includes":["4G Wi-Fi Router","SIM Card","First Month"]}'::jsonb,array['sme','home','office'] from public.tenants where slug='ebu-flow'
on conflict (tenant_id,slug) do nothing;
insert into public.products (tenant_id, sku, slug, name, category, subcategory, description, price, commission, commission_type, billing_cycle, features, industry_tags)
select id,'WIFIX-25K','wifix-bundle','WiFIX Bundle','connectivity','wifix','Reliable business connectivity for homes, shops and small offices.',25000,0,'fixed','one-time','{"includes":["Device","Connectivity"]}'::jsonb,array['sme','home','office'] from public.tenants where slug='ebu-flow'
on conflict (tenant_id,slug) do nothing;
insert into public.products (tenant_id, sku, slug, name, category, subcategory, description, price, commission, commission_type, billing_cycle, features, industry_tags)
select id,'SME-3K','sme-in-the-box-3k','SME in the Box 3K','voice','sme_box','3,000 FCFA voice bundle with data and a free business add-on.',3000,0,'fixed','monthly','{"includes":["Voice","Data","1 Free Business Add-on"]}'::jsonb,array['sme'] from public.tenants where slug='ebu-flow'
on conflict (tenant_id,slug) do nothing;
insert into public.products (tenant_id, sku, slug, name, category, subcategory, description, price, commission, commission_type, billing_cycle, features, industry_tags)
select id,'SME-5K','sme-in-the-box-5k','SME in the Box 5K','voice','sme_box','5,000 FCFA business voice bundle.',5000,0,'fixed','monthly','{"includes":["Voice","Data","1 Free Business Add-on"]}'::jsonb,array['sme'] from public.tenants where slug='ebu-flow'
on conflict (tenant_id,slug) do nothing;
insert into public.products (tenant_id, sku, slug, name, category, subcategory, description, price, commission, commission_type, billing_cycle, features, industry_tags)
select id,'WISPEED-15K','wispeed-15k','WISPEED 15K','data','wispeed','High-volume business data package.',15000,0,'fixed','monthly','{}'::jsonb,array['sme'] from public.tenants where slug='ebu-flow'
on conflict (tenant_id,slug) do nothing;
insert into public.products (tenant_id, sku, slug, name, category, subcategory, description, price, commission, commission_type, billing_cycle, features, industry_tags)
select id,'WISPEED-25K','wispeed-25k','WISPEED 25K','data','wispeed','High-volume business data package.',25000,0,'fixed','monthly','{}'::jsonb,array['sme'] from public.tenants where slug='ebu-flow'
on conflict (tenant_id,slug) do nothing;
insert into public.products (tenant_id, sku, slug, name, category, subcategory, description, price, commission, commission_type, billing_cycle, features, industry_tags)
select id,'WISPEED-40K','wispeed-40k','WISPEED 40K','data','wispeed','High-volume business data package.',40000,0,'fixed','monthly','{}'::jsonb,array['sme'] from public.tenants where slug='ebu-flow'
on conflict (tenant_id,slug) do nothing;
insert into public.products (tenant_id, sku, slug, name, category, subcategory, description, price, commission, commission_type, billing_cycle, features, industry_tags)
select id,'WISPEED-60K','wispeed-60k','WISPEED 60K','data','wispeed','High-volume business data package.',60000,0,'fixed','monthly','{}'::jsonb,array['sme'] from public.tenants where slug='ebu-flow'
on conflict (tenant_id,slug) do nothing;
insert into public.pain_points (tenant_id,name,slug,icon,description) select id,'Unreliable internet','unreliable-internet','📶','Your business needs a stable connection.' from public.tenants where slug='ebu-flow' on conflict (tenant_id,slug) do nothing;
insert into public.pain_points (tenant_id,name,slug,icon,description) select id,'High data costs','high-data-costs','💸','Reduce the cost of keeping your team connected.' from public.tenants where slug='ebu-flow' on conflict (tenant_id,slug) do nothing;
insert into public.pain_points (tenant_id,name,slug,icon,description) select id,'Team communication','team-communication','📞','Give your staff simpler business communication.' from public.tenants where slug='ebu-flow' on conflict (tenant_id,slug) do nothing;
alter table public.notification_logs add column if not exists provider_message_id text;
alter table public.notification_logs add column if not exists direction text default 'outbound';
alter table public.notification_logs add column if not exists content text;

do $$
declare u uuid; t uuid; a uuid;
begin
  select id into u from auth.users where lower(email) = 'millenianngu@gmail.com' limit 1;
  select id into t from public.tenants where slug='ebu-flow' limit 1;
  if u is not null and t is not null then
    insert into public.profiles(id, full_name) values (u, 'Millenian Ngu Ngangmi') on conflict (id) do update set full_name=excluded.full_name;
    insert into public.tenant_memberships(tenant_id,user_id,role,status,permissions) values (t,u,'tenant_admin','active','{"customers.write":true,"assignments.manage":true,"orders.write":true,"kyc.review":true,"payments.verify":true,"activation.manage":true,"commissions.manage":true,"audit.read":true,"observability.read":true}'::jsonb) on conflict (tenant_id,user_id) do update set role='tenant_admin',status='active',permissions=excluded.permissions;
    if not exists (select 1 from public.tenant_memberships where user_id=u and role='superadmin') then insert into public.tenant_memberships(tenant_id,user_id,role,status,permissions) values (null,u,'superadmin','active','{}'::jsonb); end if;
    select id into a from public.agents where auth_user_id=u limit 1;
    if a is null then
      insert into public.agents(tenant_id,auth_user_id,email,full_name,role,status) values(t,u,'millenianngu@gmail.com','Millenian Ngu Ngangmi','tenant_admin','active');
    else
      update public.agents set tenant_id=t,email='millenianngu@gmail.com',full_name='Millenian Ngu Ngangmi',role='tenant_admin',status='active' where id=a;
    end if;
  end if;
end $$;
alter table public.customer_access_tokens add column if not exists order_id uuid references public.orders(id) on delete cascade;
create table public.idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key text not null,
  operation text not null,
  response jsonb,
  created_at timestamptz not null default now(),
  unique(tenant_id,key,operation)
);
alter table public.idempotency_keys enable row level security;
create policy idempotency_none on public.idempotency_keys for all using (false) with check (false);
