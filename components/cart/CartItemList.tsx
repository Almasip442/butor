"use client"

import { useCartStore } from "@/lib/store/cart-store"
import { CartItemRow } from "./CartItemRow"
import { EmptyState } from "@/components/ui/EmptyState"
import { ShoppingBag } from "lucide-react"

export function CartItemList() {
  const items = useCartStore((s) => s.items)

  if (items.length === 0) {
    return (
      <div className="py-24 bg-muted/10 rounded-2xl border border-border/50 shadow-sm flex items-center justify-center">
        <EmptyState 
          title="A kosár üres"
          description="Helyezz termékeket a kosárba a rendelés leadásához!"
          icon={ShoppingBag}
          action={{
            label: "Kínálatunk felfedezése",
            href: "/products"
          }}
          className="border-0 bg-transparent shadow-none"
        />
      </div>
    )
  }

  return (
    <div className="bg-background rounded-2xl border border-border/50 shadow-sm overflow-hidden divide-y divide-border/50">
      {items.map((item) => (
        <div key={item.product.id} className="p-4 sm:p-6 hover:bg-muted/10 transition-colors">
          <CartItemRow item={item} />
        </div>
      ))}
    </div>
  )
}
