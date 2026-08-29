# EBU Flow - Final White-label Base

EBU Flow is now structured as a modular monolith with a stable business core and replaceable provider edges.

## Core domains

- Tenants and memberships
- Customers and persistent identity
- Agent assignment
- Product catalogue
- Orders and order items
- KYC submissions and private documents
- Payment intents and attempts
- Activations
- Commissions
- Notifications
- Audit and system errors
- Durable outbox events

## Authentication

Supabase Auth is the only operator authentication authority. There is no public operator sign-up. Operators are provisioned through tenant memberships and agents.

Roles:

- `superadmin`: platform authority
- `tenant_admin`: tenant authority
- `agent`: operational authority

## Tenant model

The application resolves the active tenant from `NEXT_PUBLIC_DEFAULT_TENANT_SLUG`. Business records carry `tenant_id`. The architecture supports multiple tenants without changing domain code.

## Customer identity

Customers are not required to authenticate. Phone normalization provides the primary matching signal within a tenant. Orders remain associated with the same customer record so repeat business can be recognized.

## KYC

KYC uses opaque, expiring access tokens. KYC documents are stored in a private Supabase Storage bucket and represented by metadata in PostgreSQL. Base64 documents are not persisted in the database.

The intended flow is:

`order -> KYC -> automatic validation -> approval/manual review/correction -> payment`

## Payments

Payment is modeled as:

`payment intent -> payment attempt -> provider transaction -> reconciliation`

The first provider is `ManualUSSDProvider`, supporting both MTN merchant-code and account-number patterns. MTN MoMo API integration is an adapter that can be added without changing the order domain.

## Security

- Server-side authoritative pricing
- Tenant scoping
- Supabase RLS
- Private storage
- Signed URL architecture
- Opaque KYC/customer access tokens
- Idempotency keys for payment attempts
- Audit trail
- Error ledger
- Correlation IDs

## Migration

The repository now contains a migration source of truth under `supabase/migrations/`. Apply the migration to the intended Supabase project before running the application.

The migration also bootstraps the `ebu-flow` tenant and, when the supplied test user already exists in Supabase Auth, provisions that user as tenant admin and platform superadmin.

## Environment

Copy `.env.example` to `.env.local` and supply the real values locally. Never expose `SUPABASE_SECRET_KEY` or provider secrets through `NEXT_PUBLIC_*` variables.

## Production principle

Stable Core, Replaceable Edges. Provider-specific code belongs under `app/lib/providers`; business decisions belong under `app/lib/domain`.
