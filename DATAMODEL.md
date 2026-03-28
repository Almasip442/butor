# DATAMODEL.md — Adatmodell Dokumentáció

> **Projekt neve:** FurnSpace – Modern Bútor Webshop  
> **Adatbázis:** Supabase (PostgreSQL)  
> **Dokumentum verziója:** 1.0  

---

## 1. Áttekintés

Az adatbázis **5 fő entitást** tartalmaz, amelyek a bútor webshop üzleti logikáját lefedik: felhasználók, termékkategóriák, termékek, rendelések és rendeléstételek. Az entitások közötti kapcsolatok PostgreSQL idegen kulcsokkal (FOREIGN KEY) és Supabase Row Level Security (RLS) szabályzatokkal vannak védve.

### Entitások áttekintése

```
users
  │
  └── orders (1:N)
        │
        └── order_items (1:N)
                │
                └── products (N:1)
                       │
                       └── categories (N:1)
```

---

## 2. Entitások

---

### 2.1 `users` – Felhasználók

A Supabase Auth rendszere automatikusan létrehozza az `auth.users` táblát. A `public.users` tábla kiegészítő profiladatokat tárol, és `auth.users`-re hivatkozik.

| Mező | Adattípus | Korlát | Leírás |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY, FK → `auth.users.id` | Egyedi azonosító (Supabase Auth által generált) |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Felhasználó e-mail címe |
| `full_name` | `VARCHAR(100)` | NOT NULL | Teljes név |
| `phone` | `VARCHAR(20)` | NULL | Telefonszám (opcionális) |
| `shipping_address` | `TEXT` | NULL | Alapértelmezett szállítási cím |
| `role` | `VARCHAR(20)` | NOT NULL, DEFAULT `'customer'` | Felhasználói szerep: `'customer'` vagy `'admin'` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Regisztráció időpontja |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Utolsó módosítás időpontja |

**SQL definíció:**
```sql
CREATE TABLE public.users (
  id              UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           VARCHAR(255)  NOT NULL UNIQUE,
  full_name       VARCHAR(100)  NOT NULL,
  phone           VARCHAR(20),
  shipping_address TEXT,
  role            VARCHAR(20)   NOT NULL DEFAULT 'customer'
                                CHECK (role IN ('customer', 'admin')),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

### 2.2 `categories` – Termékkategóriák

A termékeket tematikus csoportokba rendező entitás (pl. kanapék, asztalok, székek).

| Mező | Adattípus | Korlát | Leírás |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Egyedi azonosító |
| `name` | `VARCHAR(100)` | NOT NULL, UNIQUE | Kategória neve (pl. `Kanapék`) |
| `slug` | `VARCHAR(120)` | NOT NULL, UNIQUE | URL-barát azonosító (pl. `kanapek`) |
| `description` | `TEXT` | NULL | Kategória rövid leírása |
| `image_url` | `TEXT` | NULL | Kategória borítóképének URL-je (Supabase Storage) |
| `parent_id` | `UUID` | FK → `categories.id`, NULL | Szülőkategória (alkategória-támogatáshoz) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Létrehozás időpontja |

**SQL definíció:**
```sql
CREATE TABLE public.categories (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100)  NOT NULL UNIQUE,
  slug        VARCHAR(120)  NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  parent_id   UUID          REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

### 2.3 `products` – Termékek

A webshop központi entitása, az összes bútor adatát tárolja.

| Mező | Adattípus | Korlát | Leírás |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Egyedi azonosító |
| `category_id` | `UUID` | NOT NULL, FK → `categories.id` | A termék kategóriájának azonosítója |
| `name` | `VARCHAR(200)` | NOT NULL | Termék neve (pl. `Nordic Tölgyfa Étkezőasztal`) |
| `slug` | `VARCHAR(220)` | NOT NULL, UNIQUE | URL-barát azonosító (pl. `nordic-tolgyfa-etkezoasztal`) |
| `description` | `TEXT` | NOT NULL | Részletes termékleírás |
| `price` | `NUMERIC(10, 2)` | NOT NULL, CHECK `price >= 0` | Termék ára (HUF-ban) |
| `stock_quantity` | `INTEGER` | NOT NULL, DEFAULT `0`, CHECK `>= 0` | Raktáron lévő darabszám |
| `images` | `TEXT[]` | NULL | Képek URL-jeinek tömbje (Supabase Storage) |
| `material` | `VARCHAR(100)` | NULL | Anyag megnevezése (pl. `Tölgyfa`, `Szövet`) |
| `dimensions` | `JSONB` | NULL | Méretek JSON-ban: `{"width": 120, "depth": 80, "height": 75, "unit": "cm"}` |
| `weight_kg` | `NUMERIC(6, 2)` | NULL | Tömeg kilogrammban |
| `color` | `VARCHAR(50)` | NULL | Szín megnevezése |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT `TRUE` | Termék látható-e a boltban |
| `is_featured` | `BOOLEAN` | NOT NULL, DEFAULT `FALSE` | Kiemelt termékkénti megjelenítés (főoldalon) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Létrehozás időpontja |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Utolsó módosítás időpontja |

**SQL definíció:**
```sql
CREATE TABLE public.products (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id    UUID           NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name           VARCHAR(200)   NOT NULL,
  slug           VARCHAR(220)   NOT NULL UNIQUE,
  description    TEXT           NOT NULL,
  price          NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER        NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  images         TEXT[],
  material       VARCHAR(100),
  dimensions     JSONB,
  weight_kg      NUMERIC(6, 2),
  color          VARCHAR(50),
  is_active      BOOLEAN        NOT NULL DEFAULT TRUE,
  is_featured    BOOLEAN        NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- Index a szűrési teljesítmény javítására
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_slug     ON public.products(slug);
CREATE INDEX idx_products_active   ON public.products(is_active);
```

---

### 2.4 `orders` – Rendelések

A felhasználók által leadott rendelések fejléc-szintű adatait tartalmazza.

| Mező | Adattípus | Korlát | Leírás |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Egyedi rendelésazonosító |
| `user_id` | `UUID` | NOT NULL, FK → `users.id` | A rendelő felhasználó azonosítója |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT `'pending'` | Rendelés státusza (ld. alább) |
| `total_amount` | `NUMERIC(12, 2)` | NOT NULL, CHECK `>= 0` | Rendelés végösszege (HUF) |
| `shipping_name` | `VARCHAR(100)` | NOT NULL | Szállítási név |
| `shipping_address` | `TEXT` | NOT NULL | Szállítási cím (teljes szöveg) |
| `shipping_city` | `VARCHAR(100)` | NOT NULL | Szállítási város |
| `shipping_zip` | `VARCHAR(10)` | NOT NULL | Irányítószám |
| `shipping_country` | `VARCHAR(60)` | NOT NULL, DEFAULT `'Magyarország'` | Szállítási ország |
| `notes` | `TEXT` | NULL | Vásárlói megjegyzés a rendeléshez |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Rendelés leadásának időpontja |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Utolsó státuszváltozás időpontja |

**Lehetséges státuszok:**

| Érték | Leírás |
|---|---|
| `pending` | Rendelés beérkezett, feldolgozás alatt |
| `confirmed` | Rendelés megerősítve |
| `processing` | Csomagolás / előkészítés folyamatban |
| `shipped` | Szállítás folyamatban |
| `delivered` | Kézbesítve |
| `cancelled` | Lemondva |

**SQL definíció:**
```sql
CREATE TABLE public.orders (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID           NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  status           VARCHAR(30)    NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending','confirmed','processing',
                                                    'shipped','delivered','cancelled')),
  total_amount     NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  shipping_name    VARCHAR(100)   NOT NULL,
  shipping_address TEXT           NOT NULL,
  shipping_city    VARCHAR(100)   NOT NULL,
  shipping_zip     VARCHAR(10)    NOT NULL,
  shipping_country VARCHAR(60)    NOT NULL DEFAULT 'Magyarország',
  notes            TEXT,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status  ON public.orders(status);
```

---

### 2.5 `order_items` – Rendeléstételek

Egy rendelés egyes sorait tartalmazza: melyik termékből hányat rendeltek és milyen egységáron.

| Mező | Adattípus | Korlát | Leírás |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Egyedi tétel-azonosító |
| `order_id` | `UUID` | NOT NULL, FK → `orders.id` | Melyik rendeléshez tartozik |
| `product_id` | `UUID` | NOT NULL, FK → `products.id` | Melyik terméket tartalmazza |
| `quantity` | `INTEGER` | NOT NULL, CHECK `>= 1` | Rendelt mennyiség |
| `unit_price` | `NUMERIC(10, 2)` | NOT NULL, CHECK `>= 0` | Egységár a rendelés pillanatában (snapshot) |
| `product_name` | `VARCHAR(200)` | NOT NULL | Terméknév snapshot (árazásváltozás ellen) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Tétel létrehozásának időpontja |

> **Megjegyzés:** Az `unit_price` és `product_name` mezők szándékosan duplikálják a termék adatait. Ez az úgynevezett **snapshot pattern**: a rendelés leadásakori árat és nevet rögzíti, így egy későbbi termékár-változás nem módosítja a korábbi rendelések értékét.

**SQL definíció:**
```sql
CREATE TABLE public.order_items (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID           NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id   UUID           NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity     INTEGER        NOT NULL CHECK (quantity >= 1),
  unit_price   NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  product_name VARCHAR(200)   NOT NULL,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order_id   ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
```

---

## 3. Kapcsolatok

### 3.1 `users` → `orders` (1:N)

Egy **felhasználóhoz** több **rendelés** tartozhat, de minden egyes rendelés pontosan egy felhasználóhoz kötött. A kapcsolat `user_id` idegen kulcson keresztül valósul meg az `orders` táblában. Üzleti logika szempontjából ez azt jelenti, hogy egy vásárló vásárlási előzményei egyszerűen lekérdezhetők a felhasználói azonosítója alapján. Az `ON DELETE RESTRICT` záradék megakadályozza, hogy aktív rendelésekkel rendelkező felhasználói fiók törlődjön.

### 3.2 `orders` → `order_items` (1:N)

Egy **rendelés** egy vagy több **rendeléstételt** tartalmaz, de minden tétel kizárólag egyetlen rendeléshez tartozik. A kapcsolat `order_id` idegen kulcson keresztül valósul meg az `order_items` táblában. Az `ON DELETE CASCADE` beállítás révén, ha egy rendelés törlődik (pl. admin általi törlés), az összes hozzá tartozó tétel automatikusan törlődik, megőrizve az adatbázis konzisztenciáját.

### 3.3 `products` → `order_items` (1:N)

Egy **terméket** több különböző rendelésben is meg lehet rendelni, de minden egyes `order_items` rekord pontosan egy termékre mutat. Ez a kapcsolat teszi lehetővé az eladási statisztikák összeállítását (pl. melyik terméket rendelték a legtöbbet). Az `ON DELETE RESTRICT` megakadályozza, hogy egy már rendelt termék véletlenül törlődjön az adatbázisból.

### 3.4 `categories` → `products` (1:N)

Egy **termékkategóriához** tetszőleges számú **termék** tartozhat, de minden terméknek pontosan egy kategóriája van. Például a `Kanapék` kategóriához tartozhat a `Nordic Kétszemélyes Kanapé` és a `Velvet Sarokkanapé` is. Az `ON DELETE RESTRICT` megakadályozza, hogy olyan kategóriát töröljön az adminisztrátor, amelyhez még aktív termékek tartoznak.

### 3.5 `categories` → `categories` (Önhivatkozó, opcionális alkategória)

A `categories` tábla önhivatkozó `parent_id` mezőjével **kétszintű kategóriahierarchia** alakítható ki. Például a `Bútorok` főkategória alá besorolható a `Nappali bútorok`, `Hálószoba bútorok` alkategória. Ha egy kategória `parent_id` értéke `NULL`, az főkategóriaként viselkedik.

---

## 4. ER Diagram (Szöveges Reprezentáció)

```
┌──────────────────┐         ┌─────────────────────┐
│     users        │         │      categories      │
│──────────────────│         │─────────────────────│
│ id (PK)          │         │ id (PK)              │
│ email            │         │ name                 │
│ full_name        │         │ slug                 │
│ phone            │         │ description          │
│ shipping_address │         │ image_url            │
│ role             │         │ parent_id (FK→self)  │
│ created_at       │         │ created_at           │
│ updated_at       │         └──────────┬──────────┘
└────────┬─────────┘                    │ 1
         │ 1                            │
         │                              │ N
         │ N                   ┌────────▼──────────┐
┌────────▼─────────┐           │      products     │
│      orders      │           │───────────────────│
│──────────────────│           │ id (PK)           │
│ id (PK)          │           │ category_id (FK)  │
│ user_id (FK)     │     N     │ name              │
│ status           │◄──────────│ slug              │
│ total_amount     │           │ description       │
│ shipping_name    │           │ price             │
│ shipping_address │           │ stock_quantity    │
│ shipping_city    │           │ images            │
│ shipping_zip     │           │ material          │
│ shipping_country │           │ dimensions (JSONB)│
│ notes            │           │ is_active         │
│ created_at       │           │ is_featured       │
│ updated_at       │           │ created_at        │
└────────┬─────────┘           │ updated_at        │
         │ 1                   └────────┬──────────┘
         │                              │ 1
         │ N                            │
┌────────▼─────────┐                   │ N
│   order_items    │───────────────────►│
│──────────────────│
│ id (PK)          │
│ order_id (FK)    │
│ product_id (FK)  │
│ quantity         │
│ unit_price       │
│ product_name     │
│ created_at       │
└──────────────────┘
```

---

## 5. Row Level Security (RLS) Szabályzatok

A Supabase RLS biztosítja, hogy a felhasználók csak a saját adataikhoz férjenek hozzá.

```sql
-- Felhasználók csak saját profiljukat látják/szerkeszthetik
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Saját profil olvasása"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Saját profil módosítása"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Termékek: mindenki láthatja az aktív termékeket, csak admin módosíthat
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aktív termékek nyilvános olvasása"
  ON public.products FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admin teljes hozzáférés termékekhez"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Rendelések: felhasználó csak sajátját látja
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Saját rendelések olvasása"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Saját rendelés létrehozása"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```
