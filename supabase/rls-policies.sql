-- ============================================================
-- FurnSpace – Row Level Security Policies
-- Run this in the Supabase SQL Editor after schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- Helper: admin check expression (reused across policies)
-- EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
-- ------------------------------------------------------------

-- ============================================================
-- categories
-- Public SELECT; admin-only write operations
-- ============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_select"
  ON public.categories
  FOR SELECT
  USING (TRUE);

CREATE POLICY "categories_admin_insert"
  ON public.categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "categories_admin_update"
  ON public.categories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "categories_admin_delete"
  ON public.categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- products
-- Anon/public SELECT for active products only; admin ALL
-- ============================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_select_active"
  ON public.products
  FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "products_admin_all"
  ON public.products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- users
-- Users can read and update their own row; admin ALL
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_select"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_own_update"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "users_admin_all"
  ON public.users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- orders
-- Users can SELECT and INSERT their own orders; admin ALL
-- ============================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_own_select"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "orders_own_insert"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_admin_all"
  ON public.orders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- order_items
-- Users can SELECT and INSERT items belonging to their orders;
-- admin ALL
-- ============================================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_own_select"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE public.orders.id = order_id
        AND public.orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_own_insert"
  ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE public.orders.id = order_id
        AND public.orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_admin_all"
  ON public.order_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
