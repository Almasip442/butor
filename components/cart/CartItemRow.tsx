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
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { product, quantity } = item
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const closeDrawer = useCartDrawerStore((s) => s.close)

  const formattedPrice = new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0
  }).format(product.price)

  return (
    <div className="flex gap-3 py-4">
      {/* Kép */}
      <Link href={`/products/${product.slug}`} onClick={closeDrawer} className="shrink-0 group">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="80px"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
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
        </div>

        {/* Mennyiség és Ár */}
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="transform scale-[0.85] origin-left">
            <QuantitySelector
              value={quantity}
              onChange={(val) => updateQuantity(product.id, val)}
              max={product.stock_quantity}
            />
          </div>
          <span className="font-semibold text-sm tabular-nums text-foreground whitespace-nowrap">
            {formattedPrice}
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
