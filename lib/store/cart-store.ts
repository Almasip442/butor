"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { CartItem, Product } from "@/lib/types"

// ============================================================
// Típusok
// ============================================================

interface CartState {
  /** Kosár tételek listája */
  items: CartItem[]

  // --- Akciók ---

  /**
   * Termék hozzáadása a kosárhoz.
   * Ha a termék már benne van, a mennyiség növekszik.
   */
  addItem: (product: Product, quantity?: number) => void

  /**
   * Termék eltávolítása a kosárból termék-ID alapján.
   */
  removeItem: (productId: string) => void

  /**
   * Adott termék mennyiségének beállítása.
   * Ha qty <= 0, a tétel törlődik.
   */
  updateQuantity: (productId: string, quantity: number) => void

  /**
   * Kosár teljes kiürítése.
   */
  clearCart: () => void

  // --- Számított értékek (computed getters) ---

  /**
   * Összes db szám a kosárban (minden tétel quantity összege).
   */
  totalItems: () => number

  /**
   * Nettó végösszeg forintban (ÁFA nélkül).
   */
  totalPrice: () => number
}

// ============================================================
// Store
// ============================================================

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // ----------------------------------------------------------
      addItem: (product: Product, quantity: number = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id
          )

          if (existing) {
            // Már benne van → mennyiség növelése (max: stock_quantity)
            const newQty = Math.min(
              existing.quantity + quantity,
              product.stock_quantity
            )
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: newQty }
                  : item
              ),
            }
          }

          // Új tétel hozzáadása
          const safeQty = Math.min(quantity, product.stock_quantity)
          return {
            items: [...state.items, { product, quantity: safeQty }],
          }
        })
      },

      // ----------------------------------------------------------
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      // ----------------------------------------------------------
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id !== productId) return item
            const safeQty = Math.min(quantity, item.product.stock_quantity)
            return { ...item, quantity: safeQty }
          }),
        }))
      },

      // ----------------------------------------------------------
      clearCart: () => {
        set({ items: [] })
      },

      // ----------------------------------------------------------
      // Computed — getterként implementálva (nem reactive selector,
      // ezért useStore((s) => s.totalItems()) formában kell hívni)
      // ----------------------------------------------------------
      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      totalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        )
      },
    }),
    {
      name: "furnspace-cart",          // localStorage kulcs
      storage: createJSONStorage(() => localStorage),
      // Csak az items tömböt perzisztáljuk (a getter függvényeket nem)
      partialize: (state) => ({ items: state.items }),
    }
  )
)

// ============================================================
// Segéd hook-ok — kényelmes használathoz
// ============================================================

/** Kosár tételek tömbje */
export const useCartItems = () => useCartStore((s) => s.items)

/** Összesített darabszám (badge-hez) */
export const useCartTotalItems = () =>
  useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))

/** Nettó végösszeg forintban */
export const useCartTotalPrice = () =>
  useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  )

/** ÁFA összege (27%) */
export const useCartVat = () =>
  useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0) * 0.27
  )

/** Bruttó végösszeg (nettó + 27% ÁFA) */
export const useCartGrossTotal = () =>
  useCartStore((s) => {
    const net = s.items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    )
    return net * 1.27
  })
