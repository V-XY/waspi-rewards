-- Payment providers are tenant configuration, not frontend constants.
-- Orange is intentionally manual-only until a merchant/API integration is provisioned.

insert into public.merchant_accounts (
  tenant_id,
  provider,
  display_name,
  account_number,
  currency_code,
  is_default,
  is_active
)
select
  id,
  'orange_money',
  'Millenian Ngu Ngangmi',
  '657859799',
  'XAF',
  false,
  true
from public.tenants
where slug = 'ebu-flow'
and not exists (
  select 1
  from public.merchant_accounts
  where tenant_id = public.tenants.id
    and provider = 'orange_money'
    and account_number = '657859799'
);

-- Do not enable an Orange USSD template until the tenant supplies a verified
-- Orange Money merchant/USSD contract. The account fallback remains available.
