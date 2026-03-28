"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { CartItem } from "@/lib/types"
import { useCartStore } from "@/lib/store/cart-store"
import { QuantitySelector } from "@/components/products/QuantitySelector"
import { Button } from "@/components/ui/button"
import { useCartDrawerStore } from "@/lib/store/cart-drawer-store"

interface CartItemRowProps {
  item: CartItem
  isDrawer?: boolean
}

export function CartItemRow({ item, isDrawer = false }: CartItemRowProps) {
  const { product, quantity } = item
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const closeDrawer = useCartDrawerStore((s) => s.close)

  const formattedUnitPrice = new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0
  }).format(product.price)

  const formattedTotalPrice = new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0
  }).format(product.price * quantity)

  return (
    <div className={`flex gap-3 sm:gap-4 py-4 ${!isDrawer && 'border-b border-border/50 last:border-0'}`}>
      {/* Kép */}
      <Link href={`/products/${product.slug}`} onClick={closeDrawer} className="shrink-0 group touch-target">
        <div className={`relative flex-shrink-0 overflow-hidden rounded-md border border-border bg-muted ${
          isDrawer ? "h-20 w-20" : "w-16 h-16 sm:w-24 sm:h-24"
        }`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 64px, 96px"
          />
        </div>
      </Link>

      <div className={`flex flex-1 gap-2 min-w-0 ${
        isDrawer ? "flex-col justify-between" : "flex-col sm:flex-row sm:items-center sm:justify-between"
      }`}>
        <div className="min-w-0 pr-2">
          <Link 
            href={`/products/${product.slug}`} 
            onClick={closeDrawer} 
            className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-2 pr-2"
          >
            {product.name}
          </Link>
          {product.color && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {product.color}
              {product.material && ` - ${product.material}`}
            </p>
          )}
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 tabular-nums">
            {formattedUnitPrice} / db
          </p>
        </div>

        {/* Mennyiség és Ár */}
        <div className={`flex items-center gap-3 ${
          isDrawer ? "justify-between mt-2" : "justify-between sm:justify-end sm:gap-6 mt-3 sm:mt-0"
        }`}>
          <div className={`${isDrawer ? "transform scale-[0.85] origin-left" : ""}`}>
            <QuantitySelector
              value={quantity}
              onChange={(val) => updateQuantity(product.id, val)}
              max={product.stock_quantity}
              className={`${!isDrawer && "min-h-[44px]"}`}
            />
          </div>
          <span className={`font-semibold tabular-nums text-foreground whitespace-nowrap ${
            isDrawer ? "text-sm" : "text-sm sm:text-base w-20 sm:w-28 text-right"
          }`}>
            {formattedTotalPrice}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeItem(product.id)}
        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 touch-target transition-colors shrink-0 -m-1"
        aria-label={`${product.name} törlése a kosárból`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
