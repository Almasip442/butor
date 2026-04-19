// ============================================================
// lib/types.ts — FurnSpace TypeScript interfészek
// Forrás: DATAMODEL.md
// ============================================================

// ------------------------------------------------------------
// Kategória
// ------------------------------------------------------------
export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image_url: string | null
  /** Szülő kategória azonosítója (opcionális alkategóriáknál) */
  parent_id?: string | null
}

// ------------------------------------------------------------
// Termék
// ------------------------------------------------------------
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock_quantity: number
  /** Termékképek URL tömbje — első elem a főkép */
  images: string[] | null
  category_id: string
  material?: string | null
  color?: string | null
  dimensions?: unknown | null
  weight_kg?: number | null
  is_featured: boolean
  is_active: boolean
}

// ------------------------------------------------------------
// Rendelés tétel
// ------------------------------------------------------------
export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  unit_price: number
  quantity: number
}

// ------------------------------------------------------------
// Rendelés
// ------------------------------------------------------------
export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"

export interface Order {
  id: string
  status: OrderStatus
  total_amount: number
  created_at: string
  items: OrderItem[]
  /** Szállítási cím snapshot */
  shipping_address?: ShippingAddress
}

// ------------------------------------------------------------
// Rendelés tételekkel — Supabase join lekérdezéshez
// ------------------------------------------------------------
export interface OrderWithItems {
  id: string
  user_id: string
  status: OrderStatus
  total_amount: number
  shipping_name: string
  shipping_address: string
  shipping_city: string
  shipping_zip: string
  shipping_country: string
  notes: string | null
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

// ------------------------------------------------------------
// Szállítási cím
// ------------------------------------------------------------
export interface ShippingAddress {
  full_name: string
  email: string
  phone?: string
  zip_code: string
  city: string
  address: string
  country: string
  note?: string
}

// ------------------------------------------------------------
// Felhasználó
// ------------------------------------------------------------
export type UserRole = "customer" | "admin"

export interface User {
  id: string
  full_name: string
  email: string
  phone?: string
  shipping_address?: ShippingAddress
  role: UserRole
}

// ------------------------------------------------------------
// Kosár tétel — Zustand store-hoz (Iteráció 3.2)
// ------------------------------------------------------------
export interface CartItem {
  product: Product
  quantity: number
}
