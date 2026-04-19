-- ============================================================
-- FurnSpace – Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ------------------------------------------------------------
-- 1. categories
-- No foreign-key dependencies.
-- ------------------------------------------------------------
CREATE TABLE public.categories (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100)  NOT NULL UNIQUE,
  slug        VARCHAR(120)  NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  parent_id   UUID          REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. users
-- References auth.users (managed by Supabase Auth).
-- A trigger (triggers.sql) populates this table automatically.
-- ------------------------------------------------------------
CREATE TABLE public.users (
  id               UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            VARCHAR(255)  NOT NULL UNIQUE,
  full_name        VARCHAR(100)  NOT NULL,
  phone            VARCHAR(20),
  shipping_address TEXT,
  role             VARCHAR(20)   NOT NULL DEFAULT 'customer'
                                 CHECK (role IN ('customer', 'admin')),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 3. products
-- References categories.
-- ------------------------------------------------------------
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

CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_slug     ON public.products(slug);
CREATE INDEX idx_products_active   ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(is_featured);

-- ------------------------------------------------------------
-- 4. orders
-- References users.
-- ------------------------------------------------------------
CREATE TABLE public.orders (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID           NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  status           VARCHAR(30)    NOT NULL DEFAULT 'pending'
                                  CHECK (status IN (
                                    'pending', 'confirmed', 'processing',
                                    'shipped', 'delivered', 'cancelled'
                                  )),
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

-- ------------------------------------------------------------
-- 5. order_items
-- References orders and products.
-- ------------------------------------------------------------
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
