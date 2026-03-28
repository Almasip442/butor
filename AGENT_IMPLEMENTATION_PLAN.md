# AGENT_IMPLEMENTATION_PLAN.md — FurnSpace Frontend Megvalósítási Terv

> **Projekt neve:** FurnSpace – Modern Bútor Webshop  
> **Technológiai stack:** Next.js 14 (App Router) · shadcn/ui · Tailwind CSS · Zustand  
> **Dokumentum verziója:** 2.0  
> **Kiindulási állapot:** A Next.js projekt létrehozva, hibamentesen buildel és fut.  
> **Jelenlegi mérföldkő:** Teljes frontend megvalósítása — backend és Supabase integráció **nélkül** (dummy adatok, mock state).

---

## Általános Agent Irányelvek

### Mockupok
A `design_choices/` mappában minden oldalhoz egy vagy több vizuális referencia-mappa található. Az agent **minden iteráció előtt olvassa be a vonatkozó mappa tartalmát**, és a stílust, elrendezést, tipográfiát és színhasználatot ahhoz igazítsa.

### Képgenerálás
Termék- és kategóriafotók generálásához az agent a **`nano-banana`** modellt használja. Minden generált képet a `public/images/products/` illetve `public/images/categories/` könyvtárba mentsen `webp` formátumban. A promptok legyenek tömörek, angol nyelvűek, product-photography stílusban (fehér/semleges háttér, természetes fény).

```
Példa prompt termékhez:
"Scandinavian oak dining table, minimalist design, white studio background, 
 soft natural light, product photography, 4:3 ratio"
```

### Dummy adatok
Minden adat a `lib/mock-data.ts` fájlból érkezik. Supabase-hívás sehol ne szerepeljen ebben a fázisban — azokat `// TODO: replace with Supabase query` kommenttel kell jelölni.

### Iteráció mérete
Egy iteráció = **maximum 3-4 fájl létrehozása/módosítása**. Ha egy feladat nagyobb, bontsd tovább.

### Komponens-típus jelölés (a COMPONENTS.md alapján)
- `🟩 Szerver` → adatot fogad prop-ként (dummy-ból), `async` ha szükséges
- `🟨 Kliens` → `'use client'` direktíva, interaktív state
- `🟦 Layout` → oldal/szekció keretkomponens

---

## 🏗️ Fázis 1: Design Foundation
**Cél:** Tokenek, tipográfia, globális stílusok, skip link, focus stílusok — minden más erre épül.

### Iteráció 1.1 — globals.css és tailwind.config.ts
**Fájlok:** `app/globals.css`, `tailwind.config.ts`

- `globals.css`-ben definiáld a SPECIFICATION.md 3.3 pontjában meghatározott **összes CSS custom property-t**:
  - Színtokenek: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--accent`, `--muted`, `--border`
  - Spacing tokenek: `--space-xs` (4px) → `--space-2xl` (48px)
  - Radius: `--radius: 0.5rem`
- Fluid tipográfia a hero és szekciócímekhez `clamp()` értékekkel (ld. SPECIFICATION.md 3.2)
- `:focus-visible` globális stílus: `outline: 2px solid hsl(var(--primary)); outline-offset: 2px;`
- `img` alapstílusok: `max-width: 100%; height: auto; object-fit: cover;`
- `.touch-target` utility: `min-width: 44px; min-height: 44px;`
- `tailwind.config.ts`-ben: colors, borderRadius, fontFamily (Inter, Playfair Display), breakpoints (sm/md/lg/xl)

### Iteráció 1.2 — Shadcn/ui komponensek telepítése
**Fájlok:** `components/ui/*` (shadcn CLI outputok)

Telepítendő shadcn komponensek (egyetlen CLI futtatással):
`button`, `card`, `input`, `textarea`, `label`, `select`, `checkbox`, `switch`, `slider`,
`form`, `navigation-menu`, `dropdown-menu`, `sheet`, `dialog`, `badge`, `avatar`,
`separator`, `skeleton`, `table`, `toast`, `alert`

### Iteráció 1.3 — Fontok betöltése
**Fájlok:** `app/layout.tsx` (csak font-konfiguráció)

- `next/font/google` segítségével: `Inter` (sans) és `Playfair_Display` (display)
- CSS változókba kötve: `--font-sans`, `--font-display`
- `<html>` tagen alkalmazva, `antialiased` osztállyal

---

## 📦 Fázis 2: Dummy Adatok és Képgenerálás
**Cél:** Egyetlen forrás minden oldalnak — ezt a fájlt kell majd lecserélni Supabase-hívásokra.

### Iteráció 2.1 — Mock adatstruktúra létrehozása
**Fájlok:** `lib/mock-data.ts`, `lib/types.ts`

`lib/types.ts` — TypeScript interfészek a DATAMODEL.md alapján:
```ts
export interface Category { id, name, slug, description, image_url, parent_id? }
export interface Product  { id, name, slug, description, price, stock_quantity,
                            images: string[], category_id, material?, color?,
                            is_featured, is_active }
export interface Order    { id, status, total_amount, created_at, items: OrderItem[] }
export interface OrderItem{ id, product_id, product_name, unit_price, quantity }
export interface User     { id, full_name, email, shipping_address?, role }
```

`lib/mock-data.ts` tartalma:
- **6 kategória:** Kanapék, Asztalok, Székek, Szekrények, Ágyak, Polcok — mindegyikhez slug, leírás, `image_url: '/images/categories/<slug>.webp'`
- **18 termék** (kategóriánként 3): névvel, leírással, árral (45 000–850 000 Ft), készlettel, 3 képpel, anyaggal — `is_featured: true` legyen 4-nél
- **3 rendelés** különböző státuszokkal (`pending`, `shipped`, `delivered`)
- **1 mock user** (`{ full_name: 'Kovács Anna', email: 'anna@example.com', role: 'customer' }`)

### Iteráció 2.2 — Képgenerálás (Nano Banana)
**Fájlok:** `public/images/products/*.webp`, `public/images/categories/*.webp`

Az agent a **nano-banana** modellel generálja az alábbi képeket:

**Kategória képek (6 db, 800×600):**
| Fájlnév | Prompt |
|---|---|
| `kanapek.webp` | "Modern fabric sofa, warm earth tones, Scandinavian living room, natural light" |
| `asztalok.webp` | "Minimalist oak dining table, white studio background, product photography" |
| `szekek.webp` | "Set of designer dining chairs, light wood, neutral upholstery" |
| `szekrenyok.webp` | "Tall wooden wardrobe, clean lines, matte finish, studio light" |
| `agyak.webp` | "Platform bed frame, linen headboard, Scandinavian bedroom interior" |
| `polcok.webp` | "Floating wall shelves, oak wood, minimal objects, white wall" |

**Termék képek (18 termék × 3 kép = 54 db, 800×800):**
Minden termékhez: `<slug>-1.webp`, `<slug>-2.webp`, `<slug>-3.webp`
Promptok legyenek termék-specifikusak (pl. kanapénál: front view, side view, detail/texture shot).

---

## 🧩 Fázis 3: Utility Komponensek és Zustand Store
**Cél:** Újrafelhasználható kis komponensek és a globális kosár-állapot.

### Iteráció 3.1 — Utility komponensek
**Fájlok:** `components/ui/LoadingSpinner.tsx`, `components/ui/EmptyState.tsx`, `components/ui/ErrorBoundary.tsx`
**Referencia mockup:** —

- `LoadingSpinner`: Shadcn `Skeleton` animációval, `size` prop (sm/md/lg)
- `EmptyState`: Ikon + szöveg + opcionális CTA gomb. Props: `title`, `description`, `action?`
- `ErrorBoundary`: React class component, `shadcn Alert` hibaüzenettel

### Iteráció 3.2 — Zustand kosár állapot
**Fájlok:** `lib/store/cart-store.ts`, `package.json` (zustand telepítése)

Store tartalma:
```ts
items: CartItem[]           // { product, quantity }
addItem(product, qty)
removeItem(productId)
updateQuantity(productId, qty)
clearCart()
// computed:
totalItems: number
totalPrice: number
```
- `persist` middleware `localStorage`-ba (`furnspace-cart` kulcson)
- Típusdefiníció: `CartItem` a `lib/types.ts`-be

### Iteráció 3.3 — QuantitySelector és AddToCartButton
**Fájlok:** `components/products/QuantitySelector.tsx`, `components/products/AddToCartButton.tsx`

- `QuantitySelector` 🟨: `−` / `+` gombok, `value`, `onChange`, `min=1`, `max` props. Min `44×44px` touch target.
- `AddToCartButton` 🟨: `useCartStore`-hoz csatlakozik, `shadcn Toast` visszajelzés sikeres kosárba helyezésnél. Props: `product`, `quantity`

---

## 🗂️ Fázis 4: Layout — Header, Footer, CartDrawer
**Cél:** A globális keretkomponensek, amik minden oldalon megjelennek.

### Iteráció 4.1 — RootLayout és Skip Link
**Fájlok:** `app/layout.tsx`
**Referencia mockup:** —

- Skip link implementálása (SPECIFICATION.md 3.4 kódpéldája alapján): `sr-only focus:not-sr-only` Tailwind megoldás
- `<html lang="hu">`, fontok alkalmazása
- `<Toaster />` (shadcn) globális mount
- `<main id="main-content">` wrapper

### Iteráció 4.2 — Header
**Fájlok:** `components/layout/Header.tsx`, `components/layout/SearchBar.tsx`, `components/layout/UserMenu.tsx`, `components/cart/CartIcon.tsx`
**Referencia mockup:** `furnspace_home_page/`, `furnspace_home_refined_hybrid/`

- `Header` 🟨: sticky, `backdrop-blur`, teljes szélesség
- Logo: "FurnSpace" szöveg Playfair Display betűtípussal, `/`-re linkelve
- `SearchBar` 🟨: shadcn `Input`, mobil nézetben ikon, tablet+ nézetben kinyíló mező
- `CartIcon` 🟨: `useCartStore` → `totalItems`, shadcn `Badge` mutatja a darabszámot. `44×44px` touch target.
- `UserMenu` 🟨: shadcn `DropdownMenu` + `Avatar`. Mock user adatokkal (nem auth ellenőrzés)
- Navigációs linkek: `usePathname()` alapján aktív kiemelés — `border-b-2 border-primary` + `aria-current="page"` (SPECIFICATION.md 3.5 kódpéldája)
- Responsive: hamburger menü mobilon (`Sheet`-tel), vízszintes nav tableten+

### Iteráció 4.3 — Footer
**Fájlok:** `components/layout/Footer.tsx`
**Referencia mockup:** `furnspace_home_page/`

- 3 oszlopos grid (mobilon 1, tableten 2, desktopon 3)
- Oszlopok: "FurnSpace" brand + leírás | Navigáció linkek | Kapcsolat/Social
- shadcn `Separator` felül
- Copyright sor alul

### Iteráció 4.4 — CartDrawer
**Fájlok:** `components/cart/CartDrawer.tsx`, `components/cart/CartItemRow.tsx`
**Referencia mockup:** `shopping_cart_drawer/`

- `CartDrawer` 🟨: shadcn `Sheet` (right oldal), `useCartStore` adataival
- `CartItemRow` 🟨: termék kép (Next.js `Image`), név, ár, `QuantitySelector`, törlés gomb
- `SheetFooter`: részösszeg, ÁFA (27%), végösszeg, "Pénztárhoz" gomb (`/checkout`-ra linkelve)
- Üres kosárnál: `EmptyState` komponens

---

## 🏠 Fázis 5: Főoldal
**Cél:** A landing page teljes felépítése.
**Referencia mockup:** `furnspace_home_page/`, `furnspace_home_refined_hybrid/`

### Iteráció 5.1 — HeroSection
**Fájlok:** `components/home/HeroSection.tsx`

- 🟩 Szerver komponens
- Full-width szekció, háttér: `--secondary` szín + opcionális háttérkép overlay
- Főcím Playfair Display-ben, fluid méret: `clamp(1.75rem, 4vw + 1rem, 3.5rem)`
- Alcím, 2 CTA gomb (shadcn `Button`): "Termékek böngészése" → `/products`, "Rólunk" → `#`
- `<h1>` elem (oldalankénti egyetlen h1)

### Iteráció 5.2 — CategoryGrid
**Fájlok:** `components/home/CategoryGrid.tsx`, `components/home/CategoryCard.tsx`

- `CategoryGrid` 🟩: mock kategóriák fogadása prop-ként, `app/page.tsx`-ben mock-adatból átadva
- Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`
- `CategoryCard`: Next.js `<Image>`, kategória neve, `/products?category=<slug>`-ra linkelve
- `<h2>` szekciócím: "Kategóriák"

### Iteráció 5.3 — FeaturedProducts
**Fájlok:** `components/home/FeaturedProducts.tsx`, `app/page.tsx`

- `FeaturedProducts` 🟩: `is_featured` termékek prop-ként
- `<h2>` szekciócím: "Kiemelt Termékek"
- `ProductCard` × 4 (ld. Fázis 6) — ez a komponens itt már kész kell legyen
- `app/page.tsx`: mock adatok beimportálása, `FeaturedProducts` és `CategoryGrid` összerakása

---

## 🛍️ Fázis 6: Terméklista Oldal
**Cél:** Szűrhető, rendezhető termékrács.
**Referencia mockup:** `furnspace_listing_classic_editorial/`, `product_listing_minimalist_grid/`

### Iteráció 6.1 — ProductCard
**Fájlok:** `components/products/ProductCard.tsx`

- 🟨 Kliens (kosárba helyezés miatt)
- shadcn `Card`, `CardContent`, `CardFooter`, `Badge`
- Next.js `<Image>` (first image from `images[]`)
- Props: `id`, `name`, `slug`, `price`, `images`, `category`, `isNew?`
- Ár: `Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' })`
- "Kosárba" gomb: `AddToCartButton`, hover state látható
- `/products/<slug>`-ra linkelve a kártyán kattintva

### Iteráció 6.2 — ProductGrid és SortSelector
**Fájlok:** `components/products/ProductGrid.tsx`, `components/products/SortSelector.tsx`

- `ProductGrid` 🟩: `Product[]` prop, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
- Üres listánál `EmptyState`
- `SortSelector` 🟨: shadcn `Select`, opciók: ár növekvő/csökkenő, újdonság, névbetűrend. URL `searchParams`-ba ír (`?sort=price_asc` stb.)

### Iteráció 6.3 — ProductFilters és az oldal összerakása
**Fájlok:** `components/products/ProductFilters.tsx`, `app/products/page.tsx`

- `ProductFilters` 🟨: shadcn `Select` (kategória), `Slider` (ár min–max), `Checkbox`-ok (anyag). URL `searchParams`-ba ír.
- Mobilon összecsukható (shadcn `Sheet` vagy `Collapsible`)
- `app/products/page.tsx`: `searchParams` alapján mock adatok kliens-oldali szűrése, `ProductFilters` + `SortSelector` + `ProductGrid` összerakása
- `<h1>`: "Termékeink"

---

## 🔍 Fázis 7: Termék Részletoldal
**Cél:** Egyedi termékoldal képgalériával, infopanellel, kapcsolódó termékekkel.
**Referencia mockup:** `furnspace_pdp_soft_minimalist/`, `product_detail_aurelius_b_rsony_fotel/`

### Iteráció 7.1 — ProductImageGallery
**Fájlok:** `components/products/ProductImageGallery.tsx`

- 🟨 Kliens (thumbnail kattintás)
- Főkép: nagy Next.js `<Image>`, `aspect-ratio: 1/1`, `object-fit: cover`
- Thumbnails: sor alul, kattintásra főkép csere
- Mobilon: swipe-szerű (egyszerűen prev/next gombokkal is megoldható)

### Iteráció 7.2 — ProductInfo és RelatedProducts
**Fájlok:** `components/products/ProductInfo.tsx`, `components/products/RelatedProducts.tsx`, `app/products/[slug]/page.tsx`

- `ProductInfo` 🟨:
  - `<h1>` terméknév
  - shadcn `Badge` kategória jelölőként
  - Ár nagy betűvel
  - Anyag, szín, méretek (ha van)
  - Készlet jelzés ("Raktáron" / "Elfogyott")
  - `QuantitySelector` + `AddToCartButton`
- `RelatedProducts` 🟩: azonos `category_id` termékek prop-ból, max 4, `ProductCard` × N, `<h2>`: "Hasonló termékek"
- `app/products/[slug]/page.tsx`: slug alapján mock adatból termék keresés, `notFound()` ha nincs találat

---

## 🛒 Fázis 8: Kosár Oldal
**Cél:** Teljes oldalas kosár nézet (a CartDrawer mellett).
**Referencia mockup:** `shopping_cart_page/`

### Iteráció 8.1 — CartItemList és OrderSummary
**Fájlok:** `components/cart/CartItemList.tsx`, `components/cart/OrderSummary.tsx`

- `CartItemList` 🟨: `useCartStore` alapján, `CartItemRow` × N listázás
- `OrderSummary` 🟩: props-ból fogadja az összeget
  - Részösszeg, ÁFA (27%), Szállítás ("Ingyenes" vagy fix összeg), Végösszeg
  - shadcn `Separator` elválasztókkal

### Iteráció 8.2 — CartPage összerakása
**Fájlok:** `app/cart/page.tsx`

- Kétoszlopos layout desktopon (`grid-cols-1 lg:grid-cols-3`): bal 2/3 lista, jobb 1/3 összesítő
- Üres kosárnál `EmptyState` CTA gombbal → `/products`
- "Tovább a pénztárhoz" gomb → `/checkout`
- `<h1>`: "Kosaram"

---

## 💳 Fázis 9: Pénztár és Rendelés Visszaigazolása
**Cél:** Checkout flow UI — dummy form submit, mock visszaigazolás.
**Referencia mockup:** `checkout_page_furnspace/`

### Iteráció 9.1 — ShippingForm és CheckoutSummary
**Fájlok:** `components/checkout/ShippingForm.tsx`, `components/checkout/CheckoutSummary.tsx`

- `ShippingForm` 🟨: `react-hook-form` + `zod`
  - Mezők: teljes név, e-mail, telefon, irányítószám, város, cím, ország (default: Magyarország), megjegyzés
  - Mock pre-fill: mock user `shipping_address` adataival
  - Submit: `clearCart()` → `router.push('/order-confirmation')`
  - `// TODO: replace with Supabase Server Action`
- `CheckoutSummary` 🟩: kosár tételek + összesítő (props-ból)

### Iteráció 9.2 — CheckoutPage és OrderConfirmation
**Fájlok:** `app/checkout/page.tsx`, `app/order-confirmation/page.tsx`

- `CheckoutPage`: `grid-cols-1 lg:grid-cols-2` — bal: ShippingForm, jobb: CheckoutSummary
- Middleware `// TODO` kommenttel jelölve (majd Supabase auth ellenőrzés lesz)
- `OrderConfirmationPage`: Sikeres rendelés visszaigazolás — ikon, rendelési szám (mock uuid), köszönőszöveg, "Főoldalra" gomb

---

## 🔐 Fázis 10: Autentikációs Oldalak
**Cél:** Login és regisztrációs oldalak UI-ja — valódi auth nélkül.
**Referencia mockup:** `login_page_furnspace/`, `register_page_furnspace/`

### Iteráció 10.1 — LoginForm és RegisterForm
**Fájlok:** `components/auth/LoginForm.tsx`, `components/auth/RegisterForm.tsx`, `app/login/page.tsx`, `app/register/page.tsx`

- `LoginForm` 🟨:
  - E-mail + jelszó mezők (`react-hook-form` + `zod`)
  - "Elfelejtett jelszó?" link
  - Google OAuth gomb (UI only, `// TODO`)
  - shadcn `Separator` "vagy" felirattal
  - Submit: `// TODO: Supabase signIn` komment, átirányít `/`-re
- `RegisterForm` 🟨:
  - Teljes név + e-mail + jelszó + jelszó megerősítés
  - Submit: `// TODO: Supabase signUp` komment
- Mindkét oldal: centrált kártya layout, `<h1>` fejléccel
- Kereszt-hivatkozások: "Még nincs fiókod? Regisztrálj" / "Már van fiókod? Lépj be"

---

## 👤 Fázis 11: Felhasználói Fiók
**Cél:** Profilkezelés és rendelési előzmények UI — mock adatokkal.
**Referencia mockup:** `user_account_profile/`, `order_history/`

### Iteráció 11.1 — AccountPage és ProfileForm
**Fájlok:** `components/account/ProfileForm.tsx`, `app/account/page.tsx`

- `ProfileForm` 🟨: teljes név, e-mail (readonly), telefon, szállítási cím mezők. Mock user adatokkal pre-fill. Submit: `console.log` + toast visszajelzés (`// TODO: Supabase update`)
- `app/account/page.tsx`: Tab-os layout (shadcn `Tabs`): "Profil" és "Rendeléseim" fülek
- `<h1>`: "Fiókom"

### Iteráció 11.2 — OrdersPage és OrderDetailPage
**Fájlok:** `components/account/OrderRow.tsx`, `app/account/orders/page.tsx`, `app/account/orders/[id]/page.tsx`

- `OrderRow` 🟩: rendelés azonosító, dátum, státusz (shadcn `Badge` különböző színekkel), összeg, "Részletek" link
- `app/account/orders/page.tsx`: mock rendelések táblázatos listája. `<h2>`: "Rendelési előzmények"
- `app/account/orders/[id]/page.tsx`: egyedi rendelés részletek — tételek listája, szállítási adatok, státusz timeline

---

## ⚙️ Fázis 12: Adminisztrációs Panel
**Cél:** Admin felület teljes UI-ja — mock adatokkal, valódi CRUD nélkül.
**Referencia mockup:** `admin_product_form_furnspace/`, `admin_term_kkezel_s_furnspace/`, `admin_rendel_sek_furnspace/`

### Iteráció 12.1 — AdminLayout és Dashboard
**Fájlok:** `app/admin/layout.tsx`, `components/admin/AdminSidebar.tsx`, `app/admin/page.tsx`

- `AdminSidebar` 🟨: shadcn `NavigationMenu`, aktív elem kiemelés `usePathname()`-mel
  - Menüpontok: Dashboard, Termékek, Rendelések, Kategóriák
  - Mobilon összecsukható
- `app/admin/layout.tsx`: oldalsáv + tartalom kétoszlopos grid
- `app/admin/page.tsx` — Dashboard:
  - Stat kártyák (shadcn `Card`): Összes termék (18), Aktív rendelések (3), Összes felhasználó (1), Bevétel (mock összeg)
  - `<h1>`: "Admin Dashboard"

### Iteráció 12.2 — Termékkezelés
**Fájlok:** `components/admin/ProductsDataTable.tsx`, `components/admin/ProductForm.tsx`, `components/admin/ImageUploader.tsx`, `app/admin/products/page.tsx`, `app/admin/products/new/page.tsx`, `app/admin/products/[id]/edit/page.tsx`

- `ProductsDataTable` 🟨: shadcn `Table`, soronként: kép (kis thumbnail), név, kategória, ár, készlet, aktív (`Switch`), szerkesztés/törlés (`DropdownMenu`)
- "Új termék" gomb → `/admin/products/new`
- `ProductForm` 🟨: `react-hook-form` + `zod` (a COMPONENTS.md 3.5 sémájával). Submit: mock console.log + visszairányítás
- `ImageUploader` 🟨: drag-and-drop zóna, fájl kiválasztás, preview megjelenítés (`URL.createObjectURL`). `// TODO: Supabase Storage upload`

### Iteráció 12.3 — Rendelés- és Kategóriakezelés
**Fájlok:** `components/admin/OrdersDataTable.tsx`, `app/admin/orders/page.tsx`, `app/admin/categories/page.tsx`

- `OrdersDataTable` 🟨: shadcn `Table` + státuszváltó `Select` soronként (mock state). Oszlopok: ID, vásárló, dátum, összeg, státusz, akciók
- `app/admin/categories/page.tsx`: kategóriák listája shadcn `Table`-ben, "Új kategória" gomb (inline form shadcn `Dialog`-ban)

---

## ♿ Fázis 13: Akadálymentesség és Hibaoldal
**Cél:** Accessibility végellenőrzés, 404 oldal, végső finomítások.

### Iteráció 13.1 — 404 oldal
**Fájlok:** `app/not-found.tsx`

- Egyedi 404 oldal: nagy "404" szám Playfair Display-ben, "Az oldal nem található" szöveg, "Vissza a főoldalra" gomb

### Iteráció 13.2 — Accessibility audit és javítások
**Ellenőrzőlista (fájlonként végigmenni):**

| Szempont | Elvárt megvalósítás |
|---|---|
| Skip link | `app/layout.tsx`-ben megvan, Tab-ra megjelenik |
| Heading hierarchia | Oldalanként 1× `<h1>`, szintköz nincs (h1→h2→h3) |
| `aria-current="page"` | `Header` nav linkeken `usePathname()`-mel |
| `aria-label` | `CartIcon`, `UserMenu`, ikon-only gombokra |
| `aria-live` | Kosárba helyezés toast értesítésnél |
| Focus visible | Minden interaktív elemen látható `:focus-visible` keret |
| Touch target | `min-h-[44px] min-w-[44px]` CartIcon, hamburger, +/− gombokra |
| Alt szövegek | Minden `<Image>`-en kitöltött, leíró `alt` prop |
| Kontraszt | `--primary` szín fehér szöveg felett ≥ 4.5:1 |
| Szemantikus HTML | `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>` elemek |

---

## 📊 Összesítő — Iterációk áttekintése

| Fázis | Iterációk | Fő outputok |
|---|---|---|
| 1. Design Foundation | 3 | `globals.css`, `tailwind.config.ts`, shadcn telepítés, fontok |
| 2. Dummy adatok + képek | 2 | `lib/mock-data.ts`, `lib/types.ts`, 60 generált kép |
| 3. Utility + Store | 3 | `LoadingSpinner`, `EmptyState`, `ErrorBoundary`, `cart-store.ts`, `QuantitySelector`, `AddToCartButton` |
| 4. Layout | 4 | `RootLayout`, `Header`, `Footer`, `CartDrawer` |
| 5. Főoldal | 3 | `HeroSection`, `CategoryGrid`, `FeaturedProducts`, `app/page.tsx` |
| 6. Terméklista | 3 | `ProductCard`, `ProductGrid`, `SortSelector`, `ProductFilters`, `app/products/page.tsx` |
| 7. Termékoldal | 2 | `ProductImageGallery`, `ProductInfo`, `RelatedProducts`, `app/products/[slug]/page.tsx` |
| 8. Kosár oldal | 2 | `CartItemList`, `OrderSummary`, `app/cart/page.tsx` |
| 9. Checkout | 2 | `ShippingForm`, `CheckoutSummary`, `app/checkout/page.tsx`, `app/order-confirmation/page.tsx` |
| 10. Auth oldalak | 1 | `LoginForm`, `RegisterForm`, `app/login`, `app/register` |
| 11. Felhasználói fiók | 2 | `ProfileForm`, `OrderRow`, `app/account/*` |
| 12. Admin panel | 3 | `AdminSidebar`, Dashboard, `ProductForm`, `ImageUploader`, `OrdersDataTable` |
| 13. A11y + 404 | 2 | `app/not-found.tsx`, accessibility javítások |
| **Összesen** | **32** | **Teljes frontend, backend nélkül** |
