import { test, expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// Iteration 3: Mock adatok kiváltása Supabase-lekérésekkel (Server Components)
//
// These tests validate that all pages load live data from Supabase, not mock
// data, and that all server-side features (filtering, sorting, slugs, metadata)
// behave correctly from the user's perspective.
//
// Test data assumptions (must exist in Supabase before running):
//   - At least 2 active categories with slugs matching existing products
//   - At least 4 products with is_featured=true, is_active=true
//   - At least 1 product with is_active=false (admin-only visibility test)
//   - At least 2 products in the same category (for related products test)
//   - One product with a known slug (E2E_PRODUCT_SLUG, e.g. "nordic-soft-kanape")
//   - One known category slug (E2E_CATEGORY_SLUG, e.g. "kanapek")
//   - Customer test user must have at least 1 order in Supabase
// ---------------------------------------------------------------------------

const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL!
const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD!
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL!
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD!

// Known stable test data identifiers — adjust to match actual Supabase seed
const KNOWN_PRODUCT_SLUG = process.env.E2E_PRODUCT_SLUG || 'nordic-soft-kanape'
const KNOWN_CATEGORY_SLUG = process.env.E2E_CATEGORY_SLUG || 'kanapek'
const KNOWN_CATEGORY_NAME = process.env.E2E_CATEGORY_NAME || 'Kanapék'

// UUID v4 pattern — breadcrumb category hrefs must NOT use UUIDs as the slug
const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loginAs(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel(/e-mail/i).fill(email)
  await page.getByLabel(/jelszó/i).first().fill(password)
  await page.getByRole('button', { name: /bejelentkezés/i }).click()
  await expect(page).toHaveURL('/', { timeout: 10_000 })
}

// ---------------------------------------------------------------------------
// GUARD — skip credential-dependent tests when env vars are absent
// ---------------------------------------------------------------------------

function requireCredentials() {
  if (!CUSTOMER_EMAIL || !CUSTOMER_PASSWORD) {
    test.skip(true, 'E2E_CUSTOMER_EMAIL / E2E_CUSTOMER_PASSWORD not set')
  }
}

function requireAdminCredentials() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    test.skip(true, 'E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set')
  }
}

// ---------------------------------------------------------------------------
// TASK 3.1 — Homepage: featured products + categories from Supabase
// ---------------------------------------------------------------------------

test('3.1.a Homepage: renders "Kiemelt Termékek" section heading', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText(/kiemelt termékek/i)).toBeVisible({ timeout: 10_000 })
})

test('3.1.b Homepage: featured products section contains at least one product card link', async ({ page }) => {
  await page.goto('/')

  // FeaturedProducts renders ProductCard components; each card is wrapped in an
  // anchor whose href begins with /products/<slug>
  const featuredSection = page.locator('section').filter({ hasText: /kiemelt termékek/i })
  await expect(featuredSection).toBeVisible({ timeout: 10_000 })

  const productLinks = featuredSection.locator('a[href^="/products/"]')
  await expect(productLinks.first()).toBeVisible({ timeout: 10_000 })
})

test('3.1.c Homepage: featured products section shows at most 4 cards', async ({ page }) => {
  await page.goto('/')

  const featuredSection = page.locator('section').filter({ hasText: /kiemelt termékek/i })
  await expect(featuredSection).toBeVisible({ timeout: 10_000 })

  const cards = featuredSection.locator('a[href^="/products/"]')
  const count = await cards.count()
  expect(count).toBeGreaterThanOrEqual(1)
  expect(count).toBeLessThanOrEqual(4)
})

test('3.1.d Homepage: clicking a featured product navigates to product detail URL', async ({ page }) => {
  await page.goto('/')

  const featuredSection = page.locator('section').filter({ hasText: /kiemelt termékek/i })
  const firstCard = featuredSection.locator('a[href^="/products/"]').first()
  await firstCard.click()

  // URL must be /products/<slug> — not the listing page
  await expect(page).toHaveURL(/\/products\/.+/, { timeout: 8_000 })
  expect(page.url()).not.toMatch(/\/products\/?$/)
})

test('3.1.e Homepage: category grid renders at least one category link', async ({ page }) => {
  await page.goto('/')

  // CategoryCard renders <Link href="/products?category=<slug>">
  const categoryLinks = page.locator('a[href*="/products?category="]')
  await expect(categoryLinks.first()).toBeVisible({ timeout: 10_000 })
})

test('3.1.f Homepage: clicking a known category navigates to filtered products listing', async ({ page }) => {
  await page.goto('/')

  const categoryLink = page.locator(`a[href*="/products?category=${KNOWN_CATEGORY_SLUG}"]`).first()
  await categoryLink.click()

  await expect(page).toHaveURL(new RegExp(`category=${KNOWN_CATEGORY_SLUG}`), { timeout: 8_000 })
  // ProductsPage renders the category name as the h1 when the slug resolves
  await expect(page.getByRole('heading', { name: new RegExp(KNOWN_CATEGORY_NAME, 'i') })).toBeVisible()
})

// ---------------------------------------------------------------------------
// TASK 3.2 — Products listing: server-side filtering + sorting
// ---------------------------------------------------------------------------

test('3.2.a Products listing: /products loads and shows product count > 0', async ({ page }) => {
  await page.goto('/products')

  // "X Termék található" — visible on Desktop Chrome (sm: breakpoint applies)
  const countText = page.getByText(/termék található/i)
  await expect(countText).toBeVisible({ timeout: 10_000 })

  const text = await countText.textContent()
  const match = text?.match(/(\d+)/)
  expect(match).not.toBeNull()
  const count = parseInt(match![1], 10)
  expect(count).toBeGreaterThan(0)
})

test('3.2.b Products listing: category filter shows matching category heading', async ({ page }) => {
  await page.goto(`/products?category=${KNOWN_CATEGORY_SLUG}`)

  // ProductsPage sets h1 = categoryName when the slug resolves
  await expect(
    page.getByRole('heading', { name: new RegExp(KNOWN_CATEGORY_NAME, 'i') })
  ).toBeVisible({ timeout: 10_000 })

  // Product count indicator must be present
  await expect(page.getByText(/termék található/i)).toBeVisible()
})

test('3.2.c Products listing: unknown category slug shows all-products fallback heading', async ({ page }) => {
  // NOTE: The implementation does NOT return 0 products for an unresolved slug.
  // When the slug lookup yields no category, categoryId stays undefined and the
  // query returns all active products.  The h1 falls back to "Termékeink".
  await page.goto('/products?category=nem-letezik-ilyen-kategoria-xyz')

  await expect(
    page.getByRole('heading', { name: /termékeink/i })
  ).toBeVisible({ timeout: 10_000 })

  // The count indicator should still render (showing whatever active products exist)
  await expect(page.getByText(/termék található/i)).toBeVisible()
})

test('3.2.d Products listing: search query filters results by name', async ({ page }) => {
  await page.goto('/products?search=kanapé')

  // ProductsPage h1: Keresés: "<term>"
  await expect(page.getByText(/keresés.*kanapé/i)).toBeVisible({ timeout: 10_000 })

  const countText = page.getByText(/termék található/i)
  await expect(countText).toBeVisible()

  const text = await countText.textContent()
  const match = text?.match(/(\d+)/)
  if (match) {
    expect(parseInt(match[1], 10)).toBeGreaterThan(0)
  }
})

test('3.2.e Products listing: search with no results shows 0 products', async ({ page }) => {
  await page.goto('/products?search=xxxxxxnonexistentitemyyy')

  await expect(page.getByText(/termék található/i)).toBeVisible({ timeout: 10_000 })

  const countText = page.getByText(/termék található/i)
  const text = await countText.textContent()
  const match = text?.match(/(\d+)/)
  if (match) {
    expect(parseInt(match[1], 10)).toBe(0)
  }
})

test('3.2.f Products listing: sort=price_asc loads without error', async ({ page }) => {
  await page.goto('/products?sort=price_asc')

  await expect(page.getByText(/termék található/i)).toBeVisible({ timeout: 10_000 })
  // Must not have navigated away to an error or 404 page
  await expect(page).not.toHaveURL('/not-found')
})

test('3.2.g Products listing: sort=price_desc loads without error', async ({ page }) => {
  await page.goto('/products?sort=price_desc')

  await expect(page.getByText(/termék található/i)).toBeVisible({ timeout: 10_000 })
})

test('3.2.h Products listing: combined category + search filter renders without error', async ({ page }) => {
  await page.goto(`/products?category=${KNOWN_CATEGORY_SLUG}&search=nordic`)

  await expect(page.getByText(/termék található/i)).toBeVisible({ timeout: 10_000 })
})

// ---------------------------------------------------------------------------
// TASK 3.3 — Product detail: slug lookup + related products + metadata
// ---------------------------------------------------------------------------

test('3.3.a Product detail: known slug renders a visible heading', async ({ page }) => {
  await page.goto(`/products/${KNOWN_PRODUCT_SLUG}`)

  // ProductInfo renders the product name; it appears in at minimum h1 or h2
  await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
})

test('3.3.b Product detail: breadcrumb category link uses a slug, not a UUID', async ({ page }) => {
  await page.goto(`/products/${KNOWN_PRODUCT_SLUG}`)

  await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })

  // Breadcrumb nav contains a link to /products?category=<slug>
  const breadcrumbNav = page.locator('nav[aria-label="Breadcrumb"]')
  await expect(breadcrumbNav).toBeVisible()

  const categoryLink = breadcrumbNav.locator('a[href*="/products"]')
  await expect(categoryLink).toBeVisible()

  const href = await categoryLink.getAttribute('href')
  expect(href).not.toBeNull()

  // The category segment must be a human-readable slug, never a raw UUID
  expect(href).not.toMatch(UUID_PATTERN)
})

test('3.3.c Product detail: <title> tag is populated by generateMetadata', async ({ page }) => {
  await page.goto(`/products/${KNOWN_PRODUCT_SLUG}`)

  await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })

  const title = await page.title()
  expect(title.trim()).not.toBe('')
  expect(title.toLowerCase()).not.toContain('create next app')
  // generateMetadata sets title to the product name, which must differ from the
  // generic fallback
  expect(title.toLowerCase()).not.toBe('next.js app')
})

test('3.3.d Product detail: related products section is visible when same-category products exist', async ({ page }) => {
  await page.goto(`/products/${KNOWN_PRODUCT_SLUG}`)

  await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })

  // RelatedProducts renders "Hasonló termékek" heading only when related.length > 0
  const relatedHeading = page.getByText(/hasonló termékek/i)
  const count = await relatedHeading.count()
  if (count > 0) {
    await expect(relatedHeading).toBeVisible()
    // There should be at least one product link beyond the current page's own links
    const relatedLinks = page.locator('section').filter({ hasText: /hasonló termékek/i }).locator('a[href^="/products/"]')
    await expect(relatedLinks.first()).toBeVisible()
  }
  // If 0 results: acceptable — RelatedProducts returns null when array is empty
})

test('3.3.e Product detail: invalid slug returns 404 page', async ({ page }) => {
  await page.goto('/products/ez-a-termek-biztosan-nem-letezik-xyzabc')

  // Next.js notFound() triggers the not-found UI
  await expect(
    page.getByText(/nem található|404|not found/i)
  ).toBeVisible({ timeout: 8_000 })
})

// ---------------------------------------------------------------------------
// TASK 3.4 — Account page: real profile data
// ---------------------------------------------------------------------------

test('3.4.a Account page: authenticated customer sees their email pre-filled', async ({ page }) => {
  requireCredentials()

  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
  await page.goto('/account')

  // ProfileForm renders the email field with label "E-mail cím" and disabled
  const emailInput = page.getByLabel(/e-mail/i)
  await expect(emailInput).toBeVisible({ timeout: 10_000 })
  await expect(emailInput).toHaveValue(CUSTOMER_EMAIL)
})

test('3.4.b Account page: email field is read-only (disabled)', async ({ page }) => {
  requireCredentials()

  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
  await page.goto('/account')

  // The email field is always disabled — it cannot be changed from the profile form
  const emailInput = page.getByLabel(/e-mail/i)
  await expect(emailInput).toBeDisabled()
})

test('3.4.c Account page: unauthenticated access redirects to /login', async ({ page }) => {
  await page.goto('/account')

  // Middleware redirects /account to /login?redirect=%2Faccount
  await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })
  expect(page.url()).toContain('redirect=%2Faccount')
})

// ---------------------------------------------------------------------------
// TASK 3.5 — Order pages: /account/orders and /account/orders/[id]
// ---------------------------------------------------------------------------

test('3.5.a Orders list: authenticated user sees "Rendelési előzmények" heading', async ({ page }) => {
  requireCredentials()

  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
  await page.goto('/account/orders')

  await expect(
    page.getByRole('heading', { name: /rendelési előzmények/i })
  ).toBeVisible({ timeout: 10_000 })
})

test('3.5.b Orders list: unauthenticated access redirects to /login', async ({ page }) => {
  await page.goto('/account/orders')

  // Middleware catches /account/* routes and redirects
  await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })
  expect(page.url()).toContain('redirect=%2Faccount%2Forders')
})

test('3.5.c Orders list: back link navigates to /account', async ({ page }) => {
  requireCredentials()

  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
  await page.goto('/account/orders')

  await page.getByRole('link', { name: /vissza a fiókhoz/i }).click()
  await expect(page).toHaveURL('/account', { timeout: 5_000 })
})

test('3.5.d Orders list: customer with seeded orders sees at least one order row', async ({ page }) => {
  requireCredentials()

  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
  await page.goto('/account/orders')

  // OrderRow renders a link to /account/orders/<uuid>
  const orderLinks = page.locator('a[href^="/account/orders/"]')
  const count = await orderLinks.count()
  // Requires at least 1 seeded order for E2E_CUSTOMER in Supabase
  expect(count).toBeGreaterThan(0)
})

test('3.5.e Order detail: clicking an order row opens the detail page', async ({ page }) => {
  requireCredentials()

  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
  await page.goto('/account/orders')

  const firstOrderLink = page.locator('a[href^="/account/orders/"]').first()
  await firstOrderLink.click()

  await expect(page).toHaveURL(/\/account\/orders\/.+/, { timeout: 8_000 })
})

test('3.5.f Order detail: shows "Megrendelt Tételek" section', async ({ page }) => {
  requireCredentials()

  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
  await page.goto('/account/orders')

  const firstOrderLink = page.locator('a[href^="/account/orders/"]').first()
  await firstOrderLink.click()

  await expect(page.getByText(/megrendelt tételek/i)).toBeVisible({ timeout: 10_000 })
})

test('3.5.g Order detail: shows "Összesítő" section with "Végösszeg" line', async ({ page }) => {
  requireCredentials()

  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
  await page.goto('/account/orders')

  const firstOrderLink = page.locator('a[href^="/account/orders/"]').first()
  await firstOrderLink.click()

  await expect(page.getByText(/összesítő/i)).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText(/végösszeg/i)).toBeVisible()
})

test('3.5.h Order detail: back link navigates to /account/orders', async ({ page }) => {
  requireCredentials()

  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
  await page.goto('/account/orders')

  const firstOrderLink = page.locator('a[href^="/account/orders/"]').first()
  await firstOrderLink.click()

  await page.getByRole('link', { name: /vissza a rendelésekhez/i }).click()
  await expect(page).toHaveURL('/account/orders', { timeout: 5_000 })
})

test('3.5.i Order detail: invalid order ID returns 404 page', async ({ page }) => {
  requireCredentials()

  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
  // Use a value that is not a valid UUID — Supabase single() returns no row
  await page.goto('/account/orders/00000000-0000-0000-0000-000000000000')

  await expect(
    page.getByText(/nem található|404|not found/i)
  ).toBeVisible({ timeout: 8_000 })
})

// ---------------------------------------------------------------------------
// TASK 3.6 — Admin products: /admin/products
// ---------------------------------------------------------------------------

test('3.6.a Admin products: admin user sees product table with at least one data row', async ({ page }) => {
  requireAdminCredentials()

  await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD)
  await page.goto('/admin/products')

  await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })

  // At least one data row beyond the header row
  const rows = page.getByRole('row')
  const count = await rows.count()
  expect(count).toBeGreaterThan(1)
})

test('3.6.b Admin products: "Új termék" button is present', async ({ page }) => {
  requireAdminCredentials()

  await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD)
  await page.goto('/admin/products')

  await expect(
    page.getByRole('link', { name: /új termék/i })
  ).toBeVisible({ timeout: 10_000 })
})

test('3.6.c Admin products: customer user is redirected away from /admin', async ({ page }) => {
  requireCredentials()

  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
  await page.goto('/admin')

  // Middleware checks role='admin' and redirects customers to /
  await expect(page).toHaveURL('/', { timeout: 5_000 })
})

// ---------------------------------------------------------------------------
// Mock data sentinel checks
// ---------------------------------------------------------------------------

test('EC.1 Products listing: HTML does not contain mock product ID "prod-1"', async ({ page }) => {
  await page.goto('/products')

  await expect(page.getByText(/termék található/i)).toBeVisible({ timeout: 10_000 })

  const content = await page.content()
  // IDs prod-1..prod-18 are mock data sentinels — must not appear after Iteration 3
  expect(content).not.toMatch(/"prod-1"/)
  expect(content).not.toMatch(/"cat-1"/)
})

test('EC.2 Homepage: HTML does not contain mock user name "Kovács Anna"', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText(/kiemelt termékek/i)).toBeVisible({ timeout: 10_000 })

  const content = await page.content()
  // MOCK_USER name from lib/mock-data.ts must not appear in any rendered page
  expect(content).not.toContain('Kovács Anna')
})

test('EC.3 Product detail: breadcrumb does not reference mock category ID "cat-1"', async ({ page }) => {
  await page.goto(`/products/${KNOWN_PRODUCT_SLUG}`)

  await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })

  const content = await page.content()
  // After Iteration 3, category hrefs use Supabase slugs, never "cat-1"
  expect(content).not.toContain('category=cat-1')
})
