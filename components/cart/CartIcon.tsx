"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCartTotalItems } from "@/lib/store/cart-store"
import { useCartDrawerStore } from "@/lib/store/cart-drawer-store"

interface CartIconProps {
  className?: string
}

export function CartIcon({ className }: CartIconProps) {
  const totalItems = useCartTotalItems()
  const { open } = useCartDrawerStore()

  return (
    <button
      onClick={open}
      aria-label={`Kosár megnyitása${totalItems > 0 ? ` – ${totalItems} tétel` : ""}`}
      className={`touch-target relative inline-flex items-center justify-center rounded-md text-foreground hover:text-primary transition-colors ${className ?? ""}`}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {totalItems > 0 && (
        <Badge
          className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center px-1 text-[10px] leading-none font-bold bg-primary text-primary-foreground rounded-full border-2 border-background"
          aria-hidden="true"
        >
          {totalItems > 99 ? "99+" : totalItems}
        </Badge>
      )}
    </button>
  )
}
