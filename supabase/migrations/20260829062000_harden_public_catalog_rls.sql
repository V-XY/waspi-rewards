-- Public catalog access is served through tenant-scoped server routes.
-- Anonymous clients must not be able to query every active tenant's catalogue directly.
drop policy if exists products_public_read on public.products;
drop policy if exists pain_points_public_read on public.pain_points;
