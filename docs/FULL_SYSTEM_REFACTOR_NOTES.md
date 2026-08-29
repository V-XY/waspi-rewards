# EBU Flow Full-System Refactor

## Refactor baseline

This build is based on `EBU-Flow WL_v1` and preserves the white-label modular-monolith direction:

Application Shell -> Feature -> Use Case/Service -> Domain/Validation -> Repository/Adapter -> Supabase/Providers.

## Implemented in this pass

- Root layout no longer imposes the public navbar/footer on dashboard routes.
- Public routes own the public navigation and footer through the public route group.
- Dashboard owns its application shell with a responsive sidebar and contextual topbar.
- Public navbar was rebuilt from scratch. Legacy desktop/mobile/dropdown navbar fragments were removed.
- Global horizontal page overflow is clipped; horizontal scrolling is reserved for intentional components such as tables and testimonial rails.
- Public catalogue and footer solution navigation are tenant-driven rather than hardcoded to telecom products.
- Added a tenant public route at `/t/[tenant]` and tenant catalogue entry point at `/t/[tenant]/products`.
- Landing-page testimonial experience was rebuilt as a scroll-snap card rail with responsive card widths and explicit controls.
- Core shared types were normalized and prototype order fields such as `client_name`, `client_phone`, `payment_status`, and `kyc_status` were removed from the canonical `Order` model.
- Dashboard order, lead, KYC, commission, and order-detail experiences were moved to the normalized domain model.
- Cart persistence was moved to `useSyncExternalStore` to avoid synchronous state updates from effects.
- Payment provider handling now supports tenant-configured manual MTN and Orange destinations behind one provider abstraction.
- Orange Money is configured as manual-account payment only until a verified Orange merchant/API integration exists.
- MTN USSD can be opened through a mobile `tel:` action when the browser/device permits it.
- Added a payment-method discovery endpoint rather than hardcoding available providers in the UI.
- Added tenant organization units so regions/branches can live inside a tenant without becoming separate tenants.
- Hardened catalogue RLS by removing unrestricted anonymous direct reads; public catalogue access is served through tenant-scoped server routes.
- Added repository boundaries for product, order, and payment persistence used by core services.
- Order numbering now reads the tenant `order_prefix` setting instead of hardcoding EBU in the order service.
- Removed obsolete demo data coupled to the prototype schema.
- Updated WhatsApp template language so shared notification code is not permanently branded as MTN-specific.

## Tenant hierarchy model

A contracted organization is a tenant. Regional or branch administration is represented by organizational units inside that tenant.

Example:

MTN Cameroon (tenant)
- Douala (unit)
- Yaounde (unit)
- Bafoussam (unit)

Tenant administrators can manage the tenant. Unit scoping can be expanded as permissions mature without turning every region into a separate tenant.

Separate countries such as MTN Cameroon and MTN Ghana should normally be separate tenants when they require independent commercial, legal, data, or operational isolation.

## Payment model

Payment remains:

Payment Intent -> Payment Attempt -> Provider Transaction -> Reconciliation

Providers are replaceable edges. Orange is deliberately not treated as an automated API provider without verified merchant credentials/contracts.

## Validation note

A complete `npm ci`, lint, typecheck, and production build could not be completed in the coding runtime because the provided dependency environment was incomplete and the package registry/cache could not supply all packages. The source changes were therefore inspected and structurally checked, but the final runtime/build gate must be run in the user's local environment after dependencies are installed.
