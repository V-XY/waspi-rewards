# EBU Flow Validation and Localization Gate

## Current compiler fixes

The refactor base has addressed the TypeScript errors reported against the previous build:

- KYC document relation is represented by `KycDocument` and `KycSubmission.kyc_documents`.
- Public payment instructions support both USSD and manual account destinations.
- Product JSON feature values are normalized to strings at the UI boundary.
- Product PATCH input includes `is_active`.
- KYC provider input maps database snake_case fields to the provider's camelCase contract.
- Dashboard data-loading effects no longer call state setters through externally declared loader functions.
- Public navbar no longer resets navigation state from a pathname effect.
- Solution selector declares its loader before the effect that invokes it.
- JSX apostrophes/quotes flagged by the React lint rule are escaped.

## Validation gate

Run from a clean install:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
```

The gate is considered passed only when all four commands exit with code 0.

## Bilingual UI foundation

The application now has a lightweight English/French locale provider using `useSyncExternalStore`, avoiding state-setting effects for locale persistence.

- Default locale: English.
- Persisted key: `ebu-locale`.
- Locale switch: EN/FR control in the public and dashboard shells.
- `<html lang>` follows the active locale.
- Shared navigation/workspace terminology is translated.
- Tenant/product content remains data-driven and should be localized through tenant/product translation data when those fields are introduced; it must not be machine-rewritten in the UI.
