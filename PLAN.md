# PLAN.md — Iteráció 4: Admin CRUD és Supabase Storage képfeltöltés

## Összefoglalás

**Cél:** Az admin felület valódi adatbázis-műveleteket hajtson végre termékek, kategóriák és rendelések kezelésére. A `ProductForm` képfeltöltési funkciója a Supabase Storage-ot használja. A profil szerkesztés is valódi Supabase UPDATE-et hajtson végre.

**Státusz:** TODO  
**Függőség:** Iteráció 3 (DONE)  
**UI szükséges:** Részben — meglévő komponensek bekötése, néhány hiányzó UI elem pótlása (AlertDialog törléshez, Select státuszváltóhoz, Szerkesztés Dialog kategóriákhoz)

---

## Feladatok áttekintése

| # | Feladat | Fájlok | Típus |
|---|---------|--------|-------|
| 4.1 | `upsertProduct` Server Action | `app/admin/products/actions.ts` | Létrehozás |
| 4.2 | `deleteProduct` Server Action | `app/admin/products/actions.ts` | Módosítás |
| 4.3 | ImageUploader → Supabase Storage | `app/admin/products/actions.ts`, `components/admin/ImageUploader.tsx` | Módosítás |
| 4.4 | Kategóriák CRUD | `app/admin/categories/actions.ts`, `app/admin/categories/page.tsx`, `components/admin/CategoriesClient.tsx` | Létrehozás + Módosítás |
| 4.5 | Rendelés státusz frissítése | `app/admin/orders/actions.ts`, `app/admin/orders/[id]/page.tsx`, `app/admin/orders/page.tsx` | Létrehozás + Módosítás |
| 4.6 | Profil szerkesztés Server Action | `app/account/actions.ts`, `components/account/ProfileForm.tsx` | Létrehozás + Módosítás |

---

## Admin jogosultság ellenőrzés (egységes minta)

Minden admin Server Action elején ugyanez a helper fut, lokálisan definiálva az adott actions fájlban:

```typescript
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')
}
```

> A middleware védi az `/admin` útvonalakat, de a Server Action-ökben a dupla ellenőrzés defense-in-depth — kötelező, mert a Server Action-ök direkten is meghívhatók.

---

## 4.1 — `upsertProduct` Server Action

**Fájl:** `app/admin/products/actions.ts` (új fájl)

**Logika:**
- Admin jogosultság ellenőrzés (`requireAdmin()`)
- `FormData` fogadása: `id` (null = create), `name`, `slug`, `description`, `price`, `stock_quantity`, `category_id`, `is_active`, `is_featured`, `images` (JSON string)
- Ha `id` van: `adminClient.from('products').update(payload).eq('id', id)`
- Ha nincs `id`: `adminClient.from('products').insert(payload)`
- `revalidatePath('/admin/products')`, `revalidatePath('/products')`, `revalidatePath('/')`
- `redirect('/admin/products')`

**`ProductForm` módosítása** (`components/admin/ProductForm.tsx`):
- `MOCK_CATEGORIES` import eltávolítása → `categories: Category[]` prop fogadása
- `action` prop hozzáadása (`upsertProduct`)
- `useActionState` hook a szerver oldali hibakezeléshez
- Hidden `<input name="id">` az edit esetén
- `images` értéke `JSON.stringify(field.value)` hidden inputként

**`EditProductPage`** (`app/admin/products/[id]/edit/page.tsx`):
- MOCK import eltávolítása → `adminClient.from('products').select('*, categories(*)').eq('id', id).single()`
- `notFound()` ha nincs találat

**Kockázat:** Slug uniqueness conflict → `upsertProduct` `{ error }` értéket ad vissza, `ProductForm` `useActionState`-tel megjeleníti.

---

## 4.2 — `deleteProduct` Server Action

**Fájl:** `app/admin/products/actions.ts` (4.1-gyel együtt)

```typescript
export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  const adminClient = createAdminClient()

  const { error } = await adminClient.from('products').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/')
  return { success: true }
}
```

**`ProductsDataTable` módosítása** (`components/admin/ProductsDataTable.tsx`):
- Törlés `DropdownMenuItem` → `AlertDialog` megerősítő dialog (kötelező romboló műveletnél)
- `deletingProductId: string | null` state bevezetése
- AlertDialog szöveg: *"Biztosan törli a(z) [terméknév] terméket? Ez a művelet nem vonható vissza."*
- Két gomb: "Mégse" (outline) és "Törlés" (destructive)
- `deleteProduct(id)` hívás `startTransition`-ben, hiba esetén `toast.error`

**Kockázat:** Ha a termékhez `order_items` létezik, FK constraint megakadályozza a törlést → user-friendly hibaüzenet toast-ban.

---

## 4.3 — ImageUploader bekötése Supabase Storage-ra

**Fájl:** `app/admin/products/actions.ts` (4.1/4.2-vel együtt)

```typescript
export async function uploadProductImage(formData: FormData): Promise<{ url: string }> {
  await requireAdmin()

  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('Nincs fájl')
  if (file.size > 5 * 1024 * 1024) throw new Error('Max 5 MB')

  const ext      = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer   = Buffer.from(await file.arrayBuffer())

  const adminClient = createAdminClient()
  const { error } = await adminClient.storage
    .from('product-images')
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (error) throw new Error(error.message)

  const { data } = adminClient.storage.from('product-images').getPublicUrl(fileName)
  return { url: data.publicUrl }
}
```

**`ImageUploader` módosítása** (`components/admin/ImageUploader.tsx`):
- `URL.createObjectURL(file)` helyett: skeleton/loader placeholder → `uploadProductImage(fd)` Server Action hívás → sikeres feltöltés után Supabase public URL
- `isUploading` state: amíg feltöltés folyamatban, a form submit gomb disabled
- 5MB feletti fájl: inline hibaüzenet az ImageUploader alatt (nem toast)
- Hiba esetén: `toast.error('Képfeltöltés sikertelen')`, placeholder eltávolítása

**Kockázat:** Feltöltés közben form elküldés → megoldás: `isUploading` callback prop a szülő form felé, submit gomb disabled állapot.

---

## 4.4 — Kategóriák CRUD

**Jelenlegi állapot:** `app/admin/categories/page.tsx` — Client Component, `useState(MOCK_CATEGORIES)`, nincs Supabase perzisztencia.

### Új fájl: `app/admin/categories/actions.ts`

```typescript
'use server'

export async function createCategory(formData: FormData) { ... }
export async function updateCategory(id: string, formData: FormData) { ... }
export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()
  // Check: van-e hozzárendelt termék?
  const { count } = await adminClient.from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if ((count ?? 0) > 0)
    return { error: 'Nem törölhető: vannak termékek ebben a kategóriában' }

  const { error } = await adminClient.from('categories').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/categories')
  return { success: true }
}
```

### `app/admin/categories/page.tsx` — Server Component-ré alakítás

```typescript
export default async function AdminCategoriesPage() {
  // inline admin auth guard
  const { data: categories } = await adminClient.from('categories').select('*').order('name')
  return <CategoriesClient initialCategories={categories ?? []} />
}
```

### Új fájl: `components/admin/CategoriesClient.tsx`

- Client Component, a teljes dialóg logikával
- `editingCategory` state a szerkesztés dialóghoz (meglévő dialóg kód másolásával, előtöltött értékekkel)
- Törlés: AlertDialog megerősítés + termékes kategóriánál disabled MenuItem + tooltip
- Action hívás után `router.refresh()` (vagy optimistic update)

**UI elemek pótlása:**
- Szerkesztés Dialog: `editingCategory` state + előtöltött form
- Törlés AlertDialog: ugyanolyan minta mint 4.2-nél
- Termékes kategória: disabled Törlés MenuItem + "X termék tartozik hozzá" tooltip

---

## 4.5 — Rendelés státusz frissítése

### Új fájl: `app/admin/orders/actions.ts`

```typescript
'use server'

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()

  const { error } = await adminClient
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}
```

### `app/admin/orders/page.tsx` módosítása

- MOCK import eltávolítása → `adminClient.from('orders').select('*, users(full_name)').order('created_at', { ascending: false })`

### `app/admin/orders/[id]/page.tsx` teljes átírása

- MOCK import eltávolítása
- `adminClient.from('orders').select('*, order_items(*, products(*))').eq('id', id).single()`
- `notFound()` ha nem található
- Státusz szekció: shadcn/ui `Select` komponens a jelenlegi inaktív "Státusz módosítása" Button helyett
  - Select értéke: aktuális státusz
  - `onValueChange`: `updateOrderStatus` action hívása `startTransition`-ben
  - Státuszváltás közben Select disabled (pending transition)
  - Sikeres mentés: `toast.success('Státusz frissítve: [státusz]')`

### `components/admin/OrdersDataTable.tsx` módosítása

- `onStatusChange: (orderId: string, status: string) => void` prop hozzáadása
- Select `onValueChange` → `startTransition` → `onStatusChange` hívás
- Hiba esetén Select értékének visszaállítása + `toast.error`

---

## 4.6 — Profil szerkesztés Server Action

### Új fájl: `app/account/actions.ts`

```typescript
'use server'

export async function updateProfile(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nem bejelentkezett' }

  const full_name = formData.get('full_name') as string
  const phone     = formData.get('phone') as string | null

  const shipping_address = JSON.stringify({
    zip_code: formData.get('zip_code'),
    city:     formData.get('city'),
    address:  formData.get('address'),
    country:  formData.get('country'),
  })

  const { error } = await supabase
    .from('users')
    .update({ full_name, phone: phone || null, shipping_address, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/account')
  return { success: true }
}
```

### `ProfileForm` módosítása (`components/account/ProfileForm.tsx`)

- `onSubmit` `setTimeout` mock eltávolítása → `FormData` felépítése → `updateProfile` Server Action hívás `startTransition`-ben
- `defaultValues` inicializálása: `initialProfile?.shipping_address` → `JSON.parse()` → `{ zip_code, city, address, country }` (try/catch, fallback üres objektumra)
- Email mező: kivétel a Zod schemából (disabled + readOnly, nem kerül a payload-ba)
- Sikeres mentés: `toast.success`
- Hiba: `toast.error(result.error)`

---

## Módosítandó / létrehozandó fájlok

| Fájl | Művelet | Feladat |
|------|---------|---------|
| `app/admin/products/actions.ts` | **Létrehozás** | `upsertProduct`, `deleteProduct`, `uploadProductImage` |
| `app/admin/orders/actions.ts` | **Létrehozás** | `updateOrderStatus` |
| `app/admin/categories/actions.ts` | **Létrehozás** | `createCategory`, `updateCategory`, `deleteCategory` |
| `app/account/actions.ts` | **Létrehozás** | `updateProfile` |
| `components/admin/CategoriesClient.tsx` | **Létrehozás** | Client Component dialóg logikával |
| `app/admin/products/[id]/edit/page.tsx` | **Módosítás** | MOCK → Supabase, Server Component-ré |
| `app/admin/orders/[id]/page.tsx` | **Módosítás** | MOCK → Supabase, StatusDropdown, Select UI |
| `app/admin/orders/page.tsx` | **Módosítás** | MOCK → Supabase |
| `app/admin/categories/page.tsx` | **Módosítás** | Client → Server Component héj |
| `app/admin/products/new/page.tsx` | **Módosítás** | categories prop átadása |
| `components/admin/ProductForm.tsx` | **Módosítás** | MOCK eltávolítás, action prop, useActionState |
| `components/admin/ImageUploader.tsx` | **Módosítás** | Valódi Storage upload, loader state |
| `components/admin/ProductsDataTable.tsx` | **Módosítás** | `deleteProduct` action + AlertDialog |
| `components/admin/OrdersDataTable.tsx` | **Módosítás** | `onStatusChange` prop, Server Action hívás |
| `components/account/ProfileForm.tsx` | **Módosítás** | `updateProfile` action, JSON parse init |

---

## Technikai kockázatok

| # | Kockázat | Megoldás |
|---|----------|----------|
| R1 | Slug uniqueness conflict upsert esetén | `upsertProduct` visszatér `{ error }`, `useActionState` megjeleníti |
| R2 | FK constraint termék törlésekor (order_items) | Explicit hibaüzenet, nem crash |
| R3 | FK constraint kategória törlésekor (products) | Count check a törlés előtt, disabled MenuItem |
| R4 | Storage upload szerver oldalon — Buffer | Next.js default Node.js runtime, nem Edge → nincs probléma |
| R5 | `shipping_address` JSON parse hiba legacy adatból | try/catch, fallback üres objektumra |
| R6 | ProductForm email Zod validáció OAuth usernél | Email mező kivétele a Zod schemából |
| R7 | Optimistic update konzisztencia OrdersDataTable-ben | Async handler, hiba esetén Select visszaállítás + toast.error |
| R8 | `product-images` bucket publikus hozzáférés | Supabase dashboardon publikus bucket policy beállítása szükséges |

---

## E2E Tesztek

**Fájl:** `tests/iteration-4/admin-crud.e2e.ts`

### Tesztelési struktúra

```
tests/iteration-4/admin-crud.e2e.ts
├── 4.1 Termék létrehozás
│   ├── 4.1.a — Új termék oldal betöltése admin felhasználóval
│   ├── 4.1.b — Form validáció: kötelező mezők üres beküldéskor
│   ├── 4.1.c — Kategória dropdown valódi Supabase adatokat listáz (nem mock cat-1..cat-6)
│   └── 4.1.d — Létrehozás: persist + redirect + táblában látható (reload után)
├── 4.1 Termék szerkesztés
│   ├── 4.1.e — Edit oldal betöltése valódi UUID-vel (nem 404)
│   ├── 4.1.f — Form előtöltve a meglévő adatokkal
│   └── 4.1.g — Módosított ár persist (reload után látható)
├── 4.2 Termék törlés
│   ├── 4.2.a — Megerősítő AlertDialog megjelenik
│   ├── 4.2.b — Törlés megerősítve: termék eltűnik (persist)
│   └── 4.2.c — Törlés mégse: termék megmarad
├── 4.3 Képfeltöltés Supabase Storage-ra
│   ├── 4.3.a — Kép kiválasztás után előnézet megjelenik
│   ├── 4.3.b — Feltöltött kép src Supabase public URL (nem blob:)
│   ├── 4.3.c — Kép törlése előnézetből működik
│   ├── 4.3.d — 5MB feletti fájl elutasítva hibaüzenettel
│   └── 4.3.e — File input accept="image/*" megvan
├── 4.4 Kategóriák CRUD
│   ├── 4.4.a — Tábla betölt legalább 1 sorral
│   ├── 4.4.b — Nincs mock cat-1..cat-6 ID az HTML-ben
│   ├── 4.4.c — Új kategória: persist (reload után látható)
│   ├── 4.4.d — Kötelező mezők validáció (Mentés disabled)
│   ├── 4.4.e — Törlés: persist (reload után eltűnik)
│   └── 4.4.f — Szerkesztés: persist (reload után új név látható)
├── 4.5 Rendelés státusz frissítés
│   ├── 4.5.a — Admin rendelések lista betölt (nem mock)
│   ├── 4.5.b — "Kovács Anna" hardcoded mock NEM jelenik meg
│   ├── 4.5.c — Státusz változtatás: persist (reload után megmarad)
│   ├── 4.5.d — Rendelés detail: státusz módosítás vezérlő látható
│   ├── 4.5.e — Rendelés detail: státusz módosítás persist (reload után)
│   └── 4.5.f — Érvénytelen UUID a detail URL-ben: 404
├── 4.6 Profil szerkesztés
│   ├── 4.6.a — Profil oldal: név és e-mail előtöltve Supabase-ből
│   ├── 4.6.b — Teljes név módosítása persist (reload után látható)
│   ├── 4.6.c — Szállítási cím mezők persist (reload után)
│   ├── 4.6.d — E-mail mező disabled
│   ├── 4.6.e — 1 karakteres teljes név: validációs hiba
│   ├── 4.6.f — Mentés gomb loading közben disabled
│   └── 4.6.g — Bejelentkezés nélküli hozzáférés: redirect /login
└── Regresszió — Iteráció 3 érintetlensége
    ├── REG.1 — Termékek listázó oldal betölt
    ├── REG.2 — Főoldal kiemelt termékek szekciója látható
    ├── REG.3 — Admin termékek oldal betölt
    ├── REG.4 — ProductForm kategória dropdown: nincs cat-1..cat-6
    ├── REG.5 — Vásárló nem fér hozzá /admin-hoz
    └── REG.6 — Edit oldal valódi UUID-vel betölt (nem 404)
```

**Futtatás:**
```bash
npx playwright test tests/iteration-4/admin-crud.e2e.ts
```

**Szükséges env változók:**
```
E2E_ADMIN_EMAIL=...
E2E_ADMIN_PASSWORD=...
E2E_CUSTOMER_EMAIL=...
E2E_CUSTOMER_PASSWORD=...
```

### Edge Case-ek

| ID | Terület | Edge Case | Elvárt viselkedés |
|----|---------|-----------|-------------------|
| EC-4.1.1 | Termék form | Üres form beküldése | Zod validációs hibák |
| EC-4.1.2 | Termék form | Slug ütközés | Supabase error, form hibaüzenet |
| EC-4.1.3 | Termék form | Negatív ár | Zod error |
| EC-4.2.1 | Törlés | Mégse | Termék megmarad |
| EC-4.2.2 | Törlés | order_items létezik | FK constraint hibaüzenet |
| EC-4.3.1 | Storage | 5MB feletti fájl | Elutasítva, hibaüzenet |
| EC-4.3.2 | Storage | Nem képfájl (.pdf) | File input accept szűri |
| EC-4.4.1 | Kategória | Üres név/slug | Mentés gomb disabled |
| EC-4.4.2 | Kategória | Slug ütközés | Supabase unique constraint error |
| EC-4.4.3 | Kategória | Termékes kategória törlése | FK hibaüzenet |
| EC-4.5.1 | Rendelés | Érvénytelen UUID | 404 oldal |
| EC-4.5.2 | Rendelés | Ugyanaz a státusz | Idempotens, nincs hiba |
| EC-4.6.1 | Profil | 1 karakteres név | Zod validációs hiba |
| EC-4.6.2 | Profil | Email módosítás kísérlete | Disabled input, nem módosítható |
| EC-4.6.3 | Profil | Nem bejelentkezett | Redirect /login-ra |

### Regressziós kockázatok

| # | Kockázat | Érintett teszt |
|---|----------|----------------|
| R1 | ProductForm kategória előtöltése elvész szerkesztésnél | 4.1.f |
| R2 | EditProductPage MOCK_PRODUCTS.find() → UUID-vel 404 | REG.6, 4.1.e |
| R3 | blob: URL kerül a mentett termékbe (Storage upload race) | 4.3.b |
| R4 | Race condition: dialóg bezárul szerver válasz előtt | 4.4.c, 4.4.e, 4.4.f |
| R5 | Felhasználónév join hiánya → üres oszlop rendelések listában | 4.5.b |
| R6 | shipping_address JSON szétbontás hiánya → üres form mezők | 4.6.c |

---

## Elfogadási kritériumok

- [ ] Admin termék CRUD funkcionál (create, read, update, delete)
- [ ] Képfeltöltés Supabase Storage-ba működik, a kép publikus URL megjelenik a termék `images` tömbjében
- [ ] Kategóriák kezelhetők (hozzáadás, szerkesztés, törlés — termékes kategória nem törölhető)
- [ ] Rendelés státusz módosítható az admin oldalon, az érték perzisztál
- [ ] Profil szerkesztés perzisztál — oldal újratöltés után is megmaradnak az adatok
- [ ] Törlés előtt minden esetben megerősítő AlertDialog jelenik meg
- [ ] Nincs `MOCK_*` import az érintett oldalakon
- [ ] TypeScript build hibák nincsenek (`npm run build` átmegy)
