# SPECIFICATION.md — Bútor Webshop Projekt Specifikáció

> **Projekt neve:** FurnSpace – Modern Bútor Webshop  
> **Technológiai stack:** Next.js 14 (App Router) · Supabase (PostgreSQL + Auth) · shadcn/ui (Tailwind CSS)  
> **Dokumentum verziója:** 1.0  
> **Utolsó módosítás:** 2025

---

## 1. Projekt Leírás

### 1.1 Áttekintés

A **FurnSpace** egy modern, letisztult megjelenésű, teljeskörű e-kereskedelmi platform, amely minőségi bútorok online értékesítésére specializálódott. Az alkalmazás célja, hogy a vásárlók kényelmesen böngészhessenek kategóriánként szűrt termékek között, kosárba helyezhessék a kiválasztott darabokat, és biztonságos fiókkezelés mellett leadhassák rendeléseiket.

### 1.2 Célközönség

| Szegmens | Leírás |
|---|---|
| **Magánvásárlók** | Lakberendezés iránt érdeklődő, 25–55 éves korosztály, aki minőségi bútorokat keres otthona számára |
| **Vállalkozások** | Irodák, vendéglátóhelyek, amelyek nagyobb mennyiségű bútor vásárlásában érdekeltek |
| **Adminisztrátorok** | A webshop tartalmát, termékeit és rendeléseit kezelő belső munkatársak |

### 1.3 Fő Cél

Az alkalmazás elsődleges célja egy **felhasználóbarát, mobilra optimalizált** vásárlási élmény biztosítása, amelyen keresztül a látogatók könnyedén megtalálják a nekik megfelelő bútorokat, és minimális lépésben le tudják zárni a vásárlási folyamatot.

---

## 2. Funkcionális Követelmények

### 2.1 Termékböngészés és Listázás

- **F-01** A rendszer megjeleníti az összes elérhető terméket termékártyák (card) formájában.
- **F-02** A termékek kategória szerint szűrhetők (pl. kanapé, asztal, szék, szekrény).
- **F-03** A termékek rendezetők ár (növekvő/csökkenő), újdonság és névbetűrend szerint.
- **F-04** Minden termékhez elérhető egy részletes termékoldal (neve, leírása, ára, képei, készlete).
- **F-05** A rendszer biztosít egy szöveges keresési funkciót a terméknév és leírás alapján.

### 2.2 Kosárkezelés

- **F-06** A bejelentkezett és nem bejelentkezett látogatók egyaránt kosárba helyezhetnek termékeket.
- **F-07** A kosárban módosítható az egyes tételek mennyisége.
- **F-08** Tételek törölhetők a kosárból egyenként vagy összesen.
- **F-09** A kosár összesített értéke (részösszeg, ÁFA, végösszeg) valós időben frissül.
- **F-10** A kosár tartalma bejelentkezés után szinkronizálódik az adatbázissal (perzisztens kosár).

### 2.3 Autentikáció és Fiókkezelés

- **F-11** A felhasználók e-mail + jelszó kombinációval regisztrálhatnak (Supabase Auth).
- **F-12** Bejelentkezés e-mail + jelszó párossal és OAuth-on (Google) keresztül is lehetséges.
- **F-13** Elfelejtett jelszó esetén e-mail alapú visszaállítás áll rendelkezésre.
- **F-14** A bejelentkezett felhasználó megtekintheti és szerkesztheti profilját (név, szállítási cím).
- **F-15** A felhasználó megtekintheti korábbi rendeléseit és azok státuszát.

### 2.4 Rendeléskezelés (Vásárló)

- **F-16** A vásárló a pénztár (checkout) oldalon megadhatja szállítási adatait.
- **F-17** A rendelés leadásakor a rendszer visszaigazolást jelenít meg és e-mailt küld.
- **F-18** A rendelés státusza (feldolgozás alatt, kiszállítva, teljesítve) a fiókban nyomon követhető.

### 2.5 Adminisztrátori Funkciók

- **F-19** Az adminisztrátor termékeket adhat hozzá, szerkeszthet és törölhet (CRUD műveletek).
- **F-20** Az adminisztrátor kezeli a termékképeket (feltöltés Supabase Storage-ba).
- **F-21** Az adminisztrátor megtekintheti az összes leadott rendelést és frissítheti azok státuszát.
- **F-22** Az adminisztrátor kezeli a termékkategóriákat.

---

## 3. Nem-funkcionális Követelmények

### 3.1 Technológiai Döntések

#### Next.js 14 – App Router

A Next.js App Router architektúrája lehetővé teszi a **szerver- és kliensoldali komponensek** (Server Components / Client Components) tudatos elválasztását. A Supabase Server Client segítségével az adatlekérések szerveren futnak, így javul az oldal betöltési sebessége (LCP) és a SEO. Az API végpontok Next.js Route Handler-ekkel (`route.ts`) kerülnek implementálásra, ezzel egyetlen keretrendszerben van jelen a frontend és a backend logika.

#### Supabase

A Supabase mint Backend-as-a-Service platform biztosítja:
- **PostgreSQL** relációs adatbázist a termék-, rendelés- és felhasználói adatok tárolásához,
- **Row Level Security (RLS)** szabályzatokon alapuló adatvédelmet,
- **Supabase Auth**-ot JWT tokenek és OAuth-folyamatok kezeléséhez,
- **Supabase Storage**-ot termékkép-feltöltéshez.

#### shadcn/ui

A shadcn/ui egy **Radix UI primitívekre épülő, Tailwind CSS-sel stilizált** komponenskönyvtár. Előnye, hogy a komponensek forrása közvetlenül a projektbe másolódik, így teljes mértékben testreszabhatók. Beépített akadálymentesítési (a11y) megoldásokat tartalmaz (ARIA attribútumok, billentyűzetes navigáció, fókuszkezelés).

---

### 3.2 Reszponzív Tervezés – Mobile-First CSS

Az alkalmazás **mobile-first** megközelítéssel épül: az alap stílusok a legkisebb képernyőméretre vonatkoznak, és a médialekérdezések kiterjesztik azokat nagyobb nézetablakokra.

**Minimálisan 3 breakpoint** a Tailwind konfigurációban:

```js
// tailwind.config.ts
theme: {
  screens: {
    'sm': '640px',   // Tablet portrait
    'md': '768px',   // Tablet landscape
    'lg': '1024px',  // Desktop
    'xl': '1280px',  // Wide desktop
  }
}
```

**Flexbox és CSS Grid** alkalmazása Tailwind utility osztályokon keresztül (pl. `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` a terméklistázó rácshoz, `flex items-center justify-between` a navigációs sávhoz).

**Responsive tipográfia** — A szövegméretek fluid módon alkalmazkodnak a nézetablak szélességéhez. A főcímek (hero szekció, termékoldal fejléc) `clamp()`-alapú betűméretet alkalmaznak, amely mobiltól desktopon át folyamatosan skálázódik:

```css
/* globals.css */
.hero-title {
  font-size: clamp(1.75rem, 4vw + 1rem, 3.5rem); /* ~28px → ~56px */
}
.section-heading {
  font-size: clamp(1.25rem, 2.5vw + 0.5rem, 2rem); /* ~20px → ~32px */
}
```

Tailwind-alapú megvalósítás: `text-2xl sm:text-3xl lg:text-4xl xl:text-5xl` létrás méretezéssel.

**Responsive média** — A termékképek és kategóriaborítók minden nézetablak-mérethez alkalmazkodnak. A Next.js `<Image>` komponens automatikusan generál `srcset`-et (WebP + eredeti formátum, több felbontásban), és a képek `object-fit: cover` beállítással töltik ki a konténert. Az egyedi CSS-sel is biztosított a helyes megjelenés:

```css
img {
  max-width: 100%;
  height: auto;
  object-fit: cover;
}
```

**Touch-barát interakciók** — Mobilon minden interaktív elem (gombok, ikonok, szűrőopciók) legalább **44×44px** érintési célterületet biztosít a iOS Human Interface Guidelines és a WCAG 2.5.5 ajánlásoknak megfelelően:

```css
/* globals.css */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

Tailwind: `min-h-[44px] min-w-[44px]` a `CartIcon`, `UserMenu` és `QuantitySelector` komponenseken.

---

### 3.3 Design Token Rendszer

A projekt egységes vizuális nyelvet alkalmaz Tailwind konfigurációval kiegészített CSS változókon keresztül:

```css
/* globals.css */
:root {
  --background:     60 2% 96%;     /* White Smoke - Világos, tiszta háttér */
  --foreground:     0 0% 12%;      /* Sötétszürke - Elegáns szövegszín */
  --primary:        30 80% 35%;    /* Chocolate Brown - Brand szín, fő gombok */
  --primary-foreground: 0 0% 98%;
  --secondary:      31 32% 82%;    /* Almond Cream - Másodlagos gombok, kártya kiemelés */
  --accent:         30 43% 50%;    /* Copper - Akcentusok, hover állapotok, badge-ek */
  --muted:          214 32% 91%;   /* Alice Blue - Inaktív elemek, diszkrét hátterek */
  --border:         30 36% 81%;    /* Pale Oak - Keretek és elválasztók */
  --radius:         0.5rem;
}
```

```js
// tailwind.config.ts – Design tokenek kiterjesztése
theme: {
  extend: {
    colors: {
      primary: 'hsl(var(--primary) / <alpha-value>)',
      secondary: 'hsl(var(--secondary) / <alpha-value>)',
      accent: 'hsl(var(--accent) / <alpha-value>)',
    },
    borderRadius: {
      DEFAULT: 'var(--radius)',
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Playfair Display', 'serif'],
    },
  }
}
```

**Konzisztens spacing-rendszer** — Az alkalmazás **8px-es alaprácson** épül (Tailwind alapértelmezett `spacing` skálja: `1 = 4px`, `2 = 8px`, `4 = 16px`, `6 = 24px`, `8 = 32px`, stb.). A belső padding, margin és gap értékek kizárólag ezen a rácson értelmezett értékeket vesznek fel, biztosítva az egységes ritmusérzetet:

```css
/* globals.css – spacing tokenek */
:root {
  --space-xs:  4px;   /* Tailwind: p-1  / gap-1  */
  --space-sm:  8px;   /* Tailwind: p-2  / gap-2  */
  --space-md: 16px;   /* Tailwind: p-4  / gap-4  */
  --space-lg: 24px;   /* Tailwind: p-6  / gap-6  */
  --space-xl: 32px;   /* Tailwind: p-8  / gap-8  */
  --space-2xl:48px;   /* Tailwind: p-12 / gap-12 */
}
```

**Tipográfiai skála** — A projekt meghatározott betűméret-hierarchiát alkalmaz, amely biztosítja a vizuális rangsorolást oldalanként:

| Szerepkör | Tailwind osztály | Méret | Betűtípus |
|---|---|---|---|
| Főcím (hero) | `text-4xl lg:text-5xl` | 36–48px | Playfair Display, bold |
| Oldal-szintű cím (h1) | `text-3xl` | 30px | Playfair Display, semibold |
| Szekció cím (h2) | `text-2xl` | 24px | Inter, semibold |
| Kártya cím (h3) | `text-lg` | 18px | Inter, medium |
| Alapszöveg | `text-base` | 16px | Inter, regular |
| Kisszöveg / meta | `text-sm` | 14px | Inter, regular |
| Jelölő / badge | `text-xs` | 12px | Inter, medium |

---

### 3.4 Akadálymentesítés (Accessibility)

- **Kontrasztarány:** Minden szöveg–háttér páros megfelel a WCAG 2.1 AA szintnek, azaz legalább **4,5:1** kontrasztarányt biztosít (normál szöveg esetén). Az elsődleges `--primary` szín kiválasztásakor ez a szempont mérvadó volt.
- **Szemantikus HTML:** A komponensek strukturálisan helyes elemeket használnak: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<button>` (nem `<div>` kattintható elemként).
- **Heading-hierarchia:** Az oldalak szigorú fejléc-sorrendnek felelnek meg — minden oldalon pontosan egy `<h1>`, ezt követik `<h2>` szekció-szintű, majd `<h3>` kártya-szintű elemek. Szintköz (pl. `<h1>` → `<h3>`) nem fordul elő. Például a terméklistázó oldalon: `<h1>` az oldal neve, `<h2>` a kategória neve, `<h3>` az egyes termékek neve.
- **ARIA attribútumok:** A shadcn/ui komponensek (Dialog, DropdownMenu, NavigationMenu) beépítetten alkalmazzák a szükséges `aria-label`, `aria-expanded`, `role` attribútumokat.
- **Billentyűzetes navigáció:** Teljes billentyűzetes kezelhetőség biztosított (Tab, Enter, Escape, nyílbillentyűk).
- **Fókusz-kezelés:** Minden interaktív elem (gomb, hivatkozás, input, select) látható `:focus-visible` stílust kap, amely nem csupán outline eltávolítása, hanem kontrasztos keret:

```css
/* globals.css */
:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  border-radius: var(--radius);
}
```

  A modális dialógusok és a CartDrawer megnyitásakor a fókusz programmatikusan az első interaktív elemre ugrik (`autoFocus`), bezáráskor visszatér a triggerre.
- **Alt szövegek:** Minden termékképhez kötelező `alt` attribútum megadása.
- **Skip link:** Az oldal legtetején egy billentyűzettel elérhető „Ugrás a tartalomra" link van elhelyezve, amely alapállapotban vizuálisan rejtett, fókuszáláskor megjelenik:

```tsx
// app/layout.tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
             focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground
             focus:rounded focus:shadow-lg"
>
  Ugrás a tartalomra
</a>
// ...
<main id="main-content">...</main>
```

---

### 3.5 Kliens-oldali Routing

A Next.js App Router natív `<Link>` komponense és a `useRouter` hook biztosítja a **kliens-oldali navigációt** (SPA-szerű oldalváltás teljes újratöltés nélkül). A route-szintű előtöltés (prefetching) alapértelmezetten aktív, ami gyors oldalváltást eredményez.

**Aktív oldal vizuális kiemelése** — A `Header` és az `AdminSidebar` komponensekben a `usePathname()` hook visszaadja az aktuális URL-t, amellyel az aktív navigációs hivatkozás eltérő vizuális stílust kap (vastag alávonás, kiemelő szín):

```tsx
// components/layout/Header.tsx
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navLinks = [
  { href: '/products', label: 'Termékek' },
  { href: '/cart',     label: 'Kosár'    },
]

export function NavLinks() {
  const pathname = usePathname()
  return (
    <nav aria-label="Főnavigáció">
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname.startsWith(href) ? 'page' : undefined}
          className={`px-3 py-2 text-sm font-medium transition-colors
            ${pathname.startsWith(href)
              ? 'text-primary border-b-2 border-primary'
              : 'text-foreground/70 hover:text-foreground'
            }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
```

---

### 3.6 Teljesítmény és Biztonság

| Követelmény | Megvalósítás |
|---|---|
| Képoptimalizálás | Next.js `<Image>` komponens (WebP konverzió, lazy loading) |
| Szerveroldali renderelés | Termék- és kategóriaoldalak SSR/SSG Next.js-szel |
| Adatvédelem | Supabase RLS szabályzatok, HTTP-only JWT cookie |
| Input validáció | `zod` sémavalidáció React Hook Form-mal |
| HTTPS | Vercel deployment alapesetben HTTPS-t biztosít |

---

## 4. Felhasználói Szerepkörök

### 4.1 Látogató (nem hitelesített)

A látogató regisztráció nélkül is böngészhet a webshopban.

**Elérhető műveletek:**
- Termékek böngészése, szűrése, keresése
- Termékoldal megtekintése
- Termékek kosárba helyezése (session-alapú kosár)
- Regisztrációs és bejelentkezési oldalak elérése

**Nem elérhető:**
- Rendelés leadása (bejelentkezés szükséges)
- Rendelési előzmények megtekintése
- Adminisztrátori felület

---

### 4.2 Regisztrált Vásárló (hitelesített)

**Elérhető műveletek:**
- Minden látogatói funkció
- Rendelés leadása szállítási adatok megadásával
- Rendelési előzmények és státuszok megtekintése
- Profil szerkesztése (név, szállítási cím, jelszó módosítás)
- Perzisztens kosár (adatbázis-szinkronizáció)

**Nem elérhető:**
- Adminisztrátori felület (403 visszairányítás)

---

### 4.3 Adminisztrátor

Az adminisztrátor szerepkör a `users` táblában egy `role: 'admin'` mezővel van jelölve, és a Supabase RLS szabályzatok, illetve szerver-middleware-ben ellenőrzött útvonalvédelem biztosítja a hozzáférést.

**Elérhető műveletek:**
- Minden vásárlói funkció
- `/admin` útvonal és aloldalai
- Termék CRUD (létrehozás, olvasás, frissítés, törlés)
- Termékkép kezelése (Supabase Storage)
- Kategória CRUD
- Összes rendelés megtekintése és státuszuk módosítása

---

## 5. Képernyő-lista / Sitemap

### 5.1 Publikus Oldalak

| Route | Fájl | Leírás |
|---|---|---|
| `/` | `app/page.tsx` | Főoldal (hero szekció, kiemelt termékek, kategóriák) |
| `/products` | `app/products/page.tsx` | Terméklistázó oldal (szűrők, rendezés, rács) |
| `/products/[slug]` | `app/products/[slug]/page.tsx` | Egyedi termékoldal (részletek, képgaléria, kosárba) |
| `/cart` | `app/cart/page.tsx` | Kosár oldal (tételek listája, összesítő) |
| `/checkout` | `app/checkout/page.tsx` | Pénztár (szállítási adatok, rendelés összefoglalója) |
| `/login` | `app/login/page.tsx` | Bejelentkezési oldal |
| `/register` | `app/register/page.tsx` | Regisztrációs oldal |
| `/not-found` | `app/not-found.tsx` | 404 hibaoldal |

### 5.2 Hitelesített Felhasználói Oldalak

| Route | Fájl | Leírás |
|---|---|---|
| `/account` | `app/account/page.tsx` | Felhasználói fiók (profil, adatok szerkesztése) |
| `/account/orders` | `app/account/orders/page.tsx` | Rendelési előzmények listája |
| `/account/orders/[id]` | `app/account/orders/[id]/page.tsx` | Egyedi rendelés részletes nézete |
| `/order-confirmation` | `app/order-confirmation/page.tsx` | Rendelés visszaigazolása |

### 5.3 Adminisztrátori Oldalak

| Route | Fájl | Leírás |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | Admin dashboard (statisztikák, áttekintő) |
| `/admin/products` | `app/admin/products/page.tsx` | Terméklista kezelése |
| `/admin/products/new` | `app/admin/products/new/page.tsx` | Új termék hozzáadása |
| `/admin/products/[id]/edit` | `app/admin/products/[id]/edit/page.tsx` | Meglévő termék szerkesztése |
| `/admin/orders` | `app/admin/orders/page.tsx` | Rendelések kezelése |
| `/admin/categories` | `app/admin/categories/page.tsx` | Kategóriák kezelése |

### 5.4 Navigáció Logikája

```
Főoldal (/)
├── Termékek (/products)
│   └── Termékoldal (/products/[slug])
│       └── → Kosárba helyezés → Kosár (/cart)
│                                    └── → Pénztár (/checkout)
│                                            └── → Rendelés visszaigazolása
├── Bejelentkezés (/login)
│   └── → Elfelejtett jelszó
├── Regisztráció (/register)
├── Fiókom (/account)  [csak hitelesített]
│   └── Rendeléseim (/account/orders)
│       └── Rendelés részletek (/account/orders/[id])
└── Admin (/admin)  [csak admin szerepkör]
    ├── Termékkezelés (/admin/products)
    ├── Rendeléskezelés (/admin/orders)
    └── Kategóriakezelés (/admin/categories)
```
