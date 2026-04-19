import { test, expect } from '@playwright/test'

const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL!
const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD!
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL!
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD!

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loginAs(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel(/e-mail/i).fill(email)
  await page.getByLabel(/jelszó/i).first().fill(password)
  await page.getByRole('button', { name: /bejelentkezés/i }).click()
}

async function signOut(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /felhasználói menü/i }).click()
  await page.getByRole('menuitem', { name: /kijelentkezés/i }).click()
}

// ---------------------------------------------------------------------------
// 1. Login form — empty fields
// ---------------------------------------------------------------------------
test('1. Login: empty submission shows validation errors', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /bejelentkezés/i }).click()

  await expect(page.getByText(/érvénytelen e-mail/i)).toBeVisible()
  await expect(page.getByText(/legalább 6 karakter/i)).toBeVisible()
})

// ---------------------------------------------------------------------------
// 2. Login form — short password
// ---------------------------------------------------------------------------
test('2. Login: short password shows validation error', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/e-mail/i).fill('test@example.com')
  await page.getByLabel(/jelszó/i).first().fill('abc')
  await page.getByRole('button', { name: /bejelentkezés/i }).click()

  await expect(page.getByText(/legalább 6 karakter/i)).toBeVisible()
})

// ---------------------------------------------------------------------------
// 3. Login form — wrong credentials
// ---------------------------------------------------------------------------
test('3. Login: wrong credentials shows error alert', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/e-mail/i).fill('wrong@example.com')
  await page.getByLabel(/jelszó/i).first().fill('wrongpassword')
  await page.getByRole('button', { name: /bejelentkezés/i }).click()

  await expect(page.getByRole('alert')).toBeVisible()
})

// ---------------------------------------------------------------------------
// 4. Login form — error clears on new submission
// ---------------------------------------------------------------------------
test('4. Login: error clears on new submission attempt', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/e-mail/i).fill('wrong@example.com')
  await page.getByLabel(/jelszó/i).first().fill('wrongpassword')
  await page.getByRole('button', { name: /bejelentkezés/i }).click()
  await expect(page.getByRole('alert')).toBeVisible()

  // Start another submission — error should clear while loading
  await page.getByLabel(/e-mail/i).fill('other@example.com')
  await page.getByRole('button', { name: /bejelentkezés/i }).click()
  // Alert should disappear immediately on new attempt
  await expect(page.getByRole('alert')).not.toBeVisible({ timeout: 500 })
})

// ---------------------------------------------------------------------------
// 5. Successful login + session persistence
// ---------------------------------------------------------------------------
test('5. Login: successful login redirects to home and shows user menu', async ({ page }) => {
  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)

  await expect(page).toHaveURL('/', { timeout: 10_000 })
  await expect(page.getByRole('button', { name: /felhasználói menü/i })).toBeVisible()
})

// ---------------------------------------------------------------------------
// 6. Double-submit prevention (button disabled while loading)
// ---------------------------------------------------------------------------
test('6. Login: submit button is disabled while loading', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/e-mail/i).fill(CUSTOMER_EMAIL)
  await page.getByLabel(/jelszó/i).first().fill(CUSTOMER_PASSWORD)

  const submitButton = page.getByRole('button', { name: /bejelentkezés|belépés/i })
  await submitButton.click()

  // Immediately after click the button should be disabled
  await expect(submitButton).toBeDisabled()
})

// ---------------------------------------------------------------------------
// 7. Registration — mismatched passwords
// ---------------------------------------------------------------------------
test('7. Register: mismatched passwords shows validation error', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel(/teljes név/i).fill('Teszt Felhasználó')
  await page.getByLabel(/e-mail/i).fill('new@example.com')
  await page.getByLabel(/^jelszó$/i).fill('password123')
  await page.getByLabel(/megerősítése/i).fill('differentpassword')
  await page.getByRole('button', { name: /fiók létrehozása/i }).click()

  await expect(page.getByText(/jelszavak nem egyeznek/i)).toBeVisible()
})

// ---------------------------------------------------------------------------
// 8. Registration — short name
// ---------------------------------------------------------------------------
test('8. Register: name too short shows validation error', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel(/teljes név/i).fill('A')
  await page.getByRole('button', { name: /fiók létrehozása/i }).click()

  await expect(page.getByText(/név megadása kötelező/i)).toBeVisible()
})

// ---------------------------------------------------------------------------
// 9. Registration — duplicate email
// ---------------------------------------------------------------------------
test('9. Register: duplicate email shows error alert', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel(/teljes név/i).fill('Teszt Felhasználó')
  await page.getByLabel(/e-mail/i).fill(CUSTOMER_EMAIL)
  await page.getByLabel(/^jelszó$/i).fill('password123')
  await page.getByLabel(/megerősítése/i).fill('password123')
  await page.getByRole('button', { name: /fiók létrehozása/i }).click()

  await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 })
})

// ---------------------------------------------------------------------------
// 10. Successful registration flow
// ---------------------------------------------------------------------------
test('10. Register: successful registration shows toast and redirects to login', async ({ page }) => {
  const uniqueEmail = `test+${Date.now()}@example.com`

  await page.goto('/register')
  await page.getByLabel(/teljes név/i).fill('Új Felhasználó')
  await page.getByLabel(/e-mail/i).fill(uniqueEmail)
  await page.getByLabel(/^jelszó$/i).fill('password123')
  await page.getByLabel(/megerősítése/i).fill('password123')
  await page.getByRole('button', { name: /fiók létrehozása/i }).click()

  await expect(page).toHaveURL('/login', { timeout: 10_000 })
  await expect(page.getByText(/sikeres regisztráció/i)).toBeVisible()
})

// ---------------------------------------------------------------------------
// 11. Sign-out
// ---------------------------------------------------------------------------
test('11. Sign-out: user is signed out and login link appears', async ({ page }) => {
  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
  await expect(page).toHaveURL('/', { timeout: 10_000 })

  await signOut(page)

  await expect(page.getByRole('link', { name: /bejelentkezés/i })).toBeVisible({ timeout: 5_000 })
})

// ---------------------------------------------------------------------------
// 12. Unauthenticated access to protected routes
// ---------------------------------------------------------------------------
test('12. Protected routes: /account redirects unauthenticated user to /login', async ({ page }) => {
  await page.goto('/account')
  await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })
  await expect(page.url()).toContain('redirect=%2Faccount')
})

test('12b. Protected routes: /checkout redirects unauthenticated user to /login', async ({ page }) => {
  await page.goto('/checkout')
  await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })
  await expect(page.url()).toContain('redirect=%2Fcheckout')
})

test('12c. Protected routes: /admin redirects unauthenticated user to /login', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })
  await expect(page.url()).toContain('redirect=%2Fadmin')
})

// ---------------------------------------------------------------------------
// 13. Customer cannot access /admin
// ---------------------------------------------------------------------------
test('13. Admin protection: customer is redirected from /admin to home', async ({ page }) => {
  await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
  await expect(page).toHaveURL('/', { timeout: 10_000 })

  await page.goto('/admin')
  await expect(page).toHaveURL('/', { timeout: 5_000 })
})

// ---------------------------------------------------------------------------
// 14. Admin can access /admin
// ---------------------------------------------------------------------------
test('14. Admin access: admin user can visit /admin', async ({ page }) => {
  await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD)
  await expect(page).toHaveURL('/', { timeout: 10_000 })

  await page.goto('/admin')
  await expect(page).not.toHaveURL('/login', { timeout: 5_000 })
  await expect(page).not.toHaveURL('/', { timeout: 5_000 })
})

// ---------------------------------------------------------------------------
// 15. Redirect parameter preserved after login
// ---------------------------------------------------------------------------
test('15. Redirect: after login the user is sent to the originally requested page', async ({ page }) => {
  await page.goto('/account')
  await expect(page).toHaveURL(/\/login\?redirect=%2Faccount/, { timeout: 5_000 })

  await page.getByLabel(/e-mail/i).fill(CUSTOMER_EMAIL)
  await page.getByLabel(/jelszó/i).first().fill(CUSTOMER_PASSWORD)
  await page.getByRole('button', { name: /bejelentkezés/i }).click()

  await expect(page).toHaveURL('/account', { timeout: 10_000 })
})
