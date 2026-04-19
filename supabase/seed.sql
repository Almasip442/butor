-- ============================================================
-- FurnSpace – Seed Data
-- Run this in the Supabase SQL Editor after schema.sql
-- 6 categories + 18 products from lib/mock-data.ts
-- ============================================================

-- ------------------------------------------------------------
-- Categories
-- Hardcoded UUIDs so product INSERTs can reference them directly.
-- ------------------------------------------------------------
INSERT INTO public.categories (id, name, slug, description, image_url) VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'Kanapék',
    'kanapek',
    'Kényelmes, modern és klasszikus kanapék a nappaliba.',
    '/images/categories/kanapek.webp'
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'Asztalok',
    'asztalok',
    'Étkezőasztalok, dohányzóasztalok és íróasztalok széles választéka.',
    '/images/categories/asztalok.webp'
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'Székek',
    'szekek',
    'Kényelmes étkezőszékek, fotelek és bárszékek.',
    '/images/categories/szekek.webp'
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'Szekrények',
    'szekrenyek',
    'Praktikus tárolómegoldások: ruhásszekrények, komódok és vitrinek.',
    '/images/categories/szekrenyek.webp'
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    'Ágyak',
    'agyak',
    'Pihentető alvás minőségi ágykeretekkel és matracokkal.',
    '/images/categories/agyak.webp'
  ),
  (
    'a1000000-0000-0000-0000-000000000006',
    'Polcok',
    'polcok',
    'Dekoratív és funkcionális könyvespolcok, fali polcok.',
    '/images/categories/polcok.webp'
  );

-- ------------------------------------------------------------
-- Products
-- 3 products per category (18 total)
-- images is TEXT[] — uses PostgreSQL ARRAY[...] syntax
-- dimensions and weight_kg are NULL (not provided in mock data)
-- ------------------------------------------------------------

-- Kanapék (cat UUID: a1000000-0000-0000-0000-000000000001)
INSERT INTO public.products
  (category_id, name, slug, description, price, stock_quantity, images, material, color, is_active, is_featured)
VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'Nordic Soft Kanapé',
    'nordic-soft-kanape',
    'Modern, skandináv stílusú 3 személyes kanapé, prémium szövettel és tömör tölgyfa lábakkal.',
    245000.00,
    12,
    ARRAY[
      '/images/products/nordic-soft-kanape-1.webp',
      '/images/products/nordic-soft-kanape-2.webp',
      '/images/products/nordic-soft-kanape-3.webp'
    ],
    'Szövet, Tölgyfa',
    'Világosszürke',
    TRUE,
    TRUE
  ),
  (
    'a1000000-0000-0000-0000-000000000001',
    'Urban Velvet Sarokkanapé',
    'urban-velvet-sarokkanape',
    'Elegáns bársony borítású sarokkanapé, amely bármely nappali központi eleme lehet.',
    360000.00,
    5,
    ARRAY[
      '/images/products/urban-velvet-sarokkanape-1.webp',
      '/images/products/urban-velvet-sarokkanape-2.webp',
      '/images/products/urban-velvet-sarokkanape-3.webp'
    ],
    'Bársony',
    'Mélykék',
    TRUE,
    FALSE
  ),
  (
    'a1000000-0000-0000-0000-000000000001',
    'Cloud modularis kanapé',
    'cloud-modularis-kanape',
    'Végtelen variációs lehetőség a Cloud moduláris rendszerrel. Extra puha kényelem.',
    480000.00,
    8,
    ARRAY[
      '/images/products/cloud-modularis-kanape-1.webp',
      '/images/products/cloud-modularis-kanape-2.webp',
      '/images/products/cloud-modularis-kanape-3.webp'
    ],
    'Pamutvászon',
    'Törtfehér',
    TRUE,
    FALSE
  );

-- Asztalok (cat UUID: a1000000-0000-0000-0000-000000000002)
INSERT INTO public.products
  (category_id, name, slug, description, price, stock_quantity, images, material, color, is_active, is_featured)
VALUES
  (
    'a1000000-0000-0000-0000-000000000002',
    'Solid Oak Étkezőasztal',
    'solid-oak-etkezoasztal',
    'Tömör tölgyfából készült, rusztikus de minimalista étkezőasztal 6-8 személyre.',
    185000.00,
    15,
    ARRAY[
      '/images/products/solid-oak-etkezoasztal-1.webp',
      '/images/products/solid-oak-etkezoasztal-2.webp',
      '/images/products/solid-oak-etkezoasztal-3.webp'
    ],
    'Tömör tölgy',
    'Natúr tölgy',
    TRUE,
    TRUE
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'Glass Vision Dohányzóasztal',
    'glass-vision-dohanyzoasztal',
    'Edzett üvegfelület és fém váz kombinációja a légies megjelenésért.',
    55000.00,
    25,
    ARRAY[
      '/images/products/glass-vision-dohanyzoasztal-1.webp',
      '/images/products/glass-vision-dohanyzoasztal-2.webp',
      '/images/products/glass-vision-dohanyzoasztal-3.webp'
    ],
    'Üveg, Fém',
    'Fekete / Átlátszó',
    TRUE,
    FALSE
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'WorkSpace Íróasztal',
    'workspace-iroasztal',
    'Ergonómikus kialakítású íróasztal beépített kábelkezelővel és fiókokkal.',
    120000.00,
    10,
    ARRAY[
      '/images/products/workspace-iroasztal-1.webp',
      '/images/products/workspace-iroasztal-2.webp',
      '/images/products/workspace-iroasztal-3.webp'
    ],
    'MDF, Fém',
    'Antracit',
    TRUE,
    FALSE
  );

-- Székek (cat UUID: a1000000-0000-0000-0000-000000000003)
INSERT INTO public.products
  (category_id, name, slug, description, price, stock_quantity, images, material, color, is_active, is_featured)
VALUES
  (
    'a1000000-0000-0000-0000-000000000003',
    'Comfort Diner Szék',
    'comfort-diner-szek',
    'Párnázott étkezőszék ergonomikus háttámlával, bükkfa lábakkal.',
    45000.00,
    40,
    ARRAY[
      '/images/products/comfort-diner-szek-1.webp',
      '/images/products/comfort-diner-szek-2.webp',
      '/images/products/comfort-diner-szek-3.webp'
    ],
    'Szövet, Bükkfa',
    'Bézs',
    TRUE,
    TRUE
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'Classic Leather Fotel',
    'classic-leather-fotel',
    'Valódi bőr fotel klasszikus designnal, amely az iroda vagy a könyvtárszoba dísze lehet.',
    210000.00,
    4,
    ARRAY[
      '/images/products/classic-leather-fotel-1.webp',
      '/images/products/classic-leather-fotel-2.webp',
      '/images/products/classic-leather-fotel-3.webp'
    ],
    'Bőr, Fa',
    'Barna',
    TRUE,
    FALSE
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'Minimalist Bar Szék',
    'minimalist-bar-szek',
    'Modern bárszék, állítható magassággal és kényelmes lábtartóval.',
    52000.00,
    18,
    ARRAY[
      '/images/products/minimalist-bar-szek-1.webp',
      '/images/products/minimalist-bar-szek-2.webp',
      '/images/products/minimalist-bar-szek-3.webp'
    ],
    'Fém, PU bőr',
    'Fekete',
    TRUE,
    FALSE
  );

-- Szekrények (cat UUID: a1000000-0000-0000-0000-000000000004)
INSERT INTO public.products
  (category_id, name, slug, description, price, stock_quantity, images, material, color, is_active, is_featured)
VALUES
  (
    'a1000000-0000-0000-0000-000000000004',
    'Grande Gardrób',
    'grande-gardrob',
    'Hatalmas ruhásszekrény tolóajtókkal, tükörrel és belső világítással.',
    320000.00,
    6,
    ARRAY[
      '/images/products/grande-gardrob-1.webp',
      '/images/products/grande-gardrob-2.webp',
      '/images/products/grande-gardrob-3.webp'
    ],
    'Laminált bútorlap',
    'Fehér tölgy',
    TRUE,
    TRUE
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'Retro Comod',
    'retro-comod',
    'A 60-as évek stílusát idéző komód 4 fiókkal és 2 ajtóval.',
    95000.00,
    14,
    ARRAY[
      '/images/products/retro-comod-1.webp',
      '/images/products/retro-comod-2.webp',
      '/images/products/retro-comod-3.webp'
    ],
    'Diófa furnér',
    'Dió',
    TRUE,
    FALSE
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'Glass Vitrin',
    'glass-vitrin',
    'Elegáns üvegajtós szekrény kedvenc tárgyai bemutatására.',
    145000.00,
    9,
    ARRAY[
      '/images/products/glass-vitrin-1.webp',
      '/images/products/glass-vitrin-2.webp',
      '/images/products/glass-vitrin-3.webp'
    ],
    'Üveg, Fa',
    'Sötétszürke',
    TRUE,
    FALSE
  );

-- Ágyak (cat UUID: a1000000-0000-0000-0000-000000000005)
INSERT INTO public.products
  (category_id, name, slug, description, price, stock_quantity, images, material, color, is_active, is_featured)
VALUES
  (
    'a1000000-0000-0000-0000-000000000005',
    'Sweet Dreams Ágykeret',
    'sweet-dreams-agykeret',
    'Szövettel kárpitozott franciaágy keret beépített tárolóval.',
    245000.00,
    7,
    ARRAY[
      '/images/products/sweet-dreams-agykeret-1.webp',
      '/images/products/sweet-dreams-agykeret-2.webp',
      '/images/products/sweet-dreams-agykeret-3.webp'
    ],
    'Szövet, MDF',
    'Szürke',
    TRUE,
    FALSE
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    'King Solid Wood Ágy',
    'king-solid-wood-agy',
    'Masszív fenyőfa ágykeret, amely generációkon át kiszolgálja a családot.',
    195000.00,
    5,
    ARRAY[
      '/images/products/king-solid-wood-agy-1.webp',
      '/images/products/king-solid-wood-agy-2.webp',
      '/images/products/king-solid-wood-agy-3.webp'
    ],
    'Tömör fenyő',
    'Natúr',
    TRUE,
    FALSE
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    'Modern Platform Bed',
    'modern-platform-bed',
    'Fejtámla nélküli, minimalista platform ágy, modern hálószobákba.',
    155000.00,
    11,
    ARRAY[
      '/images/products/modern-platform-bed-1.webp',
      '/images/products/modern-platform-bed-2.webp',
      '/images/products/modern-platform-bed-3.webp'
    ],
    'Laminált fa',
    'Világos kőris',
    TRUE,
    FALSE
  );

-- Polcok (cat UUID: a1000000-0000-0000-0000-000000000006)
INSERT INTO public.products
  (category_id, name, slug, description, price, stock_quantity, images, material, color, is_active, is_featured)
VALUES
  (
    'a1000000-0000-0000-0000-000000000006',
    'Library Wall Polcrendszer',
    'library-wall-polcrendszer',
    'Moduláris falra szerelhető polcrendszer könyvgyűjtőknek.',
    85000.00,
    30,
    ARRAY[
      '/images/products/library-wall-polcrendszer-1.webp',
      '/images/products/library-wall-polcrendszer-2.webp',
      '/images/products/library-wall-polcrendszer-3.webp'
    ],
    'Fém, Fa',
    'Fekete / Tölgy',
    TRUE,
    FALSE
  ),
  (
    'a1000000-0000-0000-0000-000000000006',
    'Minimal Floating Shelf',
    'minimal-floating-shelf',
    'Láthatatlan rögzítésű fali polc, több méretben és színben elérhető.',
    18000.00,
    100,
    ARRAY[
      '/images/products/minimal-floating-shelf-1.webp',
      '/images/products/minimal-floating-shelf-2.webp',
      '/images/products/minimal-floating-shelf-3.webp'
    ],
    'MDF',
    'Fehér',
    TRUE,
    FALSE
  ),
  (
    'a1000000-0000-0000-0000-000000000006',
    'ZigZag Bookshelf',
    'zigzag-bookshelf',
    'Különleges, geometrikus formájú könyvespolc modern terekbe.',
    64000.00,
    15,
    ARRAY[
      '/images/products/zigzag-bookshelf-1.webp',
      '/images/products/zigzag-bookshelf-2.webp',
      '/images/products/zigzag-bookshelf-3.webp'
    ],
    'Laminált bútorlap',
    'Fekete',
    TRUE,
    FALSE
  );
