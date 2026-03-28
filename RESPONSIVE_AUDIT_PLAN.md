# RESPONSIVE_AUDIT_PLAN.md — FurnSpace Reszponzív Implementációs Terv

> **Cél:** Az összes oldal mobile-first szemléletre hozása és a breakpointok közti rések felszámolása.  
> **Breakpoint rendszer (Tailwind):** `base` <640px · `sm` 640px · `md` 768px · `lg` 1024px · `xl` 1280px  
> **Agent feladata iterációnként:** (1) Megnyitja a fájl(oka)t. (2) Végigmegy az ellenőrzőlistán. (3) Minden hiányosságot javít. (4) Commitolja a változtatásokat.

---

## Agent Irányelvek

### Audit módszer
Minden fájlban az agent keressen rá az alábbi mintákra, és ellenőrizze, hogy **base (mobil) stílus mindig van**, mielőtt `sm:`, `md:`, `lg:` prefixek szerepelnek:

```
# ROSSZ – nincs mobil alap:
className="hidden md:flex"           → mobil: nem jelenik meg, de nincs mobil alternatíva
className="grid-cols-3 lg:grid-cols-4"  → mobilon 3 oszlop → túl szűk

# JÓ – mobile-first:
className="flex flex-col sm:flex-row"
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
className="hidden md:flex"  ← CSAK akkor ok, ha van egy mobil hamburger menü helyette
```

### Rések ellenőrzése — kötelező tesztelési szélességek
Minden iteráció végén az agent mentálisan végigfut ezeken:

| Szélesség | Szimbolikus eszköz | Kritikus kérdés |
|---|---|---|
| 320px | Kis telefon | Kicsúszik-e bármi a képernyőről? Van-e vízszintes scroll? |
| 375px | iPhone SE | Elférnek-e a gombok? Olvasható-e a szöveg? |
| 540px | Nagyobb telefon | Az átmenet sm-re zökkenőmentes-e? |
| 640px | `sm` breakpoint | Pont itt vált-e rendesen a layout? |
| 768px | `md` – Tablet portrait | Kétoszlopos elemek rendesen állnak-e? |
| 900px | Tablet landscape | Nincs-e felesleges fehér tér? |
| 1024px | `lg` – Desktop | A végleges desktop layout megjelenik-e? |
| 1280px | `xl` – Wide | Nincs-e túl széles szövegtömb? |

### Touch target szabály
Minden interaktív elem mobilon: `min-h-[44px] min-w-[44px]`  
Ellenőrizni: gombok, ikonok, linkek, checkbox-ok, select elemek.

---

## 🌐 Fázis 1: Globális Layout Komponensek
*Ezek minden oldalon jelen vannak — hibájuk minden oldalt érint.*

---

### Iteráció 1.1 — `app/layout.tsx` és `globals.css`
**Fájlok:** `app/layout.tsx`, `app/globals.css`

**Audit:**
- [ ] Van-e `<meta name="viewport" content="width=device-width, initial-scale=1">` a `<head>`-ben?
- [ ] Van-e globális `box-sizing: border-box` és `overflow-x: hidden` a `body`-n?
- [ ] A skip link (`#main-content`) mobilon is elérhető és megfelelően pozicionált?
- [ ] A `<main id="main-content">` kap-e `width: 100%` / `max-width` korlátot?

**Javítandó minták:**
```css
/* globals.css – kötelező globális alapok */
*, *::before, *::after { box-sizing: border-box; }
html { overflow-x: hidden; scroll-behavior: smooth; }
body { min-width: 320px; }  /* legkisebb támogatott szélesség */
img, video { max-width: 100%; height: auto; }
```

---

### Iteráció 1.2 — `components/layout/Header.tsx`
**Fájlok:** `components/layout/Header.tsx`, `components/layout/SearchBar.tsx`, `components/cart/CartIcon.tsx`, `components/layout/UserMenu.tsx`

**Audit:**
- [ ] Mobilon (`base`) a navigációs linkek el vannak-e rejtve, és helyettük hamburger ikon jelenik meg?
- [ ] A hamburger menü (`Sheet`) legalább `44×44px` érintési területű?
- [ ] A mobilos menüben (`Sheet`) minden link megfelelően kattintható (`py-3` minimum)?
- [ ] A logo szöveg nem törik-e ketté 320px-en?
- [ ] `SearchBar` mobilon ikon, tableten+ kinyíló mező — az átmenet `sm:`-nél van-e?
- [ ] A `CartIcon` badge számjegye nem lóg-e ki a körből kis számokon? (99+ esetén?)
- [ ] A header magassága rögzített-e (`h-16` vagy `h-14`), hogy a tartalom ne ugorjon?

**Elvárt struktúra:**
```tsx
// Header belső layout
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
  <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
    {/* Logo – mindig látható */}
    <Logo />
    
    {/* Desktop nav – md felett */}
    <nav className="hidden md:flex items-center gap-6">
      <NavLinks />
    </nav>
    
    {/* Jobb oldali ikonok */}
    <div className="flex items-center gap-2">
      <SearchBar />     {/* mobilon ikon, sm+ szövegmező */}
      <CartIcon />      {/* mindig látható */}
      <UserMenu />      {/* mobilon ikon, md+ szöveg+ikon */}
      <MobileMenuTrigger className="md:hidden" /> {/* CSAK mobilon */}
    </div>
  </div>
</header>
```

**Rés-ellenőrzés:** 540–640px (md előtt) — a nav el van rejtve, de a hamburger jól látható?

---

### Iteráció 1.3 — `components/layout/Footer.tsx`
**Fájlok:** `components/layout/Footer.tsx`

**Audit:**
- [ ] Mobilon (`base`) egymás alatt vannak-e az oszlopok? (`flex-col` vagy `grid-cols-1`)
- [ ] Tableten (`sm`) 2 oszlop, desktopon (`lg`) 3+ oszlop?
- [ ] A footer linkek `py-2 min-h-[44px]` érintési területtel rendelkeznek-e mobilon?
- [ ] A copyright sor középre igazított-e mobilon?

**Elvárt struktúra:**
```tsx
<footer className="border-t bg-muted/30 mt-auto">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Brand oszlop */}
      {/* Navigáció oszlop */}
      {/* Kapcsolat oszlop */}
    </div>
    <Separator className="my-8" />
    <p className="text-center text-sm text-muted-foreground">...</p>
  </div>
</footer>
```

---

### Iteráció 1.4 — `components/cart/CartDrawer.tsx`
**Fájlok:** `components/cart/CartDrawer.tsx`, `components/cart/CartItemRow.tsx`

**Audit:**
- [ ] A `Sheet` szélessége mobilon `w-full` (teljes képernyő), tableten+ `max-w-md`?
- [ ] `CartItemRow`: a termék kép + szöveg + mennyiség + törlés egy sorban elfér-e mobilon?
- [ ] A termék neve nem törik-e csúnyán? (`line-clamp-2`)
- [ ] A `SheetFooter` gombok érintési területe legalább `44px` magas?
- [ ] Az ár igazítása konzisztens-e (jobb oldal)?

**Elvárt struktúra:**
```tsx
<SheetContent className="flex flex-col w-full sm:max-w-md">
  {/* CartItemRow belső layout */}
  <div className="flex gap-3 py-4">
    <div className="relative h-20 w-20 flex-shrink-0 rounded overflow-hidden">
      <Image fill ... />
    </div>
    <div className="flex flex-1 flex-col justify-between min-w-0">
      <p className="text-sm font-medium line-clamp-2">{name}</p>
      <div className="flex items-center justify-between gap-2">
        <QuantitySelector ... />
        <span className="font-semibold text-sm">{price}</span>
      </div>
    </div>
    <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">✕</Button>
  </div>
</SheetContent>
```

---

## 🏠 Fázis 2: Főoldal (`/`)

### Iteráció 2.1 — `app/page.tsx` és `components/home/HeroSection.tsx`
**Fájlok:** `app/page.tsx`, `components/home/HeroSection.tsx`

**Audit:**
- [ ] Mobilon a hero szöveg (`clamp()`) olvasható méretű-e? (`min: 1.75rem`)
- [ ] A CTA gombok mobilon egymás alá kerülnek-e (`flex-col sm:flex-row`)?
- [ ] A hero háttérkép/szín mobilon nem töri-e el az elrendezést?
- [ ] Van-e megfelelő `padding` a container széleire mobilon? (`px-4`)
- [ ] A hero `min-h` értéke nem teszi-e görgethetővé mobil above-the-fold-on?

**Elvárt struktúra:**
```tsx
<section className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh] 
                    flex items-center justify-center text-center px-4">
  <div className="max-w-3xl mx-auto space-y-6">
    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold">
      ...
    </h1>
    <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">...</p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Button size="lg" className="min-h-[44px]">Termékek</Button>
      <Button size="lg" variant="outline" className="min-h-[44px]">Rólunk</Button>
    </div>
  </div>
</section>
```

---

### Iteráció 2.2 — `components/home/CategoryGrid.tsx` és `components/home/FeaturedProducts.tsx`
**Fájlok:** `components/home/CategoryGrid.tsx`, `components/home/CategoryCard.tsx`, `components/home/FeaturedProducts.tsx`

**Audit – CategoryGrid:**
- [ ] Mobilon (`base`) legalább 2 oszlop (nem 1, nem 6)?
- [ ] A kártyák szövege nem lóg-e ki a kártyából?
- [ ] A képek `aspect-ratio` konzisztens minden kártyán?

**Elvárt struktúra:**
```tsx
// CategoryGrid
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
  {categories.map(cat => <CategoryCard key={cat.id} {...cat} />)}
</div>

// CategoryCard
<Link className="group flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent/10">
  <div className="relative w-full aspect-square rounded-md overflow-hidden">
    <Image fill className="object-cover group-hover:scale-105 transition-transform" />
  </div>
  <span className="text-xs sm:text-sm font-medium text-center">{name}</span>
</Link>
```

**Audit – FeaturedProducts:**
- [ ] Mobilon 1 oszlop, `sm` 2 oszlop, `lg` 4 oszlop?
- [ ] A ProductCard magassága konzisztens-e soron belül? (`h-full` a Card-on)

```tsx
// FeaturedProducts grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
```

---

## 🛍️ Fázis 3: Terméklista (`/products`)

### Iteráció 3.1 — `components/products/ProductCard.tsx`
**Fájlok:** `components/products/ProductCard.tsx`

**Audit:**
- [ ] Mobilon a kártya egy teljes sort tölt ki (`col-span-1`)?
- [ ] A termékképek `aspect-ratio: 4/3` vagy `1/1` — konzisztens és nem ugrik?
- [ ] A "Kosárba" gomb `min-h-[44px]` teljesül-e?
- [ ] Az ár és a gomb egy sorba kerül-e mobilon, vagy vertikálisan egymás alá?
- [ ] A termék neve 2 sorra levágódik-e (`line-clamp-2`) a layout törése helyett?

**Elvárt struktúra:**
```tsx
<Card className="flex flex-col h-full overflow-hidden group">
  <div className="relative aspect-[4/3] overflow-hidden">
    <Image fill className="object-cover group-hover:scale-105 transition-transform" />
    {isNew && <Badge className="absolute top-2 left-2">Új</Badge>}
  </div>
  <CardContent className="flex flex-col flex-1 p-4">
    <p className="text-xs text-muted-foreground mb-1">{category}</p>
    <h3 className="font-medium text-sm sm:text-base line-clamp-2 flex-1 mb-3">{name}</h3>
    <div className="flex items-center justify-between gap-2 mt-auto">
      <span className="font-bold text-base sm:text-lg">{price}</span>
      <AddToCartButton className="min-h-[44px]" ... />
    </div>
  </CardContent>
</Card>
```

---

### Iteráció 3.2 — `app/products/page.tsx`, `components/products/ProductFilters.tsx`, `components/products/SortSelector.tsx`
**Fájlok:** `app/products/page.tsx`, `components/products/ProductFilters.tsx`, `components/products/SortSelector.tsx`, `components/products/ProductGrid.tsx`

**Audit – oldal layout:**
- [ ] Mobilon a szűrők NEM oldalsávban vannak, hanem egy kinyíló `Sheet`/`Drawer`-ben?
- [ ] Tableten (`md`) megjelenik az oldalsáv szűrő?
- [ ] A `SortSelector` és a "Szűrők" gomb egy sorban van-e mobilon?
- [ ] A termékek száma megjelenik-e (`X termék`)?

**Elvárt oldal struktúra:**
```tsx
// app/products/page.tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Mobil: szűrő fejléc sor */}
  <div className="flex items-center justify-between gap-4 mb-6">
    <h1 className="text-2xl sm:text-3xl font-display font-bold">Termékeink</h1>
    <div className="flex items-center gap-2">
      {/* Szűrő gomb – CSAK mobilon */}
      <Button variant="outline" className="md:hidden min-h-[44px]">
        Szűrők
      </Button>
      <SortSelector />
    </div>
  </div>
  
  <div className="flex gap-8">
    {/* Oldalsáv – CSAK md+ */}
    <aside className="hidden md:block w-64 flex-shrink-0">
      <ProductFilters />
    </aside>
    
    {/* Termékrács */}
    <ProductGrid className="flex-1" />
  </div>
  
  {/* Mobil szűrő Sheet */}
  <MobileFiltersSheet /> {/* Sheet-be csomagolt ProductFilters */}
</div>
```

**Audit – ProductFilters:**
- [ ] A `Slider` komponens mobilon is kezelhető (elég nagy a csúszka fogója: `h-5 w-5`)?
- [ ] A checkbox-ok érintési területe `min-h-[44px]`?

---

## 🔍 Fázis 4: Termék Részletoldal (`/products/[slug]`)

### Iteráció 4.1 — `components/products/ProductImageGallery.tsx`
**Fájlok:** `components/products/ProductImageGallery.tsx`

**Audit:**
- [ ] Mobilon a főkép teljes szélességű, a thumbnailok alatta vízszintesen görgethetők?
- [ ] Tableten+ a thumbnailok balra kerülnek vertikálisan?
- [ ] A főkép `aspect-ratio` fixált-e (nem ugrik betöltéskor)?
- [ ] A thumbnail gombjai `min-h-[44px] min-w-[44px]`?

**Elvárt struktúra:**
```tsx
// Mobilon: stack, tableten: side-by-side thumbnails
<div className="flex flex-col sm:flex-row-reverse gap-4">
  {/* Főkép */}
  <div className="relative aspect-square w-full sm:flex-1 rounded-lg overflow-hidden">
    <Image fill className="object-cover" />
  </div>
  
  {/* Thumbnailok – mobilon scroll, sm+-on stack */}
  <div className="flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-x-visible
                  sm:w-20 pb-2 sm:pb-0">
    {images.map((img, i) => (
      <button key={i} className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 
                                  rounded overflow-hidden min-h-[44px] min-w-[44px]">
        <Image fill className="object-cover" />
      </button>
    ))}
  </div>
</div>
```

---

### Iteráció 4.2 — `app/products/[slug]/page.tsx` és `components/products/ProductInfo.tsx`
**Fájlok:** `app/products/[slug]/page.tsx`, `components/products/ProductInfo.tsx`, `components/products/RelatedProducts.tsx`

**Audit – oldal layout:**
- [ ] Mobilon a galéria és az infopanel egymás alatt van-e (`flex-col`)?
- [ ] Tableten+ (`lg`) kétoszlopos elrendezés (50-50 vagy 55-45)?
- [ ] Az infopanel nem „ugrik" a galériára mobilon?

**Audit – ProductInfo:**
- [ ] Az ár megfelelő méretű mobilon is (`text-2xl sm:text-3xl`)?
- [ ] A `QuantitySelector` + `AddToCartButton` egy sorban elfér-e 320px-en?
- [ ] Ha a gomb szövege hosszú, nem törik-e?
- [ ] A részletes adatok (anyag, szín, méretek) összecsukható panelben vannak-e mobilon?

```tsx
// app/products/[slug]/page.tsx – oldal layout
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
    <ProductImageGallery images={product.images} />
    <ProductInfo product={product} />
  </div>
  <RelatedProducts products={related} className="mt-16" />
</div>
```

```tsx
// QuantitySelector + gomb sor
<div className="flex items-center gap-3 mt-6">
  <QuantitySelector ... />  {/* min-h-[44px] */}
  <AddToCartButton className="flex-1 min-h-[44px]" />
</div>
```

**Audit – RelatedProducts:**
- [ ] Mobilon 1 oszlop, `sm` 2 oszlop, `lg` 4 oszlop?

---

## 🛒 Fázis 5: Kosár Oldal (`/cart`)

### Iteráció 5.1 — `app/cart/page.tsx`, `components/cart/CartItemList.tsx`, `components/cart/OrderSummary.tsx`
**Fájlok:** `app/cart/page.tsx`, `components/cart/CartItemList.tsx`, `components/cart/CartItemRow.tsx`, `components/cart/OrderSummary.tsx`

**Audit – oldal layout:**
- [ ] Mobilon (`base`) lista + összesítő egymás alatt?
- [ ] `lg`-en kétoszlopos (`grid-cols-1 lg:grid-cols-3`): lista 2/3, összesítő 1/3?
- [ ] Az összesítő mobilon az oldal aljára ragad-e (`sticky bottom-0` opcionális)?

**Audit – CartItemRow:**
- [ ] A sor elemei (kép, adatok, mennyiség, ár, törlés) mobilon nem lógnak ki?
- [ ] Kis képernyőn a kép kisebb (`w-16 sm:w-24`)
- [ ] A törlés gomb ne legyen megnyomhatatlanul kicsi

**Elvárt CartItemRow:**
```tsx
<div className="flex gap-3 sm:gap-4 py-4 border-b">
  {/* Kép */}
  <div className="relative w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 rounded overflow-hidden">
    <Image fill className="object-cover" />
  </div>
  
  {/* Tartalom */}
  <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between 
                  gap-2 min-w-0">
    <div className="min-w-0">
      <p className="font-medium text-sm sm:text-base line-clamp-2">{name}</p>
      <p className="text-xs sm:text-sm text-muted-foreground">{price} / db</p>
    </div>
    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
      <QuantitySelector className="min-h-[44px]" />
      <span className="font-bold text-sm sm:text-base w-20 sm:w-24 text-right">
        {totalPrice}
      </span>
      <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">✕</Button>
    </div>
  </div>
</div>
```

**Elvárt oldal layout:**
```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <h1 className="text-2xl sm:text-3xl font-display font-bold mb-8">Kosaram</h1>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2">
      <CartItemList />
    </div>
    <div className="lg:col-span-1">
      <OrderSummary />
    </div>
  </div>
</div>
```

---

## 💳 Fázis 6: Checkout és Visszaigazolás (`/checkout`, `/order-confirmation`)

### Iteráció 6.1 — `app/checkout/page.tsx` és `components/checkout/ShippingForm.tsx`
**Fájlok:** `app/checkout/page.tsx`, `components/checkout/ShippingForm.tsx`, `components/checkout/CheckoutSummary.tsx`

**Audit – oldal layout:**
- [ ] Mobilon az összefoglaló (CheckoutSummary) a form FELETT vagy ALATT van?  
  *(Ajánlott: mobilon ALATT, desktopon jobbra → fordított DOM sorrendben `order-` osztályokkal)*
- [ ] `lg`-en kétoszlopos: form bal 55%, összefoglaló jobb 45%?

**Audit – ShippingForm:**
- [ ] A form mezők mobilon is kényelmesen kitölthetők (kellő padding, `text-base` input)? 
  *(`font-size: 16px` minimum iOS zoom elkerüléséhez — `text-base` = 16px Tailwindben)*
- [ ] Az irányítószám + város egy sorba kerül-e `sm`-en? (`grid grid-cols-1 sm:grid-cols-2`)
- [ ] A "Rendelés leadása" gomb teljes szélességű mobilon, fixált jobb oldalon desktopon?
- [ ] A hibaüzenetek olvashatóak-e kis képernyőn?

**Elvárt form grid:**
```tsx
<form className="space-y-4">
  {/* Egy sor – mindig */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <FormField name="full_name" ... />
    <FormField name="phone" ... />
  </div>
  <FormField name="email" ... />
  <FormField name="address" ... />
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    <FormField name="zip" ... />
    <FormField name="city" className="sm:col-span-2" ... />
  </div>
  <FormField name="country" ... />
  <FormField name="notes" ... />  {/* Textarea */}
  <Button type="submit" className="w-full min-h-[44px] mt-6">Rendelés leadása</Button>
</form>
```

**Elvárt oldal layout:**
```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
    <div className="lg:col-span-3 order-2 lg:order-1">
      <ShippingForm />
    </div>
    <div className="lg:col-span-2 order-1 lg:order-2">
      <CheckoutSummary />
    </div>
  </div>
</div>
```

---

### Iteráció 6.2 — `app/order-confirmation/page.tsx`
**Fájlok:** `app/order-confirmation/page.tsx`

**Audit:**
- [ ] Az oldal tartalma mobilon is középre igazított?
- [ ] A visszaigazoló szöveg nem olvashatatlanul pici?
- [ ] A "Főoldalra" gomb `min-h-[44px]`, teljes szélességű mobilon?

**Elvárt struktúra:**
```tsx
<div className="container mx-auto px-4 py-16 flex flex-col items-center text-center 
                max-w-lg mx-auto">
  <CheckCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-primary mb-6" />
  <h1 className="text-2xl sm:text-3xl font-display font-bold mb-4">Köszönjük!</h1>
  <p className="text-muted-foreground mb-2">Rendelési azonosítód:</p>
  <p className="font-mono font-bold text-lg mb-8">{orderId}</p>
  <Button asChild className="w-full sm:w-auto min-h-[44px]">
    <Link href="/">Vissza a főoldalra</Link>
  </Button>
</div>
```

---

## 🔐 Fázis 7: Autentikációs Oldalak (`/login`, `/register`)

### Iteráció 7.1 — `app/login/page.tsx` és `app/register/page.tsx`
**Fájlok:** `app/login/page.tsx`, `components/auth/LoginForm.tsx`, `app/register/page.tsx`, `components/auth/RegisterForm.tsx`

**Audit:**
- [ ] A kártya mobilon teljes szélességű (`w-full`), tableten+ fixált szélességű (`max-w-md`)?
- [ ] A form középre van-e igazítva vertikálisan is? (`min-h-screen flex items-center justify-center`)
- [ ] Az inputok `text-base` (16px) méretűek-e? *(iOS auto-zoom elkerülése)*
- [ ] A Google OAuth gomb `min-h-[44px]`?
- [ ] Az "Elfelejtett jelszó?" link érintési területe elég nagy (`py-2 inline-block`)?
- [ ] A `Separator` "vagy" felirat vizuálisan értelmes-e mobilon?

**Elvárt layout:**
```tsx
<div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
  <div className="w-full max-w-md">
    <Card className="shadow-lg">
      <CardHeader className="text-center pb-2">
        <h1 className="text-2xl font-display font-bold">Bejelentkezés</h1>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm />
      </CardContent>
    </Card>
    <p className="text-center text-sm text-muted-foreground mt-6">
      Még nincs fiókod?{' '}
      <Link href="/register" className="text-primary hover:underline py-1 inline-block">
        Regisztrálj
      </Link>
    </p>
  </div>
</div>
```

---

## 👤 Fázis 8: Felhasználói Fiók (`/account`, `/account/orders`, `/account/orders/[id]`)

### Iteráció 8.1 — `app/account/page.tsx` és `components/account/ProfileForm.tsx`
**Fájlok:** `app/account/page.tsx`, `components/account/ProfileForm.tsx`

**Audit:**
- [ ] A Tab-ok mobilon is kényelmesen váltogathatók? (nem vágódnak le, `overflow-x-auto`)
- [ ] A `Tabs` trigger magassága `min-h-[44px]`?
- [ ] A ProfileForm mezők `sm:grid-cols-2` rácsban vannak-e?
- [ ] A "Mentés" gomb teljes szélességű mobilon (`w-full sm:w-auto`)?

**Elvárt Tabs:**
```tsx
<Tabs defaultValue="profile">
  <TabsList className="w-full sm:w-auto overflow-x-auto">
    <TabsTrigger value="profile" className="min-h-[44px] flex-1 sm:flex-none">Profil</TabsTrigger>
    <TabsTrigger value="orders" className="min-h-[44px] flex-1 sm:flex-none">Rendelések</TabsTrigger>
  </TabsList>
  ...
</Tabs>
```

---

### Iteráció 8.2 — `app/account/orders/page.tsx` és `app/account/orders/[id]/page.tsx`
**Fájlok:** `app/account/orders/page.tsx`, `components/account/OrderRow.tsx`, `app/account/orders/[id]/page.tsx`

**Audit – OrderRow (táblázat):**
- [ ] Mobilon a táblázat vízszintesen görgethetős (`overflow-x-auto` wrapper), VAGY
- [ ] Mobilon a tábla `display: none`, helyette kártyás nézet van? *(kártyás nézet javasolt)*

**Elvárt megközelítés (dual view):**
```tsx
{/* Asztali táblázat – md+ */}
<div className="hidden md:block overflow-x-auto">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Rendelés ID</TableHead>
        <TableHead>Dátum</TableHead>
        <TableHead>Státusz</TableHead>
        <TableHead>Összeg</TableHead>
        <TableHead></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {orders.map(order => <OrderTableRow key={order.id} order={order} />)}
    </TableBody>
  </Table>
</div>

{/* Mobil kártyás nézet */}
<div className="md:hidden space-y-4">
  {orders.map(order => <OrderCard key={order.id} order={order} />)}
</div>
```

**Audit – Rendelés részletoldal (`/account/orders/[id]`):**
- [ ] A tételek listája mobilon olvasható (nem vágódnak le a sorok)?
- [ ] A szállítási és összesítő adatok mobilon egymás alatt vannak?

---

## ⚙️ Fázis 9: Admin — Layout és Dashboard (`/admin`)

### Iteráció 9.1 — `app/admin/layout.tsx` és `components/admin/AdminSidebar.tsx`
**Fájlok:** `app/admin/layout.tsx`, `components/admin/AdminSidebar.tsx`

**Audit:**
- [ ] Mobilon (`base`) az oldalsáv el van-e rejtve, és hamburger gomb nyitja egy `Sheet`-ben?
- [ ] Tableten (`md`) a fix oldalsáv megjelenik-e?
- [ ] Az oldalsáv menüpontjai `min-h-[44px]` érintési területtel rendelkeznek-e?
- [ ] A tartalom terület mobilon teljes szélességű-e?

**Elvárt layout:**
```tsx
// app/admin/layout.tsx
<div className="flex min-h-screen">
  {/* Fix oldalsáv – CSAK md+ */}
  <aside className="hidden md:flex w-64 flex-shrink-0 flex-col border-r bg-muted/20">
    <AdminSidebarContent />
  </aside>
  
  {/* Tartalom */}
  <div className="flex-1 flex flex-col min-w-0">
    {/* Mobil fejléc hamburgerrel */}
    <header className="md:hidden flex items-center gap-4 p-4 border-b">
      <MobileAdminMenuTrigger />
      <span className="font-semibold">FurnSpace Admin</span>
    </header>
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      {children}
    </main>
  </div>
  
  {/* Mobil Sheet */}
  <MobileAdminSheet />
</div>
```

---

### Iteráció 9.2 — `app/admin/page.tsx` (Dashboard)
**Fájlok:** `app/admin/page.tsx`

**Audit:**
- [ ] A stat kártyák mobilon `grid-cols-2`, desktopon `grid-cols-4`?
- [ ] A kártyák szövege nem lóg ki kis képernyőn?

```tsx
// Stat kártya grid
<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  <StatCard title="Termékek" value="18" />
  <StatCard title="Rendelések" value="3" />
  <StatCard title="Felhasználók" value="1" />
  <StatCard title="Bevétel" value="1 250 000 Ft" />
</div>
```

---

## ⚙️ Fázis 10: Admin — Termékkezelés (`/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`)

### Iteráció 10.1 — `app/admin/products/page.tsx` és `components/admin/ProductsDataTable.tsx`
**Fájlok:** `app/admin/products/page.tsx`, `components/admin/ProductsDataTable.tsx`

**Audit:**
- [ ] A táblázat mobilon `overflow-x-auto` wrapperben van-e?
- [ ] Mobilon érdemes-e kártyás nézetre váltani (mint 8.2-ben)?
- [ ] Az "Új termék" gomb mobilon is elérhető (`min-h-[44px]`)?
- [ ] A soronkénti akciók (szerkesztés/törlés) `DropdownMenu`-ben vannak-e (nem inline ikonok)?

**Elvárt oldal fejléc:**
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
  <h1 className="text-2xl font-display font-bold">Termékek</h1>
  <Button asChild className="min-h-[44px] w-full sm:w-auto">
    <Link href="/admin/products/new">+ Új termék</Link>
  </Button>
</div>
```

---

### Iteráció 10.2 — `components/admin/ProductForm.tsx`
**Fájlok:** `components/admin/ProductForm.tsx`, `components/admin/ImageUploader.tsx`, `app/admin/products/new/page.tsx`, `app/admin/products/[id]/edit/page.tsx`

**Audit:**
- [ ] A form kétoszlopos szerkezete (`name` + `price`) mobilon egymás alá kerül?
- [ ] Az `ImageUploader` drag-and-drop zóna mobilon kellően nagy (`min-h-[120px]`)?
- [ ] A `Switch` elemek (aktív/kiemelt) érintési területe megfelelő?
- [ ] A "Mentés" és "Mégse" gombok mobilon egymás alá, desktopon egy sorba kerülnek?

**Elvárt form rács:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <FormField name="name" className="sm:col-span-2" />
  <FormField name="price" />
  <FormField name="stock_quantity" />
  <FormField name="category_id" />
  <FormField name="material" />
  <FormField name="description" className="sm:col-span-2" />
</div>

{/* Switch sor */}
<div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
  <SwitchField name="is_active" label="Aktív" />
  <SwitchField name="is_featured" label="Kiemelt" />
</div>

{/* Gombok */}
<div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
  <Button variant="outline" className="min-h-[44px]">Mégse</Button>
  <Button type="submit" className="min-h-[44px]">Mentés</Button>
</div>
```

---

## ⚙️ Fázis 11: Admin — Kategóriák és Rendelések (`/admin/categories`, `/admin/orders`)

### Iteráció 11.1 — `app/admin/categories/page.tsx`
**Fájlok:** `app/admin/categories/page.tsx`

**Audit:**
- [ ] Az "Új kategória" `Dialog` mobilon teljes szélességű-e (`w-full sm:max-w-lg`)?
- [ ] A táblázat `overflow-x-auto` wrapperben?
- [ ] A törlés megerősítő `Dialog` mobilon nem nyúlik-e ki?

---

### Iteráció 11.2 — `app/admin/orders/page.tsx` és `components/admin/OrdersDataTable.tsx`
**Fájlok:** `app/admin/orders/page.tsx`, `components/admin/OrdersDataTable.tsx`

**Audit:**
- [ ] A státuszváltó `Select` mobilon is kényelmesen elérhető (kellő magasság)?
- [ ] A hosszú szállítási sor (`shipping_name`, `shipping_city`) nem töri-e ki a layout-ot?  
  *(`truncate` / `line-clamp-1` ajánlott)*
- [ ] Mobilon kártyás nézet aktiválódik-e a táblázat helyett?

---

## ✅ Fázis 12: Záró Egységesítés — Container és Spacing Konzisztencia

### Iteráció 12.1 — Container és padding audit (minden oldal)
**Fájlok:** Minden `app/**/page.tsx`

Az agent végigmegy az **összes oldal** legkülső `<div>` elemén, és biztosítja, hogy:

```tsx
// EGYSÉGES container minden oldalon
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
```

- [ ] Nincs-e oldal, ahol `px-0` van mobilon (vágott tartalom)?
- [ ] Nincs-e oldal, ahol az `xl` szélességen elszalad a tartalom (`max-w-7xl mx-auto` ellenőrzés)?
- [ ] A `py-8 sm:py-12` ütemezés konzisztens-e minden oldal főtartalmán?

---

### Iteráció 12.2 — Touch target és interakciók globális audit
**Fájlok:** Minden interaktív komponens

Az agent keres rá a következő mintákra az **összes** `components/` fájlban:

```bash
# Keresési parancs amit az agent futtat:
grep -r "size=\"icon\"" components/ --include="*.tsx"
grep -r "<button" components/ --include="*.tsx"
grep -r "onClick" components/ --include="*.tsx" | grep -v "min-h"
```

Minden talált interaktív elemnél ellenőrzi, hogy `min-h-[44px]` és `min-w-[44px]` teljesül-e.

---

### Iteráció 12.3 — Vízszintes scroll audit (minden oldal)
**Fájlok:** `app/globals.css` + minden oldal

- [ ] A `body` kap `overflow-x: hidden` stílust?
- [ ] Minden táblázat `overflow-x-auto` wrapperben van?
- [ ] Nincs-e fix szélességű elem (`w-[500px]`) `overflow: hidden` nélkül?
- [ ] A `grid` elemek `min-w-0` osztályt kapnak-e ahol szükséges (flex overflow bug)?

```css
/* globals.css kiegészítés */
body { overflow-x: hidden; }

/* Flex children overflow fix */
.flex > * { min-width: 0; }
```

---

## 📊 Iterációk Összesítője

| Fázis | Iteráció | Érintett oldalak | Fő feladat |
|---|---|---|---|
| 1. Globális | 1.1 | Minden | `globals.css`, viewport meta, box-sizing |
| 1. Globális | 1.2 | Minden | Header – hamburger, nav, touch targets |
| 1. Globális | 1.3 | Minden | Footer – 1→2→3 oszlop, linkek |
| 1. Globális | 1.4 | Minden | CartDrawer – Sheet szélesség, CartItemRow |
| 2. Főoldal | 2.1 | `/` | Hero – flex-col→row CTA, clamp() |
| 2. Főoldal | 2.2 | `/` | CategoryGrid (2→3→6), FeaturedProducts (1→2→4) |
| 3. Terméklista | 3.1 | `/products` | ProductCard – aspect-ratio, line-clamp, touch |
| 3. Terméklista | 3.2 | `/products` | Oldal layout – mobil Sheet szűrő, SortSelector |
| 4. Termékoldal | 4.1 | `/products/[slug]` | ImageGallery – scroll thumbnails mobilon |
| 4. Termékoldal | 4.2 | `/products/[slug]` | Oldal 1→2 oszlop, ProductInfo, RelatedProducts |
| 5. Kosár | 5.1 | `/cart` | CartItemRow – responsive sor, összesítő |
| 6. Checkout | 6.1 | `/checkout` | Form grid, order swap mobilon |
| 6. Checkout | 6.2 | `/order-confirmation` | Centrált kártya, gomb |
| 7. Auth | 7.1 | `/login`, `/register` | Kártya layout, text-base input, touch |
| 8. Fiók | 8.1 | `/account` | Tabs scroll, ProfileForm grid |
| 8. Fiók | 8.2 | `/account/orders`, `/account/orders/[id]` | Dual view tábla/kártya |
| 9. Admin layout | 9.1 | Minden `/admin/*` | Sidebar Sheet mobilon |
| 9. Admin layout | 9.2 | `/admin` | Stat kártyák 2→4 oszlop |
| 10. Admin termékek | 10.1 | `/admin/products` | DataTable overflow, fejléc |
| 10. Admin termékek | 10.2 | `/admin/products/new`, `/edit` | Form grid, gombok, ImageUploader |
| 11. Admin egyéb | 11.1 | `/admin/categories` | Dialog méret, táblázat |
| 11. Admin egyéb | 11.2 | `/admin/orders` | Státusz Select, truncate |
| 12. Záró | 12.1 | Minden oldal | Container px/py egységesítés |
| 12. Záró | 12.2 | Minden komponens | Touch target globális audit |
| 12. Záró | 12.3 | Minden oldal | Vízszintes scroll elimináció |
