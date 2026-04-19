---
name: FurnSpace Project Architecture
description: Core architecture, Supabase schema, seed UUID convention, and file layout for the FurnSpace furniture webshop
type: project
---

FurnSpace is a Next.js 16 furniture webshop with Supabase (PostgreSQL) backend.

**Why:** Multi-iteration school project. Iteration 1 established the DB schema and seed data.

**How to apply:** Use these conventions for all future iterations.

## Stack
- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Supabase (auth, database, storage)
- Zustand for client state, React Hook Form + Zod for forms
- shadcn/ui component library

## Supabase schema (5 tables, dependency order)
1. `public.categories` — no FK deps, self-referencing parent_id
2. `public.users` — FK → auth.users(id) ON DELETE CASCADE
3. `public.products` — FK → categories(id) ON DELETE RESTRICT
4. `public.orders` — FK → users(id) ON DELETE RESTRICT
5. `public.order_items` — FK → orders(id) CASCADE, products(id) RESTRICT

## Seed category UUIDs (hardcoded in seed.sql)
- Kanapék:   a1000000-0000-0000-0000-000000000001
- Asztalok:  a1000000-0000-0000-0000-000000000002
- Székek:    a1000000-0000-0000-0000-000000000003
- Szekrények: a1000000-0000-0000-0000-000000000004
- Ágyak:     a1000000-0000-0000-0000-000000000005
- Polcok:    a1000000-0000-0000-0000-000000000006

## SQL artifacts (run manually in Supabase SQL Editor in this order)
1. supabase/schema.sql
2. supabase/rls-policies.sql
3. supabase/triggers.sql
4. supabase/seed.sql
5. supabase/storage-policies.sql

## Auth trigger
`public.handle_new_user()` — SECURITY DEFINER, copies id/email/full_name from
raw_user_meta_data into public.users with role='customer'.

## Storage
Bucket: `product-images`, public=true, 5 MB limit, webp/jpeg/png only.

## Validation
`tests/iteration-1/validate-schema.ts` — run with `npx tsx tests/iteration-1/validate-schema.ts`
Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.

## Gap fixes (2026-04-19)
- `app/order-confirmation/page.tsx` — fixed redirect from `/auth/login` to `/login`
- `app/admin/page.tsx` — replaced hardcoded stats with live Supabase queries via `createAdminClient()`, added `export const dynamic = 'force-dynamic'` to prevent build-time prerender failure (service role key unavailable at build time)
- `app/forgot-password/page.tsx` — new page: email input, calls `supabase.auth.resetPasswordForEmail`, shows success message
- `app/reset-password/page.tsx` — new page: new+confirm password form (Zod min 8, must match), calls `supabase.auth.updateUser`, redirects to `/login` after 2s
- `components/auth/LoginForm.tsx` — "Elfelejtett jelszó?" link changed from `href="#"` to `href="/forgot-password"`
- `app/checkout/actions.ts` — added Resend email after successful order (wrapped in try/catch; failure never fails the order)
- `package.json` — added `resend@^4.0.0` dependency (installed)
- `.env.local` — added `RESEND_API_KEY=` placeholder

IMPORTANT: Admin pages using `createAdminClient()` MUST export `const dynamic = 'force-dynamic'` to avoid prerender errors.
Auth redirect target is `/login` (not `/auth/login`). `/auth/` only contains the OAuth callback at `/auth/callback`.

## Iteration 5 Checkout & Order Placement (completed 2026-04-19)
- `app/checkout/actions.ts` — `placeOrder` server action: auth check, insert orders, insert order_items, rpc decrement_stock, return `{ orderId }`
- `docs/sql/decrement_stock.sql` — SQL for Supabase SQL Editor: SECURITY DEFINER function
- `app/order-confirmation/page.tsx` — async server component, reads `?orderId` searchParam, fetches with user_id guard, renders real data
- `app/checkout/page.tsx` — async server component, fetches user profile, parses shipping_address JSON defensively, passes defaultValues to ShippingForm
- `components/checkout/ShippingForm.tsx` — wired: calls placeOrder, clearCart, router.push on success; error Alert on failure; loading state
- `lib/database.types.ts` — updated for @supabase/supabase-js@2.99 which requires `Relationships: []` on every table and `Functions` typed with `decrement_stock`
- `lib/types.ts` — widened `Category.description` to `string | null`, `Category.parent_id` to `string | null`, `Product.material` to `string | null`, `Product.color` to `string | null` to match DB-returned nulls
- IMPORTANT: @supabase/supabase-js@2.99+ requires `Relationships: []` on every table in Database type or insert/update resolves to `never`

## Iteration 4 Admin CRUD (planned 2026-04-17)
- New files: `app/admin/products/actions.ts`, `app/admin/orders/actions.ts`, `app/admin/categories/actions.ts`, `app/account/actions.ts`
- `app/admin/products/[id]/edit/page.tsx` — migrate from MOCK to live Supabase with admin client
- `app/admin/orders/[id]/page.tsx` — migrate from MOCK to live Supabase, add status dropdown
- `app/admin/categories/page.tsx` — convert from client component to Server Component + Client action wrapper
- `components/admin/ProductForm.tsx` — accept `categories` prop (no more MOCK import), call `upsertProduct` action
- `components/admin/ImageUploader.tsx` — real Supabase Storage upload, returns public URL, no blob URLs
- `components/account/ProfileForm.tsx` — call `updateProfile` action instead of mock setTimeout
- Admin check pattern: use `createAdminClient()` for writes bypassing RLS inside Server Actions
- Storage upload pattern: call Supabase Storage from a Server Action (not client) to keep service role key server-only
- `shipping_address` column is a plain `text` (string) in DB — store as JSON.stringify of ShippingAddress object

## Iteration 3 Live Supabase Data (completed 2026-04-11)
- All page files migrated from MOCK_* to live Supabase queries (Server Components)
- `lib/types.ts` — widened: `images: string[]|null`, `image_url: string|null`, `"confirmed"` in OrderStatus, `dimensions?`/`weight_kg?` on Product, `OrderWithItems` interface added
- `lib/supabase/admin.ts` — new admin client using SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
- Supabase partial-column `.select('a, b')` returns `never` type in TS — always cast with `as unknown as ExpectedType`
- Supabase join `.select('*, relation()')` also returns `never` — cast with `as unknown as`
- `ProductFilters` now accepts optional `categories?: Category[]` prop instead of MOCK_CATEGORIES import
- `ProductImageGallery` prop `images` widened to `string[] | null`
- `OrderRow` component switched to local `OrderSummary` interface (no `items` field needed)
- Auth guard pattern: `getUser()` → redirect('/login') if no user; partial role check: cast `publicUserData as { role: string } | null`
- `app/admin/products/page.tsx` uses `createAdminClient()` for unrestricted product fetch
- mock-data.ts still exists but no longer imported by any in-scope page (admin sub-pages remain on mock pending future iteration)

## Iteration 2 Auth Integration (completed 2026-04-11)
- `lib/database.types.ts` — manually constructed Database type for all 5 tables
- All 3 Supabase clients typed with `Database` generic
- `components/auth/LoginForm.tsx` — real signInWithPassword, error Alert, redirect param, Suspense wrapper
- `components/auth/RegisterForm.tsx` — real signUp with full_name metadata, error Alert, toast
- `components/layout/UserMenu.tsx` — real session via getUser + onAuthStateChange, sign-out, login link fallback
- `lib/supabase/middleware.ts` — route protection for /checkout, /account, /admin (role check via public.users)
- `app/auth/callback/route.ts` — OAuth PKCE callback exchangeCodeForSession
- E2E: `tests/iteration-2/auth.e2e.ts` (15 scenarios), `playwright.config.ts`, `test:e2e` script
- E2E credentials: E2E_CUSTOMER_EMAIL, E2E_CUSTOMER_PASSWORD, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD (in .env.test)
