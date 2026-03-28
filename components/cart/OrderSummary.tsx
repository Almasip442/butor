"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useCartStore, useCartGrossTotal, useCartTotalPrice, useCartVat } from "@/lib/store/cart-store"

export function OrderSummary() {
  const items = useCartStore((s) => s.items)
  const netTotal = useCartTotalPrice()
  const vat = useCartVat()
  const grossTotal = useCartGrossTotal()

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price)

  if (items.length === 0) return null

  return (
    <div className="bg-muted/30 p-6 rounded-2xl border border-border/50 shadow-sm sticky bottom-0 lg:top-28">
      <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-6">
        Rendelés összesítése
      </h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">Részösszeg</span>
          <span className="font-medium whitespace-nowrap">{formatPrice(netTotal)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">ÁFA (27%)</span>
          <span className="font-medium whitespace-nowrap">{formatPrice(vat)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">Szállítás</span>
          <span className="font-medium text-emerald-600">Ingyenes</span>
        </div>
        
        <Separator />
        
        <div className="flex justify-between items-center text-lg pt-2">
          <span className="font-bold text-foreground font-display text-xl">Végösszeg</span>
          <span className="font-bold text-primary tabular-nums text-2xl tracking-tight">{formatPrice(grossTotal)}</span>
        </div>
      </div>
      
      <Button asChild className="w-full h-14 text-sm sm:text-base uppercase tracking-wide font-bold touch-target shadow-lg shadow-primary/20 hover:shadow-xl transition-shadow">
        <Link href="/checkout">
          Tovább a pénztárhoz
        </Link>
      </Button>
      
      <p className="text-center text-[10px] uppercase text-muted-foreground tracking-widest mt-4">
        Biztonságos fizetés & Ingyenes visszaküldés
      </p>
    </div>
  )
}
