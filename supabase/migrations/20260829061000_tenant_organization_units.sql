-- Tenant hierarchy lives inside a tenant. A region/branch is an organizational unit,
-- not a separate tenant, unless it is independently contracted and isolated.
create table if not exists public.tenant_units (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  parent_unit_id uuid references public.tenant_units(id) on delete restrict,
  name text not null,
  slug text not null,
  unit_type text not null default 'region',
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

alter table public.tenant_memberships
  add column if not exists unit_id uuid references public.tenant_units(id) on delete set null;

alter table public.agents
  add column if not exists unit_id uuid references public.tenant_units(id) on delete set null;

create index if not exists tenant_units_tenant_idx on public.tenant_units(tenant_id);
create index if not exists tenant_memberships_unit_idx on public.tenant_memberships(unit_id);
create index if not exists agents_unit_idx on public.agents(unit_id);

alter table public.tenant_units enable row level security;

create policy tenant_units_member_read
  on public.tenant_units for select
  using (public.is_tenant_member(tenant_id));

create policy tenant_units_admin_write
  on public.tenant_units for all
  using (public.has_tenant_role(tenant_id, 'tenant_admin'))
  with check (public.has_tenant_role(tenant_id, 'tenant_admin'));

drop trigger if exists tenant_units_updated_at on public.tenant_units;
create trigger tenant_units_updated_at
before update on public.tenant_units
for each row execute function public.touch_updated_at();
