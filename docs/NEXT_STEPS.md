# Deployment and Verification Checklist

1. Rotate any previously exposed Supabase secret/service-role credentials.
2. Create a fresh publishable key and server secret where required by the current Supabase project.
3. Apply `supabase/migrations/20260826080000_ebu_flow_whitelabel_base.sql` to the target project.
4. Confirm the test Auth user exists before running the bootstrap section of the migration.
5. Copy `.env.example` to `.env.local` and add real values.
6. Run `npm install`.
7. Run `npm run typecheck`.
8. Run `npm run lint`.
9. Run `npm run build`.
10. Test operator sign-in and sign-out.
11. Test public product loading.
12. Test checkout -> customer resolution -> order -> opaque KYC session.
13. Test KYC upload to the private bucket.
14. Test automatic KYC approval and manual review/correction paths.
15. Test order tracking token.
16. Test payment intent + MTN USSD instruction generation.
17. Test tenant isolation and RLS with at least two users/tenants.
18. Configure MTN MoMo API sandbox only after its official API credentials and callback contract are available.
19. Rotate all production secrets before launch.
