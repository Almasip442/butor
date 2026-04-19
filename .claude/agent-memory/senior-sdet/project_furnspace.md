---
name: FurnSpace Project Context
description: Core project facts for the FurnSpace furniture webshop — stack, structure, and testing baseline
type: project
---

FurnSpace is a Next.js 16 furniture webshop with Supabase (PostgreSQL) backend. The project is in its backend integration milestone (milestone 2). Milestone 1 built a full UI with mock data; now real Supabase integration is being added iteratively.

**Tech stack:** Next.js 16, React 19, TypeScript, Supabase (@supabase/ssr + @supabase/supabase-js), Tailwind CSS, Zustand, shadcn/ui, Zod, React Hook Form.

**Playwright is installed** — playwright.config.ts exists at project root, testDir: ./tests, testMatch: **/*.e2e.ts, baseURL: http://localhost:3000. webServer runs `npm run dev`. No parallel execution (fullyParallel: false), retries: 1.

**Existing tests:**
- tests/iteration-1/validate-schema.ts — Supabase schema/RLS/seed validation via tsx (not Playwright)
- tests/iteration-2/auth.e2e.ts — 15 Playwright tests covering login, register, sign-out, route guards
- tests/iteration-3/data-integration.e2e.ts — Playwright tests for Iteration 3 live Supabase data
- tests/iteration-4/admin-crud.e2e.ts — Iteration 4: Admin CRUD + Storage + profile (implemented)
- tests/iteration-5/checkout.e2e.ts — Iteration 5: Checkout & Order Placement (implemented 2026-04-19)

**Supabase project URL:** https://rjyqhzbdxsakjarsycap.supabase.co (env: NEXT_PUBLIC_SUPABASE_URL)
**.env.local** exists at project root and has both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set.

**Data model:** 5 tables — categories, products, users, orders, order_items. All must have RLS enabled. users mirrors auth.users via handle_new_user trigger. users.role can be 'customer' (default) or 'admin'.

**Mock data:** lib/mock-data.ts has 6 categories (IDs: cat-1..cat-6) and 18 products (IDs: prod-1..prod-18) and a MOCK_USER ("Kovács Anna"). These IDs and names must NOT appear in rendered HTML after Iteration 3 replaces mock data with Supabase queries.

**Route structure (all confirmed present as of 2026-04-19 milestone 2 audit):**
- / — HomePage (FeaturedProducts + CategoryGrid + HeroSection)
- /products — ProductsPage (server-side filtering by category, search, price, sort)
- /products/[slug] — ProductPage (slug lookup, related products, generateMetadata)
- /cart — CartPage (Zustand client-side cart, CartItemList + OrderSummary)
- /checkout — CheckoutPage (ShippingForm + CheckoutSummary, calls placeOrder server action)
- /order-confirmation — shows real DB order, redirects to /login when unauthenticated
- /account — AccountPage (ProfileForm with real user, orders tab links to /account/orders)
- /account/orders — OrdersPage (all orders for logged-in user)
- /account/orders/[id] — OrderDetailPage (order items, status timeline, shipping address, totals)
- /admin — AdminDashboardPage (live counts via createAdminClient, no hardcoded numbers)
- /admin/products — AdminProductsPage (all products including inactive, ProductsDataTable)
- /admin/products/new — NewProductPage (ProductForm with upsertProduct Server Action)
- /admin/products/[id]/edit — EditProductPage (ProductForm with initialData from Supabase)
- /admin/orders — AdminOrdersPage (all orders via adminClient)
- /admin/orders/[id] — AdminOrderDetailPage (order detail with OrderStatusSelect)
- /admin/categories — AdminCategoriesPage (full CRUD via CategoriesClient + actions)
- /login — LoginForm (email+password + Google OAuth)
- /register — RegisterForm
- /forgot-password — Supabase resetPasswordForEmail flow
- /reset-password — Supabase updateUser password form
- /not-found — custom 404
- /auth/callback — Google OAuth code exchange route

**MILESTONE 2 AUDIT GAP — F-10 (cart DB sync after login):**
Cart is localStorage-only (Zustand persist, key "furnspace-cart"). There is NO database cart_items table or merge/sync logic anywhere in the codebase. The specification requires "cart persists after login (DB sync)". The cart does persist across browser sessions via localStorage, but it is NOT synced to Supabase on login. This is the single functional gap vs specification requirements.

**Verified fixes confirmed working as of 2026-04-19:**
- LoginForm "Elfelejtett jelszó?" link: href="/forgot-password" (not "#") — CONFIRMED
- /order-confirmation redirects to /login (not /auth/login) — CONFIRMED
- /admin page uses live Supabase queries via createAdminClient — CONFIRMED
- checkout/actions.ts sends email via Resend (resend ^4.8.0) — CONFIRMED
- /forgot-password page implements full reset flow — CONFIRMED
- /reset-password page exists and implements updateUser password form — CONFIRMED
- resend package present in package.json — CONFIRMED

**Email:** checkout/actions.ts sends order confirmation via Resend inside try/catch (failure does not fail the order). resend package version ^4.8.0 is in package.json.

**Admin auth guard:** All admin pages check user role === 'admin' via the users table. createAdminClient() uses the Supabase service-role key for bypassing RLS.

**Test data requirements for Iteration 5 e2e tests:**
- Customer test user with a saved shipping profile (full_name, zip_code, city, address set in users table)
- At least 1 product with stock_quantity >= 2 (for stock decrement + buy-2 edge case)
- At least 1 product with stock_quantity = 1 (for exact-stock boundary test)
- Known test product slug: E2E_PRODUCT_SLUG (must be in-stock and active)
- New env var needed: E2E_TEST_PRODUCT_ID (UUID of a real Supabase product for stock checks)

**Iteration 5 confirmed selector details (verified against source 2026-04-19):**
- ShippingForm labels: "Teljes név", "E-mail cím", "Telefonszám", "Irányítószám", "Város", "Utca, házszám, emelet, ajtó", "Ország"
- Submit button default: "Megrendelés Véglegesítése" (disabled when isSubmitting)
- Submit button loading: "Rendelés feldolgozása..." (with Loader2 spinner)
- Error rendered as: `<Alert variant="destructive">` — getByRole('alert')
- Cart localStorage key: "furnspace-cart" (Zustand persist name)
- OrderConfirmationPage: renders shortId (first 8 chars uppercase) + full UUID below in mono font
- OrderConfirmationPage: "Sikeres rendelés!" h1, "Rendelési azonosító" label, "Rendelt termékek" section, "Összesen" total
- OrderConfirmationPage: "Vissza a főoldalra" button + "Rendelések megtekintése" ghost button link → /account/orders
- CheckoutSummary: redirects to /products if cart is empty after hydration (useEffect on items.length)
- CheckoutPage h1: "Biztonságos Pénztár"
- placeOrder throws "Nem vagy bejelentkezve." if no session (server-side auth guard)
- country field pre-filled to "Magyarország"

**Iteration 4 critical selector notes (verified against source):**
- ImageUploader alt is "Termékkép 1" (not "Product image") — use img[alt="Termékkép 1"]
- OrderStatusSelect (detail page): getByRole('combobox', { name: /rendelés státuszának módosítása/i })
- OrdersDataTable (list page): each row has getByRole('combobox') with status value as displayed label text
- shadcn/ui Select: role="combobox" on trigger; options are role="option" in role="listbox" popover
- ProfileForm email: role="textbox" name=/e-mail cím/i — aria-label="E-mail cím (nem módosítható)"
- ProfileForm full_name Zod min is 2 (not 1) — error: "Teljes név megadása kötelező (min. 2 karakter)"
- deleteCategory has FK guard: count check before delete, returns error if products exist

**Key UI text anchors (Hungarian):**
- "Kiemelt Termékek" — featured products section heading
- "Termék található" — product count on listing page
- "Keresés: ..." — search mode heading
- "Rendelési előzmények" — orders list heading
- "Megrendelt Tételek" — order items section
- "Összesítő" / "Végösszeg" — order totals section
- "Elfelejtett jelszó?" — forgot password link in LoginForm
- "Jelszó visszaállítása" — reset password page h1
- "Elfelejtett jelszó" — forgot password page h1

**Why:** Backend integration is iterative. Each iteration adds one concern. Tests must validate each iteration's acceptance criteria from the user's perspective.

**How to apply:** After Iteration 3, any test that navigates a product or category page must not find "prod-1", "cat-1", or "Kovács Anna" in the rendered HTML — these are mock data sentinel values. After Iteration 4, admin CRUD operations must be verified against real Supabase state (reload the page after save to confirm persistence).
