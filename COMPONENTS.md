# COMPONENTS.md — Komponens Architektúra Dokumentáció

> **Projekt neve:** FurnSpace – Modern Bútor Webshop  
> **Technológia:** Next.js 14 (App Router) · shadcn/ui · Tailwind CSS  
> **Dokumentum verziója:** 1.0  

---

## 1. Jelölésrendszer

Az alábbi dokumentumban az összetett komponensek típusát a következő jelölésekkel különítjük el:

| Jelölés | Típus | Leírás |
|---|---|---|
| 🔷 | **shadcn/ui alap** | Radix UI primitívekre épülő, könyvtárból importált komponens |
| 🟩 | **Saját szerver** | Next.js Server Component (`async` adatlekéréssel) |
| 🟨 | **Saját kliens** | `'use client'` direktívás React komponens (interaktív) |
| 🟦 | **Saját layout** | Oldal- vagy szekció-szintű elrendezés-komponens |

---

## 2. Komponensfa – Teljes Hierarchia

```
App (Next.js Root Layout)
├── 🟦 RootLayout              [app/layout.tsx]
│   ├── 🟨 Header
│   │   ├── 🔷 NavigationMenu       (shadcn/ui)
│   │   ├── 🟩 CategoryNavLinks     (szerver – kategóriák lekérése)
│   │   ├── 🟨 SearchBar
│   │   │   └── 🔷 Input            (shadcn/ui)
│   │   ├── 🟨 CartIcon
│   │   │   └── 🔷 Badge            (shadcn/ui – tételszám jelzőként)
│   │   └── 🟨 UserMenu
│   │       ├── 🔷 DropdownMenu     (shadcn/ui)
│   │       └── 🔷 Avatar           (shadcn/ui)
│   ├── 🟦 Footer
│   │   └── 🔷 Separator           (shadcn/ui)
│   └── 🟨 CartDrawer              (globális oldalsó panel)
│       ├── 🔷 Sheet               (shadcn/ui – oldalsó drawer)
│       ├── CartItemRow (×N)
│       │   ├── 🔷 Button           (shadcn/ui)
│       │   └── 🟨 QuantitySelector
│       └── 🔷 Button              (shadcn/ui – pénztár gomb)
│
├── 🟦 HomePage                [app/page.tsx]
│   ├── 🟩 HeroSection             (szerver – statikus tartalom)
│   │   └── 🔷 Button              (shadcn/ui – CTA gomb)
│   ├── 🟩 FeaturedProducts        (szerver – `is_featured` termékek)
│   │   └── ProductCard (×N)
│   │       ├── 🔷 Card            (shadcn/ui)
│   │       ├── 🔷 CardContent     (shadcn/ui)
│   │       ├── 🔷 Badge           (shadcn/ui – "Új" / "Akciós")
│   │       └── 🟨 AddToCartButton
│   │           └── 🔷 Button      (shadcn/ui)
│   └── 🟩 CategoryGrid            (szerver – kategóriák listázása)
│       └── CategoryCard (×N)
│           └── 🔷 Card            (shadcn/ui)
│
├── 🟦 ProductsPage            [app/products/page.tsx]
│   ├── 🟨 ProductFilters          (kliens – interaktív szűrők)
│   │   ├── 🔷 Select              (shadcn/ui – kategóriaválasztó)
│   │   ├── 🔷 Slider              (shadcn/ui – árszűrő)
│   │   └── 🔷 Checkbox            (shadcn/ui – szűrőopc.)
│   ├── 🟨 SortSelector
│   │   └── 🔷 Select              (shadcn/ui)
│   └── 🟩 ProductGrid             (szerver – szűrt termékek)
│       └── ProductCard (×N)       (ld. fent)
│
├── 🟦 ProductDetailPage       [app/products/[slug]/page.tsx]
│   ├── 🟩 ProductImageGallery     (szerver – képek megjelenítése)
│   ├── 🟨 ProductInfo
│   │   ├── 🔷 Badge               (shadcn/ui – kategória jelölő)
│   │   ├── 🟨 QuantitySelector
│   │   └── 🟨 AddToCartButton
│   │       └── 🔷 Button          (shadcn/ui)
│   └── 🟩 RelatedProducts         (szerver – azonos kategóriájú ajánlott)
│       └── ProductCard (×N)
│
├── 🟦 CartPage                [app/cart/page.tsx]
│   ├── 🟨 CartItemList
│   │   └── CartItemRow (×N)
│   │       ├── 🔷 Button          (shadcn/ui – törlés)
│   │       └── 🟨 QuantitySelector
│   ├── 🟩 OrderSummary            (szerver – összesítő panel)
│   │   └── 🔷 Separator           (shadcn/ui)
│   └── 🔷 Button                  (shadcn/ui – tovább pénztárhoz)
│
├── 🟦 CheckoutPage            [app/checkout/page.tsx]
│   ├── 🟨 ShippingForm
│   │   ├── 🔷 Input               (shadcn/ui)
│   │   ├── 🔷 Label               (shadcn/ui)
│   │   └── 🔷 Button              (shadcn/ui – Rendelés leadása)
│   └── 🟩 CheckoutSummary         (szerver – rendelés összefoglaló)
│
├── 🟦 LoginPage               [app/login/page.tsx]
│   └── 🟨 LoginForm
│       ├── 🔷 Input               (shadcn/ui)
│       ├── 🔷 Label               (shadcn/ui)
│       ├── 🔷 Button              (shadcn/ui)
│       └── 🔷 Separator           (shadcn/ui – „vagy" elválasztó)
│
├── 🟦 RegisterPage            [app/register/page.tsx]
│   └── 🟨 RegisterForm
│       ├── 🔷 Input               (shadcn/ui)
│       ├── 🔷 Label               (shadcn/ui)
│       └── 🔷 Button              (shadcn/ui)
│
├── 🟦 AccountPage             [app/account/page.tsx]
│   ├── 🟨 ProfileForm
│   │   ├── 🔷 Input               (shadcn/ui)
│   │   └── 🔷 Button              (shadcn/ui)
│   └── 🟩 RecentOrders            (szerver – utolsó 5 rendelés)
│       └── OrderRow (×N)
│           └── 🔷 Badge           (shadcn/ui – státusz badge)
│
└── 🟦 AdminLayout             [app/admin/layout.tsx]
    ├── 🟨 AdminSidebar
    │   └── 🔷 NavigationMenu      (shadcn/ui)
    ├── 🟦 AdminProductsPage   [app/admin/products/page.tsx]
    │   ├── 🟩 ProductsTable       (szerver – táblázatos nézet)
    │   │   └── 🔷 Table / TableRow (shadcn/ui)
    │   └── 🔷 Button              (shadcn/ui – Új termék)
    └── 🟨 ProductForm         [app/admin/products/new|[id]/edit]
        ├── 🔷 Input               (shadcn/ui)
        ├── 🔷 Textarea            (shadcn/ui)
        ├── 🔷 Select              (shadcn/ui – kategória)
        ├── 🔷 Switch              (shadcn/ui – is_active, is_featured)
        ├── 🟨 ImageUploader
        └── 🔷 Button              (shadcn/ui)
```

---

## 3. Részletes Komponens Leírások

---

### 3.1 `Header` 🟨

**Elérési út:** `components/layout/Header.tsx`  
**Típus:** Client Component (`'use client'`)  
**Leírás:** Az alkalmazás globális navigációs sávja. Tartalmazza a logót, a kategóriahivatkozásokat, a keresősávot, a kosár ikont és a felhasználói menüt.

```tsx
// Beágyazott shadcn/ui komponensek:
import { NavigationMenu, NavigationMenuItem } from '@/components/ui/navigation-menu'
import { Badge } from '@/components/ui/badge'

// Beágyazott saját komponensek:
import SearchBar from '@/components/layout/SearchBar'
import CartIcon from '@/components/cart/CartIcon'
import UserMenu from '@/components/layout/UserMenu'
```

**Props:** Nincs – a navigáció adatai szerveren töltődnek be (`CategoryNavLinks` szerver-komponens).

**Aktív oldal kiemelése:** A `usePathname()` hook segítségével az aktuális route-hoz tartozó navigációs hivatkozás eltérő vizuális stílust kap: `border-b-2 border-primary text-primary`. Az `aria-current="page"` attribútum gondoskodik a képernyőolvasós visszajelzésről is.

---

### 3.2 `ProductCard` 🟨

**Elérési út:** `components/products/ProductCard.tsx`  
**Típus:** Client Component (kosárba helyezés interakcióhoz)  
**Leírás:** A leggyakrabban újrafelhasznált összetett komponens. Egy terméket jelenít meg képpel, névvel, árral, kategória-badge-dzsel és egy kosárba helyező gombbal. Terméklistázó oldalakon, a főoldalon és a kapcsolódó termékek szekcióban egyaránt szerepel.

```tsx
interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  category: string
  isNew?: boolean
}
```

**Beágyazott shadcn/ui komponensek:**

| Komponens | Szerepe a kártyán |
|---|---|
| `Card` | Alapkeret, árnyék, lekerekítés |
| `CardContent` | Belső tartalom padding |
| `CardFooter` | Ár + gomb sor |
| `Badge` | „Új" vagy „Akciós" jelölő |
| `Button` | „Kosárba" CTA gomb |

---

### 3.3 `CartDrawer` 🟨

**Elérési út:** `components/cart/CartDrawer.tsx`  
**Típus:** Client Component  
**Leírás:** Egy oldalsó fiók (drawer), amely bármely oldalon megnyitható a kosár ikon megnyomásakor. A kosár tartalmát jeleníti meg, lehetővé teszi a mennyiség módosítását és a tételek törlését, alul összesítő értékkel és a pénztárhoz vezető gombbal.

**Állapotkezelés:** `useCartStore` (Zustand store) – globális kosár állapot.

**Beágyazott shadcn/ui komponensek:**

| Komponens | Szerepe |
|---|---|
| `Sheet` | Oldalsó panel konténer (Radix Dialog alapú) |
| `SheetHeader` | Cím + bezáró gomb |
| `SheetContent` | Görgetható tartalom terület |
| `SheetFooter` | Összesítő + pénztár gomb |
| `Button` | Tétel törlése + pénztár gomb |
| `Separator` | Vizuális elválasztó |

---

### 3.4 `ProductFilters` 🟨

**Elérési út:** `components/products/ProductFilters.tsx`  
**Típus:** Client Component (`'use client'` – URL search params manipulálása)  
**Leírás:** A terméklistázó oldal bal oldali szűrőpanelje. A felhasználó kategóriát, ár-intervallumot és anyagtípust szűrhet. A szűrési állapot az URL search params-ban tárolódik (pl. `?category=kanapek&maxPrice=200000`), így a szűrt nézet megosztható és visszanavigálható.

**Beágyazott shadcn/ui komponensek:**

| Komponens | Szerepe |
|---|---|
| `Select` | Kategória választó legördülő |
| `Slider` | Ár-intervallum beállítása |
| `Checkbox` | Anyag szűrők (Tölgyfa, Szövet…) |
| `Label` | Akadálymentesített szűrő-feliratok |
| `Button` | „Szűrők törlése" |

---

### 3.5 `ProductForm` 🟨

**Elérési út:** `components/admin/ProductForm.tsx`  
**Típus:** Client Component  
**Leírás:** Az admin felületen új termék létrehozásához és meglévő szerkesztéséhez használt összetett űrlap. `react-hook-form` + `zod` validációval működik. Képfeltöltés esetén a Supabase Storage API-t hívja.

```tsx
// Validációs séma (zod)
const productSchema = z.object({
  name:           z.string().min(3).max(200),
  slug:           z.string().min(3),
  description:    z.string().min(10),
  price:          z.number().min(0),
  stock_quantity: z.number().int().min(0),
  category_id:    z.string().uuid(),
  is_active:      z.boolean(),
  is_featured:    z.boolean(),
})
```

**Beágyazott shadcn/ui komponensek:**

| Komponens | Szerepe |
|---|---|
| `Input` | Szöveges mezők (név, ár, készlet) |
| `Textarea` | Termékleírás |
| `Select` | Kategória kiválasztása |
| `Switch` | Aktív / Kiemelt kapcsoló |
| `Label` | Mezőfeliratok |
| `Button` | Mentés / Mégse |
| `Form`, `FormItem`, `FormMessage` | react-hook-form integráció + hibaüzenetek |

---

### 3.6 `ShippingForm` 🟨

**Elérési út:** `components/checkout/ShippingForm.tsx`  
**Típus:** Client Component  
**Leírás:** A pénztár oldal szállítási adatokat bekérő űrlapja. Bejelentkezett felhasználónál előtölti a profilban rögzített szállítási adatokat. A rendelés leadásakor a Next.js Server Action-t hív.

**Beágyazott shadcn/ui komponensek:** `Input`, `Label`, `Button`, `Form`, `FormItem`, `FormMessage`

---

### 3.7 `OrderSummary` 🟩

**Elérési út:** `components/checkout/OrderSummary.tsx`  
**Típus:** Server Component  
**Leírás:** A kosár tartalmát és az összesített árat jeleníti meg a pénztár oldalon. Szerveren fut, így a kosár adatai közvetlenül az adatbázisból tölthetők be szerver-oldali session alapján.

---

### 3.8 `ImageUploader` 🟨

**Elérési út:** `components/admin/ImageUploader.tsx`  
**Típus:** Client Component  
**Leírás:** Drag-and-drop képfeltöltést biztosít az admin termékűrlaphoz. A feltöltött képek előnézete azonnal megjelenik, és a fájlok a Supabase Storage `/product-images` bucketbe kerülnek.

---

## 4. Oldalak és Komponens-összerendelés

### 4.1 Főoldal — `app/page.tsx` 🟩

```
app/page.tsx (Server Component)
├── components/layout/Header.tsx
├── components/home/HeroSection.tsx
├── components/home/FeaturedProducts.tsx
│   └── components/products/ProductCard.tsx (×4–6)
├── components/home/CategoryGrid.tsx
│   └── components/home/CategoryCard.tsx (×N)
└── components/layout/Footer.tsx
```

**Adatlekérés:** `supabaseServerClient` segítségével `is_featured = true` termékek és összes kategória lekérdezése szerveren.

---

### 4.2 Terméklistázó oldal — `app/products/page.tsx`

```
app/products/page.tsx (Server Component)
├── components/layout/Header.tsx
├── components/products/ProductFilters.tsx   [Client – URL params]
├── components/products/SortSelector.tsx     [Client]
├── components/products/ProductGrid.tsx      [Server – szűrt lekérés]
│   └── components/products/ProductCard.tsx (×N)
└── components/layout/Footer.tsx
```

**Adatlekérés:** URL `searchParams` alapján szerver-oldali Supabase lekérés (`category`, `minPrice`, `maxPrice`, `sort`).

---

### 4.3 Termék részletoldal — `app/products/[slug]/page.tsx`

```
app/products/[slug]/page.tsx (Server Component)
├── components/layout/Header.tsx
├── components/products/ProductImageGallery.tsx [Server]
├── components/products/ProductInfo.tsx         [Client – kosárba]
│   ├── components/products/QuantitySelector.tsx
│   └── components/products/AddToCartButton.tsx
│       └── shadcn/ui: Button
├── components/products/RelatedProducts.tsx     [Server]
│   └── components/products/ProductCard.tsx (×4)
└── components/layout/Footer.tsx
```

**Adatlekérés:** `slug` paraméter alapján termék + kapcsolódó termékek (azonos `category_id`) lekérése. `generateMetadata` export SEO meta-tagekhez.

---

### 4.4 Kosár oldal — `app/cart/page.tsx`

```
app/cart/page.tsx (Client Component)
├── components/layout/Header.tsx
├── components/cart/CartItemList.tsx
│   └── components/cart/CartItemRow.tsx (×N)
│       ├── shadcn/ui: Button (törlés)
│       └── components/products/QuantitySelector.tsx
├── components/cart/OrderSummary.tsx
│   └── shadcn/ui: Separator
├── shadcn/ui: Button  (Tovább a pénztárhoz)
└── components/layout/Footer.tsx
```

**Állapot:** Zustand `useCartStore` – kosár globális state, localStorage szinkronizációval.

---

### 4.5 Pénztár oldal — `app/checkout/page.tsx`

```
app/checkout/page.tsx (Server Component – auth ellenőrzés)
├── components/layout/Header.tsx
├── components/checkout/ShippingForm.tsx    [Client]
│   └── shadcn/ui: Input, Label, Button, Form
├── components/checkout/CheckoutSummary.tsx [Server]
└── components/layout/Footer.tsx
```

**Route védelme:** `middleware.ts` ellenőrzi a Supabase session meglétét; nem hitelesített felhasználókat `/login?redirect=/checkout`-ra irányít.

---

### 4.6 Admin oldalak — `app/admin/*`

```
app/admin/layout.tsx
├── components/admin/AdminSidebar.tsx       [Client]
│   └── shadcn/ui: NavigationMenu

app/admin/products/page.tsx
├── components/admin/ProductsDataTable.tsx  [Client – shadcn/ui DataTable]
│   └── shadcn/ui: Table, TableHeader, TableBody, TableRow, TableCell
│       DropdownMenu  (szerkesztés / törlés akciók)
│       Badge         (státusz jelzők)
└── shadcn/ui: Button  (Új termék)

app/admin/products/new/page.tsx
app/admin/products/[id]/edit/page.tsx
└── components/admin/ProductForm.tsx        [Client]
    ├── shadcn/ui: Input, Textarea, Select, Switch, Label, Button, Form
    └── components/admin/ImageUploader.tsx   [Client]

app/admin/orders/page.tsx
└── components/admin/OrdersDataTable.tsx    [Client]
    └── shadcn/ui: Table, Badge, Select (státuszváltáshoz)
```

---

## 5. Megosztott / Utility Komponensek

| Komponens | Elérési út | Leírás |
|---|---|---|
| `QuantitySelector` | `components/products/QuantitySelector.tsx` | +/− gombok mennyiség módosításhoz; `shadcn/ui: Button` |
| `AddToCartButton` | `components/products/AddToCartButton.tsx` | Zustand store-t frissítő gomb; toast visszajelzéssel (`shadcn/ui: Toast`) |
| `LoadingSpinner` | `components/ui/LoadingSpinner.tsx` | Töltési állapot jelző; `shadcn/ui: Skeleton` vagy egyedi SVG |
| `EmptyState` | `components/ui/EmptyState.tsx` | Üres lista / kosár megjelenítése illusztrációval és CTA gombbal |
| `ErrorBoundary` | `components/ui/ErrorBoundary.tsx` | React hibakezelő + `shadcn/ui: Alert` hibaüzenethez |
| `ProtectedRoute` | `components/auth/ProtectedRoute.tsx` | Kliens-oldali auth-ellenőrzés (useUser hook Supabase-ből) |

---

## 6. Shadcn/ui Komponens Összesítő

Az alábbi táblázat összefoglalja az összes felhasznált shadcn/ui alapkomponenst és azok szerepkörét a projektben.

| Komponens | Kategória | Felhasználás |
|---|---|---|
| `Button` | Akció | Elsődleges és másodlagos CTA-k, form gombok, inline akciók |
| `Card` / `CardContent` / `CardFooter` | Elrendezés | Termékkártyák, kategóriakártyák, összesítő panelek |
| `Input` | Forma | Szöveges beviteli mezők (keresés, form mezők) |
| `Textarea` | Forma | Leírás és megjegyzés mezők |
| `Label` | Forma | Akadálymentesített form mezőcímkék |
| `Select` | Forma | Kategória- és rendezésválasztók |
| `Checkbox` | Forma | Szűrőopciók a terméklistán |
| `Switch` | Forma | Boolean kapcsolók (aktív/kiemelt termék) |
| `Slider` | Forma | Árszűrő sávcsúszka |
| `Form` / `FormItem` / `FormMessage` | Forma | react-hook-form integráció és validáció |
| `NavigationMenu` | Navigáció | Főnavigáció és admin oldalsáv |
| `DropdownMenu` | Navigáció | Felhasználói menü, táblázat akció menük |
| `Sheet` | Overlay | Kosár oldalsó fiók (CartDrawer) |
| `Dialog` | Overlay | Megerősítő párbeszédablakok (törlés confirm) |
| `Badge` | Visszajelzés | Kategória, státusz, „Új" jelölők |
| `Avatar` | Megjelenítés | Felhasználói profilkép a fejlécben |
| `Separator` | Elrendezés | Vizuális elválasztók (összesítők, szekciók) |
| `Skeleton` | Töltési állapot | Tartalom-töltő placeholder (Suspense fallback) |
| `Table` / `TableRow` | Adat | Admin adattáblák (termékek, rendelések) |
| `Toast` / `Toaster` | Értesítés | Sikeres kosárba helyezés, mentés visszajelzések |
| `Alert` / `AlertDescription` | Visszajelzés | Hibaüzenetek, figyelmeztetések |
