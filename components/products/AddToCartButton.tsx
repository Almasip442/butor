"use client"

import { useState } from "react"
import { ShoppingCart, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart-store"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AddToCartButtonProps {
  /** A kosárba helyezendő termék */
  product: Product
  /** Kosárba helyezendő mennyiség (alapértelmezett: 1) */
  quantity?: number
  /** Gomb megjelenési változat */
  variant?: "default" | "outline" | "secondary"
  /** Teljes szélességű gomb */
  fullWidth?: boolean
  /** Kiegészítő CSS osztályok */
  className?: string
}

/**
 * 🟨 Kliens — Kosárba helyező gomb.
 * useCartStore-hoz csatlakozik, sonner toast visszajelzéssel.
 *
 * @example
 * <AddToCartButton product={product} quantity={qty} />
 */
export function AddToCartButton({
  product,
  quantity = 1,
  variant = "default",
  fullWidth = false,
  className,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const outOfStock = product.stock_quantity === 0

  const handleAddToCart = async () => {
    if (outOfStock || isAdding) return

    setIsAdding(true)

    // Rövid optimista visszajelzés delay
    await new Promise((r) => setTimeout(r, 300))

    addItem(product, quantity)

    setIsAdding(false)
    setJustAdded(true)

    // Ár formázás
    const formattedPrice = new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency: "HUF",
      maximumFractionDigits: 0,
    }).format(product.price * quantity)

    // Toast visszajelzés — aria-live-ot a sonner kezeli
    toast.success("Kosárba helyezve!", {
      description: `${product.name} — ${quantity} db · ${formattedPrice}`,
      duration: 3000,
      action: {
        label: "Kosár megtekintése",
        onClick: () => {
          window.location.href = "/cart"
        },
      },
    })

    // "Hozzáadva" ikon 1.5mp után visszaáll
    setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <Button
      type="button"
      variant={outOfStock ? "outline" : variant}
      onClick={handleAddToCart}
      disabled={outOfStock || isAdding}
      aria-label={
        outOfStock
          ? "Termék elfogyott"
          : isAdding
          ? "Kosárba helyezés..."
          : `${product.name} kosárba helyezése`
      }
      aria-live="polite"
      className={cn(
        "touch-target gap-2 transition-all duration-200",
        fullWidth && "w-full",
        justAdded && "bg-green-600 hover:bg-green-700 border-green-600",
        className
      )}
    >
      {/* Ikon állapot szerint */}
      {isAdding ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : justAdded ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <ShoppingCart className="size-4" aria-hidden="true" />
      )}

      {/* Felirat állapot szerint */}
      <span>
        {outOfStock
          ? "Elfogyott"
          : isAdding
          ? "Hozzáadás..."
          : justAdded
          ? "Kosárba helyezve!"
          : "Kosárba"}
      </span>
    </Button>
  )
}
