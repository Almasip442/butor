import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Iteration 4: Admin CRUD + Supabase Storage + Kategória kezelés +
//              Rendelés státusz frissítés + Profil szerkesztés Server Action
//
// Acceptance criteria verified:
//   4.1 — Termék létrehozás és szerkesztés Server Action (upsertProduct)
//   4.2 — Termék törlés Server Action (deleteProduct + AlertDialog)
//   4.3 — ImageUploader bekötése Supabase Storage-ra (uploadProductImage)
//   4.4 — Kategóriák CRUD oldal (Supabase persist — createCategory / updateCategory / deleteCategory)
//   4.5 — Rendelés státusz frissítése admin oldalon (updateOrderStatus — Supabase persist)
//   4.6 — Profil szerkesztés Server Action (updateProfile — users tábla update)
//
// Prerequisites (must exist in Supabase before running):
//   - Admin user:    E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD (users.role = 'admin')
//   - Customer user: E2E_CUSTOMER_EMAIL / E2E_CUSTOMER_PASSWORD
//   - At least 1 seeded order for the customer user
//   - At least 1 seeded product in Supabase (for edit/delete tests)
//   - At least 1 seeded category in Supabase
//   - Supabase Storage bucket 'product-images' configured (public or accessible)
//
// Key implementation anchors verified against source:
//   - ImageUploader alt text: "Termékkép {index + 1}" (Hungarian) — NOT "Product image"
//   - ImageUploader size error: "A fájl mérete meghaladja a megengedett 5 MB-ot."
//   - ImageUploader remove button aria-label: "{n}. kép eltávolítása"
//   - ProfileForm full_name Zod min: 2 characters
//   - ProfileForm email aria-label: "E-mail cím (nem módosítható)"
//   - ProfileForm save button: "Változások mentése"
//   - OrdersDataTable status: shadcn/ui Select (not native <select>) — value checked via data attribute
//   - CategoriesClient create button: disabled unless name AND slug filled
//   - AlertDialog confirm button: "Törlés" (in both product and category delete flows)
// ---------------------------------------------------------------------------

const ADMIN_EMAIL    = process.env.E2E_ADMIN_EMAIL!
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD!
const CUSTOMER_EMAIL    = process.env.E2E_CUSTOMER_EMAIL!
const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD!

// ---------------------------------------------------------------------------
// Guards — skip test if required env vars are absent
// ---------------------------------------------------------------------------

function requireAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    test.skip(true, 'E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set — skipping admin test')
  }
}

function requireCustomer() {
  if (!CUSTOMER_EMAIL || !CUSTOMER_PASSWORD) {
    test.skip(true, 'E2E_CUSTOMER_EMAIL / E2E_CUSTOMER_PASSWORD not set — skipping customer test')
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  // Use first() because the password confirmation field on register is on a different page
  await page.getByLabel(/e-mail/i).fill(email)
  await page.getByLabel(/jelszó/i).first().fill(password)
  await page.getByRole('button', { name: /bejelentkezés/i }).click()
  // Wait for successful navigation away from /login
  await expect(page).not.toHaveURL(/\/login/, { timeout: 12_000 })
}

async function loginAsAdmin(page: Page) {
  await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD)
}

async function loginAsCustomer(page: Page) {
  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
}

/** Opens the actions DropdownMenu for the nth data row (1-based, skipping header). */
async function openRowMenu(page: Page, rowIndex = 1) {
  const row = page.getByRole('row').nth(rowIndex)
  await row.getByRole('button', { name: /menü megnyitása/i }).click()
}

/** Returns the text content of a specific cell in the nth data row. */
async function getRowCellText(page: Page, rowIndex: number, cellIndex: number): Promise<string> {
  const text = await page
    .getByRole('row')
    .nth(rowIndex)
    .getByRole('cell')
    .nth(cellIndex)
    .textContent()
  return (text ?? '').trim()
}

// Minimal 1×1 PNG encoded as base64 (valid image, ~68 bytes)
const TINY_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

// ---------------------------------------------------------------------------
// 4.1 — Termék létrehozás Server Action
// ---------------------------------------------------------------------------

test.describe('4.1 Termék létrehozás', () => {

  test('4.1.a — Új termék oldal betöltése admin felhasználóval', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products/new')

    await expect(
      page.getByRole('heading', { name: /új termék létrehozása/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('4.1.b — Form validáció: kötelező mezők üres beküldéskor hibát jelenít meg', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products/new')

    // Submit the empty form
    await page.getByRole('button', { name: /mentés/i }).click()

    // Expect at least one Zod validation error (name or slug min 3 chars)
    await expect(page.getByText(/legalább [23] karakter/i).first()).toBeVisible({ timeout: 5_000 })
  })

  test('4.1.c — Kategória dropdown valódi Supabase kategóriákat listáz (nem mock cat-1..cat-6)', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products/new')

    // Open the shadcn/ui Select (rendered as role=combobox)
    await page.getByRole('combobox').click()

    // Wait for options to appear
    const listbox = page.locator('[role="listbox"]')
    await expect(listbox).toBeVisible({ timeout: 8_000 })

    // Mock category IDs (cat-1..cat-6) must not appear in the dropdown content
    const content = await listbox.innerHTML()
    expect(content).not.toMatch(/cat-[1-6]/)
  })

  test('4.1.d — Termék létrehozása: mentés után redirect /admin/products-ra, az új termék látható (persistence)', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products/new')

    const ts = Date.now()
    const uniqueName = `E2E Teszt Termék ${ts}`
    const uniqueSlug = `e2e-teszt-${ts}`

    // Fill required text fields (label text matches the actual FormLabel values in ProductForm)
    await page.getByLabel(/termék neve/i).fill(uniqueName)
    await page.getByLabel(/url.*slug/i).fill(uniqueSlug)
    await page.getByLabel(/leírás/i).fill('Ez egy automatikus E2E teszt termék leírása, legalább tíz karakter.')
    await page.getByLabel(/ár/i).first().fill('49900')
    await page.getByLabel(/készlet/i).fill('10')

    // Select first available category from the combobox
    await page.getByRole('combobox').click()
    await page.locator('[role="option"]').first().click()

    // Upload a small valid image through the file input
    // ImageUploader renders <input type="file" accept="image/*" aria-label="Képfájlok kiválasztása">
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-product.png',
      mimeType: 'image/png',
      buffer: Buffer.from(TINY_PNG_BASE64, 'base64'),
    })

    // Wait for Supabase Storage upload to complete — ImageUploader shows "Termékkép 1" alt
    await expect(
      page.locator('img[alt="Termékkép 1"]')
    ).toBeVisible({ timeout: 20_000 })

    // Submit the form
    await page.getByRole('button', { name: /mentés/i }).click()

    // upsertProduct Server Action redirects to /admin/products on success
    await expect(page).toHaveURL('/admin/products', { timeout: 20_000 })

    // The new product must appear in the table (Supabase persistence verified by page load)
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 10_000 })
  })
})

// ---------------------------------------------------------------------------
// 4.1 — Termék szerkesztés Server Action
// ---------------------------------------------------------------------------

test.describe('4.1 Termék szerkesztés', () => {

  test('4.1.e — Szerkesztés oldal betöltése valódi Supabase termék UUID-vel (nem 404)', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products')

    // Navigate to the edit page of the first product via its dropdown menu
    await openRowMenu(page, 1)
    await page.getByRole('menuitem', { name: /szerkesztés/i }).click()

    // Must NOT end up on a 404/not-found page
    await expect(page).not.toHaveURL(/not-found|404/, { timeout: 10_000 })
    await expect(
      page.getByRole('heading', { name: /termék szerkesztése/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('4.1.f — Szerkesztés form: meglévő termék adatai előtöltve (name mező nem üres)', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products')

    await openRowMenu(page, 1)
    await page.getByRole('menuitem', { name: /szerkesztés/i }).click()

    await expect(
      page.getByRole('heading', { name: /termék szerkesztése/i })
    ).toBeVisible({ timeout: 10_000 })

    // The name field must be pre-filled from Supabase — not empty
    const nameInput = page.getByLabel(/termék neve/i)
    const nameValue = await nameInput.inputValue()
    expect(nameValue.length).toBeGreaterThan(0)
  })

  test('4.1.g — Termék szerkesztés mentése: módosított ár perzisztál (reload után táblában látható)', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products')

    // Record the name of the first product so we can find it after redirect
    const productName = await getRowCellText(page, 1, 1)

    await openRowMenu(page, 1)
    await page.getByRole('menuitem', { name: /szerkesztés/i }).click()

    await expect(
      page.getByRole('heading', { name: /termék szerkesztése/i })
    ).toBeVisible({ timeout: 10_000 })

    // Change the price to a recognizable sentinel value: 99 999 Ft
    const priceInput = page.getByLabel(/ár/i).first()
    await priceInput.clear()
    await priceInput.fill('99999')

    await page.getByRole('button', { name: /mentés/i }).click()

    // upsertProduct redirects to /admin/products on success
    await expect(page).toHaveURL('/admin/products', { timeout: 20_000 })

    // Find the row for this product and verify the updated price is shown
    // Hungarian number format: 99 999 (space as thousand separator)
    const updatedRow = page.getByRole('row').filter({ hasText: productName })
    await expect(
      updatedRow.getByText(/99[\s\u00a0]?999/)
    ).toBeVisible({ timeout: 10_000 })
  })
})

// ---------------------------------------------------------------------------
// 4.2 — Termék törlés Server Action
// ---------------------------------------------------------------------------

test.describe('4.2 Termék törlés', () => {

  test('4.2.a — Törlés menüpont megjelenít AlertDialog megerősítő dialógust', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products')

    await openRowMenu(page, 1)
    // The DropdownMenuItem text is "Törlés"
    await page.getByRole('menuitem', { name: /törlés/i }).click()

    // ProductsDataTable renders AlertDialog with role="alertdialog"
    await expect(
      page.getByRole('alertdialog')
    ).toBeVisible({ timeout: 5_000 })

    // The dialog title must confirm the destructive action
    await expect(
      page.getByRole('alertdialog').getByText(/termék törlése/i)
    ).toBeVisible()
  })

  test('4.2.b — Törlés mégse: termék megmarad a táblában', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products')

    const productName = await getRowCellText(page, 1, 1)

    await openRowMenu(page, 1)
    await page.getByRole('menuitem', { name: /törlés/i }).click()

    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5_000 })

    // Click "Mégse" (AlertDialogCancel) — product must NOT be deleted
    await page.getByRole('button', { name: /mégse/i }).click()

    // Dialog must close
    await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 3_000 })

    // Product must still be present in the table
    await expect(page.getByText(productName)).toBeVisible({ timeout: 5_000 })
  })

  test('4.2.c — Törlés megerősítés: termék eltűnik a táblából és az oldal újratöltése után sem látható', async ({ page }) => {
    requireAdmin()

    // Strategy: first create a dedicated product, then delete it.
    // This avoids polluting real seed data.
    await loginAsAdmin(page)
    await page.goto('/admin/products/new')

    const ts = Date.now()
    const deletableName = `Torlendo E2E ${ts}`
    const deletableSlug = `torlendo-${ts}`

    await page.getByLabel(/termék neve/i).fill(deletableName)
    await page.getByLabel(/url.*slug/i).fill(deletableSlug)
    await page.getByLabel(/leírás/i).fill('Ez a termék csak a törlés tesztelésére készült.')
    await page.getByLabel(/ár/i).first().fill('1000')
    await page.getByLabel(/készlet/i).fill('1')

    await page.getByRole('combobox').click()
    await page.locator('[role="option"]').first().click()

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'del-test.png',
      mimeType: 'image/png',
      buffer: Buffer.from(TINY_PNG_BASE64, 'base64'),
    })
    await expect(page.locator('img[alt="Termékkép 1"]')).toBeVisible({ timeout: 20_000 })

    await page.getByRole('button', { name: /mentés/i }).click()
    await expect(page).toHaveURL('/admin/products', { timeout: 20_000 })
    await expect(page.getByText(deletableName)).toBeVisible({ timeout: 10_000 })

    // Now delete it: find the row for this specific product
    const deletableRow = page.getByRole('row').filter({ hasText: deletableName })
    await deletableRow.getByRole('button', { name: /menü megnyitása/i }).click()
    await page.getByRole('menuitem', { name: /törlés/i }).click()

    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5_000 })

    // Confirm deletion via AlertDialogAction (also labelled "Törlés")
    // Use a more specific selector to distinguish AlertDialogAction from DropdownMenuItem
    await page.getByRole('alertdialog').getByRole('button', { name: /törlés/i }).click()

    // After Server Action: the row must disappear from the live table (optimistic removal)
    await expect(page.getByText(deletableName)).not.toBeVisible({ timeout: 10_000 })

    // Hard reload: verify Supabase persistence — product must not reappear
    await page.reload()
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(deletableName)).not.toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// 4.3 — ImageUploader bekötése Supabase Storage-ra
// ---------------------------------------------------------------------------

test.describe('4.3 Képfeltöltés Supabase Storage-ra', () => {

  test('4.3.a — Kép kiválasztás után az előnézeti kép megjelenik a feltöltő komponensben', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products/new')

    // ImageUploader file input has aria-label="Képfájlok kiválasztása"
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'upload-test.png',
      mimeType: 'image/png',
      buffer: Buffer.from(TINY_PNG_BASE64, 'base64'),
    })

    // ImageUploader renders: <Image alt={`Termékkép ${index + 1}`} ...>
    // index 0 → alt="Termékkép 1"
    await expect(
      page.locator('img[alt="Termékkép 1"]')
    ).toBeVisible({ timeout: 20_000 })
  })

  test('4.3.b — Feltöltött kép URL-je Supabase Storage public URL (nem blob: prefix)', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products/new')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'storage-test.png',
      mimeType: 'image/png',
      buffer: Buffer.from(TINY_PNG_BASE64, 'base64'),
    })

    // Wait until the upload completes and preview image appears
    await expect(page.locator('img[alt="Termékkép 1"]')).toBeVisible({ timeout: 20_000 })

    // The src must be a Supabase Storage public URL, NOT a blob: object URL
    const imgSrc = await page.locator('img[alt="Termékkép 1"]').getAttribute('src')
    expect(imgSrc).not.toBeNull()
    expect(imgSrc).not.toMatch(/^blob:/)
    // Supabase public storage URL contains the project host or storage path segment
    expect(imgSrc).toMatch(/supabase\.co|storage\/v1\/object\/public/)
  })

  test('4.3.c — Kép eltávolítása az előnézeti rácsból (remove button)', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products/new')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'remove-test.png',
      mimeType: 'image/png',
      buffer: Buffer.from(TINY_PNG_BASE64, 'base64'),
    })

    await expect(page.locator('img[alt="Termékkép 1"]')).toBeVisible({ timeout: 20_000 })

    // ImageUploader renders a remove button with aria-label="{n}. kép eltávolítása"
    // It is inside a .group div that becomes visible on hover
    const removeButton = page.getByRole('button', { name: /1\. kép eltávolítása/i })
    // Reveal via hover
    await page.locator('img[alt="Termékkép 1"]').hover()
    await removeButton.click({ force: true })

    // After removal, the preview image must no longer be present
    await expect(page.locator('img[alt="Termékkép 1"]')).not.toBeVisible({ timeout: 5_000 })
  })

  test('4.3.d — 5MB feletti fájl feltöltési kísérlete inline hibaüzenetet jelenít meg', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products/new')

    // Generate a buffer just over the 5MB limit
    const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1, 0)

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'too-large.png',
      mimeType: 'image/png',
      buffer: oversizedBuffer,
    })

    // ImageUploader sets sizeError state → renders: "A fájl mérete meghaladja a megengedett 5 MB-ot."
    await expect(
      page.getByText(/mérete meghaladja|max.*5\s?mb|5\s?mb/i)
    ).toBeVisible({ timeout: 8_000 })

    // No preview image must be added
    await expect(page.locator('img[alt="Termékkép 1"]')).not.toBeVisible()
  })

  test('4.3.e — File input accept attribútuma "image/*" (non-image fájlok szűrve)', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products/new')

    // ImageUploader: <input type="file" accept="image/*" ...>
    const fileInput = page.locator('input[type="file"]')
    const acceptAttr = await fileInput.getAttribute('accept')
    expect(acceptAttr).toContain('image')
  })
})

// ---------------------------------------------------------------------------
// 4.4 — Kategóriák CRUD oldal (Supabase persist)
// ---------------------------------------------------------------------------

test.describe('4.4 Kategóriák CRUD', () => {

  test('4.4.a — Kategóriák oldal betöltése: táblázat látható legalább egy adatsorral', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/categories')

    // CategoriesClient renders <h1>Kategóriák</h1>
    await expect(
      page.getByRole('heading', { name: /kategóriák/i })
    ).toBeVisible({ timeout: 10_000 })

    await expect(page.getByRole('table')).toBeVisible()

    // header row + at least 1 data row
    const rowCount = await page.getByRole('row').count()
    expect(rowCount).toBeGreaterThan(1)
  })

  test('4.4.b — Kategóriák oldal: nincs mock cat-1..cat-6 ID az HTML-ben', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/categories')

    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })

    // After Iteration 4 all category IDs must be real Supabase UUIDs
    const content = await page.content()
    expect(content).not.toMatch(/cat-[1-6]/)
  })

  test('4.4.c — Új kategória létrehozása: megjelenik a táblában az oldal újratöltése után (Supabase persist)', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/categories')

    // Open the create Dialog (Button text: "Új kategória")
    await page.getByRole('button', { name: /új kategória/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })

    const ts = Date.now()
    const uniqueName = `E2E Kategória ${ts}`
    const uniqueSlug = `e2e-kat-${ts}`

    // Dialog fields use Label htmlFor pointing to Input ids: "create-name", "create-slug"
    // getByLabel matches the Label text to its associated Input
    await page.getByLabel(/kategória neve/i).fill(uniqueName)
    await page.getByLabel(/url.*slug/i).fill(uniqueSlug)

    // Save button is enabled when both name and slug are filled
    await page.getByRole('button', { name: /^mentés$/i }).click()

    // Dialog closes after successful createCategory action
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 })

    // Hard reload — verifies Supabase persistence (not just local React state)
    await page.reload()
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 5_000 })
  })

  test('4.4.d — Új kategória: Mentés gomb disabled amíg a kötelező mezők üresek', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/categories')

    await page.getByRole('button', { name: /új kategória/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })

    // Both name and slug are empty → save button must be disabled
    // CategoriesClient: disabled={!newCategory.name || !newCategory.slug || isPending}
    const saveButton = page.getByRole('dialog').getByRole('button', { name: /^mentés$/i })
    await expect(saveButton).toBeDisabled()

    // Fill only name → still disabled
    await page.getByLabel(/kategória neve/i).fill('Test')
    await expect(saveButton).toBeDisabled()

    // Fill slug too → now enabled
    await page.getByLabel(/url.*slug/i).fill('test')
    await expect(saveButton).toBeEnabled()
  })

  test('4.4.e — Kategória törlése: törlés megerősítés után eltűnik az oldal újratöltésekor (Supabase persist)', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/categories')

    // First create a dedicated disposable category so we don't touch seed data
    await page.getByRole('button', { name: /új kategória/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })

    const ts = Date.now()
    const disposableName = `Torlendo Kat ${ts}`
    const disposableSlug = `torlendo-kat-${ts}`

    await page.getByLabel(/kategória neve/i).fill(disposableName)
    await page.getByLabel(/url.*slug/i).fill(disposableSlug)
    await page.getByRole('button', { name: /^mentés$/i }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 })

    // Reload to confirm it's persisted before deleting
    await page.reload()
    await expect(page.getByText(disposableName)).toBeVisible({ timeout: 10_000 })

    // Delete it: find the row and open its dropdown menu
    const disposableRow = page.getByRole('row').filter({ hasText: disposableName })
    await disposableRow.getByRole('button', { name: /menü megnyitása/i }).click()
    await page.getByRole('menuitem', { name: /törlés/i }).click()

    // AlertDialog must appear for the destructive action
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5_000 })

    // Confirm deletion (AlertDialogAction button label: "Törlés")
    await page.getByRole('alertdialog').getByRole('button', { name: /törlés/i }).click()

    // Reload and verify Supabase persistence — the category must not reappear
    await page.reload()
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(disposableName)).not.toBeVisible()
  })

  test('4.4.f — Kategória szerkesztése: módosított név megjelenik az oldal újratöltése után (Supabase persist)', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/categories')

    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })

    // Open the edit Dialog for the first data row
    // CategoriesClient: openEdit() is triggered via DropdownMenuItem "Szerkesztés"
    await openRowMenu(page, 1)
    await page.getByRole('menuitem', { name: /szerkesztés/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })

    // Edit dialog has Label htmlFor="edit-name"
    const ts = Date.now()
    const updatedName = `Frissített Kat ${ts}`
    const nameInput = page.getByLabel(/kategória neve/i)
    await nameInput.clear()
    await nameInput.fill(updatedName)

    await page.getByRole('button', { name: /^mentés$/i }).click()

    // Dialog must close after successful updateCategory action
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 })

    // Hard reload to verify Supabase persistence
    await page.reload()
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 5_000 })
  })
})

// ---------------------------------------------------------------------------
// 4.5 — Rendelés státusz frissítése admin oldalon
// ---------------------------------------------------------------------------

test.describe('4.5 Rendelés státusz frissítés', () => {

  test('4.5.a — Admin rendelések lista oldal betölt: táblázat rendelésekkel (valódi Supabase adat)', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/orders')

    // AdminOrdersPage renders <h1>Rendelések</h1>
    await expect(
      page.getByRole('heading', { name: /^rendelések$/i })
    ).toBeVisible({ timeout: 10_000 })

    await expect(page.getByRole('table')).toBeVisible()

    // At least one data row (header + 1)
    expect(await page.getByRole('row').count()).toBeGreaterThan(1)
  })

  test('4.5.b — Admin rendelések: "Kovács Anna" mock vásárló neve NEM jelenik meg az oldalon', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/orders')

    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })

    // After Iteration 4 the table must show real user names from Supabase, not hardcoded mock data
    const content = await page.content()
    expect(content).not.toContain('Kovács Anna')
  })

  test('4.5.c — Státusz módosítása a listán: Select változtatása utáni újratöltéskor megmarad (Supabase persist)', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/orders')

    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })

    // OrdersDataTable renders a shadcn/ui Select for each row status.
    // The SelectTrigger renders as role="combobox" — get the first one in the first data row.
    const firstDataRow = page.getByRole('row').nth(1)
    const statusSelect = firstDataRow.getByRole('combobox')

    // Read the current displayed label text inside the trigger
    const currentLabel = (await statusSelect.textContent() ?? '').trim()

    // Pick a target status that is different from the current one
    // We toggle between "Feldolgozás alatt" and "Visszaigazolva"
    const targetLabel = currentLabel.includes('Feldolgozás alatt') ? 'Visszaigazolva' : 'Feldolgozás alatt'
    const targetValue = targetLabel === 'Feldolgozás alatt' ? 'processing' : 'confirmed'

    await statusSelect.click()
    await page.getByRole('option', { name: targetLabel }).click()

    // Wait for the toast success to appear (updateOrderStatus action completed)
    await expect(
      page.getByText(/státusz frissítve/i)
    ).toBeVisible({ timeout: 10_000 })

    // Hard reload — verify Supabase persistence
    await page.reload()
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })

    // After reload, the first row's select must show the new status label
    const reloadedSelect = page.getByRole('row').nth(1).getByRole('combobox')
    await expect(reloadedSelect).toContainText(targetLabel, { timeout: 10_000 })

    // Also verify via data-value attribute if accessible
    const dataValue = await reloadedSelect.getAttribute('data-value').catch(() => null)
    if (dataValue !== null) {
      expect(dataValue).toBe(targetValue)
    }
  })

  test('4.5.d — Admin rendelés részlet: OrderStatusSelect (combobox) látható a jobb oldali sávban', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/orders')

    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })

    // Navigate to the first order detail via the "Részletek" link button
    const firstRow = page.getByRole('row').nth(1)
    await firstRow.getByRole('link', { name: /részletek/i }).click()

    await expect(page).toHaveURL(/\/admin\/orders\/.+/, { timeout: 8_000 })

    // AdminOrderDetailPage renders OrderStatusSelect which has:
    // <SelectTrigger aria-label="Rendelés státuszának módosítása">
    await expect(
      page.getByRole('combobox', { name: /rendelés státuszának módosítása/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('4.5.e — Admin rendelés részlet: státusz módosítása után az új érték megmarad az oldal újratöltésekor', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/orders')

    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })

    // Navigate to first order detail
    const firstRow = page.getByRole('row').nth(1)
    await firstRow.getByRole('link', { name: /részletek/i }).click()

    await expect(page).toHaveURL(/\/admin\/orders\/.+/, { timeout: 8_000 })
    const detailUrl = page.url()

    // OrderStatusSelect renders a combobox with aria-label
    const statusSelect = page.getByRole('combobox', { name: /rendelés státuszának módosítása/i })
    await expect(statusSelect).toBeVisible({ timeout: 10_000 })

    // Read current label and pick a different target
    const currentLabel = (await statusSelect.textContent() ?? '').trim()
    const targetLabel = currentLabel.includes('Feldolgozás alatt') ? 'Függőben' : 'Feldolgozás alatt'

    await statusSelect.click()
    await page.getByRole('option', { name: targetLabel }).click()

    // Wait for the toast to confirm the Server Action completed
    await expect(page.getByText(/státusz frissítve/i)).toBeVisible({ timeout: 10_000 })

    // Hard reload the detail page to verify Supabase persistence
    await page.goto(detailUrl)
    await expect(
      page.getByRole('combobox', { name: /rendelés státuszának módosítása/i })
    ).toBeVisible({ timeout: 10_000 })

    // The status badge text in the sidebar must reflect the new status
    // AdminOrderDetailPage renders both a Badge and the OrderStatusSelect in "Rendelés állapota" card
    await expect(
      page.getByText(new RegExp(targetLabel, 'i'))
    ).toBeVisible({ timeout: 10_000 })
  })

  test('4.5.f — Érvénytelen rendelés UUID admin detail oldalon 404-et ad', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    // A nil UUID that cannot match any real order
    await page.goto('/admin/orders/00000000-0000-0000-0000-000000000000')

    // AdminOrderDetailPage calls notFound() when no order is returned from Supabase
    await expect(
      page.getByText(/nem található|404|not found/i)
    ).toBeVisible({ timeout: 8_000 })
  })
})

// ---------------------------------------------------------------------------
// 4.6 — Profil szerkesztés Server Action
// ---------------------------------------------------------------------------

test.describe('4.6 Profil szerkesztés Server Action', () => {

  test('4.6.a — Profil oldal: e-mail cím előtöltve a bejelentkezett felhasználóval', async ({ page }) => {
    requireCustomer()

    await loginAsCustomer(page)
    await page.goto('/account')

    // AccountPage renders ProfileForm with initialProfile that contains the email from auth.
    // Email Input has aria-label="E-mail cím (nem módosítható)"
    const emailInput = page.getByRole('textbox', { name: /e-mail cím/i })
    await expect(emailInput).toBeVisible({ timeout: 10_000 })
    await expect(emailInput).toHaveValue(CUSTOMER_EMAIL)
  })

  test('4.6.b — E-mail mező szerkeszthetetlen (disabled és readOnly)', async ({ page }) => {
    requireCustomer()

    await loginAsCustomer(page)
    await page.goto('/account')

    // ProfileForm: email Input has disabled + readOnly props
    const emailInput = page.getByRole('textbox', { name: /e-mail cím/i })
    await expect(emailInput).toBeDisabled({ timeout: 10_000 })
  })

  test('4.6.c — Profil mentés: módosított teljes név megmarad az oldal újratöltése után (Supabase persist)', async ({ page }) => {
    requireCustomer()

    await loginAsCustomer(page)
    await page.goto('/account')

    // ProfileForm full_name field label: "Teljes név"
    const nameInput = page.getByLabel(/teljes név/i)
    await expect(nameInput).toBeVisible({ timeout: 10_000 })

    const ts = Date.now()
    const updatedName = `E2E Teszt Felhasználó ${ts}`
    await nameInput.clear()
    await nameInput.fill(updatedName)

    await page.getByRole('button', { name: /változások mentése/i }).click()

    // ProfileForm calls updateProfile → toast.success("Profil sikeresen frissítve")
    await expect(
      page.getByText(/profil sikeresen frissítve/i)
    ).toBeVisible({ timeout: 12_000 })

    // Hard reload — verify Supabase persistence
    await page.goto('/account')
    await expect(page.getByLabel(/teljes név/i)).toHaveValue(updatedName, { timeout: 10_000 })
  })

  test('4.6.d — Profil mentés: szállítási cím mezők perzisztálnak az oldal újratöltése után', async ({ page }) => {
    requireCustomer()

    await loginAsCustomer(page)
    await page.goto('/account')

    await expect(page.getByLabel(/teljes név/i)).toBeVisible({ timeout: 10_000 })

    // ProfileForm shipping fields — label text matches FormLabel in ProfileForm.tsx:
    //   "Irányítószám", "Város", "Utca, házszám, emelet, ajtó"
    const zipInput     = page.getByLabel(/irányítószám/i)
    const cityInput    = page.getByLabel(/^város$/i)
    const addressInput = page.getByLabel(/utca.*házszám/i)

    await zipInput.clear()
    await zipInput.fill('1234')
    await cityInput.clear()
    await cityInput.fill('E2E Tesztváros')
    await addressInput.clear()
    await addressInput.fill('Teszt utca 42.')

    await page.getByRole('button', { name: /változások mentése/i }).click()
    await expect(page.getByText(/profil sikeresen frissítve/i)).toBeVisible({ timeout: 12_000 })

    // Reload and verify shipping address persistence
    await page.goto('/account')
    await expect(page.getByLabel(/irányítószám/i)).toHaveValue('1234', { timeout: 10_000 })
    await expect(page.getByLabel(/^város$/i)).toHaveValue('E2E Tesztváros')
    await expect(page.getByLabel(/utca.*házszám/i)).toHaveValue('Teszt utca 42.')
  })

  test('4.6.e — Profil form: 1 karakteres teljes név validációs hibát jelenít meg (Zod min: 2)', async ({ page }) => {
    requireCustomer()

    await loginAsCustomer(page)
    await page.goto('/account')

    const nameInput = page.getByLabel(/teljes név/i)
    await expect(nameInput).toBeVisible({ timeout: 10_000 })
    await nameInput.clear()
    await nameInput.fill('A')

    await page.getByRole('button', { name: /változások mentése/i }).click()

    // profileSchema: full_name z.string().min(2, "Teljes név megadása kötelező (min. 2 karakter)")
    await expect(
      page.getByText(/teljes név megadása kötelező/i)
    ).toBeVisible({ timeout: 5_000 })
  })

  test('4.6.f — Profil mentés gomb: betöltés közben disabled állapotban van', async ({ page }) => {
    requireCustomer()

    await loginAsCustomer(page)
    await page.goto('/account')

    await expect(page.getByLabel(/teljes név/i)).toBeVisible({ timeout: 10_000 })

    // Ensure the form is valid before submitting
    const nameInput = page.getByLabel(/teljes név/i)
    const currentName = await nameInput.inputValue()
    if (currentName.length < 2) {
      await nameInput.fill('Teszt Felhasználó')
    }

    const saveButton = page.getByRole('button', { name: /változások mentése/i })

    // Click and immediately check that the button becomes disabled (startTransition pending state)
    await saveButton.click()
    await expect(saveButton).toBeDisabled({ timeout: 3_000 })
  })

  test('4.6.g — Hitelesítés nélkül a /account oldal a /login-ra irányít', async ({ page }) => {
    // No login — navigate directly to the protected account page
    await page.goto('/account')

    // AccountPage: if (!user) redirect('/login')
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
  })
})

// ---------------------------------------------------------------------------
// Regressziós ellenőrzések — Iteráció 3 érintetlenségének megőrzése
// ---------------------------------------------------------------------------

test.describe('Regresszió — Iteráció 3 érintetlensége', () => {

  test('REG.1 — Termékek listázó oldal továbbra is betölt és mutatja a termékszámot', async ({ page }) => {
    await page.goto('/products')
    // ProductsPage renders "N termék található" on the listing page
    await expect(page.getByText(/termék található/i)).toBeVisible({ timeout: 10_000 })
  })

  test('REG.2 — Főoldal kiemelt termékek szekciója látható', async ({ page }) => {
    await page.goto('/')
    // HomePage renders FeaturedProducts section heading
    await expect(page.getByText(/kiemelt termékek/i)).toBeVisible({ timeout: 10_000 })
  })

  test('REG.3 — Admin termékek oldal admin felhasználóval betölt és mutat legalább egy terméket', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products')

    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })
    expect(await page.getByRole('row').count()).toBeGreaterThan(1)
  })

  test('REG.4 — ProductForm kategória dropdown: MOCK_CATEGORIES (cat-1..cat-6) ID-k NEM szerepelnek', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products/new')

    await page.getByRole('combobox').click()
    const listbox = page.locator('[role="listbox"]')
    await expect(listbox).toBeVisible({ timeout: 8_000 })

    const content = await listbox.innerHTML()
    expect(content).not.toMatch(/cat-[1-6]/)
  })

  test('REG.5 — /admin útvonal vásárló felhasználót visszairányít a főoldalra', async ({ page }) => {
    requireCustomer()

    await loginAsCustomer(page)
    await page.goto('/admin')

    // Middleware: customer → redirect('/')
    await expect(page).toHaveURL('/', { timeout: 8_000 })
  })

  test('REG.6 — /admin/products szerkesztés: valódi Supabase UUID-vel betölt (nem 404)', async ({ page }) => {
    requireAdmin()

    await loginAsAdmin(page)
    await page.goto('/admin/products')

    // Navigate to edit via the dropdown — this uses the real product UUID from the table
    await openRowMenu(page, 1)
    await page.getByRole('menuitem', { name: /szerkesztés/i }).click()

    // Must NOT land on 404 or not-found (EditProductPage now uses Supabase, not MOCK_PRODUCTS)
    await expect(page).not.toHaveURL(/not-found|404/, { timeout: 10_000 })
    await expect(
      page.getByRole('heading', { name: /termék szerkesztése/i })
    ).toBeVisible({ timeout: 10_000 })
  })
})
