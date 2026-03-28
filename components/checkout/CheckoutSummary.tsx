"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useCartStore, useCartTotalPrice, useCartVat, useCartGrossTotal } from "@/lib/store/cart-store"
import { Separator } from "@/components/ui/separator"

export function CheckoutSummary() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const netTotal = useCartTotalPrice()
  const vat = useCartVat()
  const grossTotal = useCartGrossTotal()

  // Hydration ellenőrzés és üres kosár védelem
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    if (items.length === 0) {
      router.push("/products") // Ha valahogy üres kosárral jönne be ide, küldjük terméket választani
    }
  }, [items.length, router])

  if (!mounted || items.length === 0) {
    return (
      <div className="p-6 sm:p-8 bg-muted/40 animate-pulse rounded-2xl h-[450px] border border-border/50">
        <div className="h-6 w-1/2 bg-muted mb-6 rounded"></div>
        <div className="space-y-4">
          <div className="flex gap-4"><div className="w-16 h-16 bg-muted rounded"></div><div className="h-4 w-3/4 bg-muted rounded"></div></div>
          <div className="flex gap-4"><div className="w-16 h-16 bg-muted rounded"></div><div className="h-4 w-1/2 bg-muted rounded"></div></div>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price)

  return (
    <div className="bg-muted/30 border border-border/60 rounded-2xl p-6 sm:p-8 lg:sticky lg:top-24 shadow-sm">
      <h2 className="text-lg sm:text-xl font-semibold font-display tracking-tight text-foreground uppercase border-b border-border/40 pb-4 mb-6">
        Rendelés Összesítő
      </h2>
      
      {/* ── Tételek ── */}
      <div className="space-y-5 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border/80">
        {items.map((item) => (
          <div key={item.product.id} className="flex gap-4">
            <div className="relative isolate shrink-0">
               {/* Mennyiség Badge */}
               <div className="absolute -top-2 -right-2 bg-muted-foreground text-background text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold z-20 shadow-sm border border-background">
                {item.quantity}
               </div>
               
               {/* Termék Kép */}
               <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-lg border border-border/50 bg-muted">
                 <Image
                   src={item.product.images[0]}
                   alt={item.product.name}
                   fill
                   className="object-cover"
                   sizes="80px"
                 />
               </div>
            </div>

            {/* Termék infó */}
            <div className="flex flex-1 flex-col justify-center">
              <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-1">
                {item.product.name}
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">
                {[item.product.color, item.product.material].filter(Boolean).join(" · ")}
              </p>
              <p className="text-sm font-semibold tabular-nums text-foreground mt-1 tracking-tight">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <Separator className="my-6 bg-border/60" />

      {/* ── Részösszegek ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground uppercase tracking-widest text-[10px] sm:text-xs font-bold">Részösszeg</span>
          <span className="font-medium whitespace-nowrap tabular-nums">{formatPrice(netTotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground uppercase tracking-widest text-[10px] sm:text-xs font-bold">ÁFA (27%)</span>
          <span className="font-medium whitespace-nowrap tabular-nums">{formatPrice(vat)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground uppercase tracking-widest text-[10px] sm:text-xs font-bold">Szállítás</span>
          <span className="font-bold text-emerald-600 tracking-wider">Ingyenes</span>
        </div>
      </div>
      
      <Separator className="my-6 bg-border/60" />

      {/* ── Végösszeg ── */}
      <div className="flex items-center justify-between">
        <span className="font-display text-lg sm:text-xl font-bold text-foreground">Összesen</span>
        <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-primary tabular-nums">
          {formatPrice(grossTotal)}
        </span>
      </div>
    </div>
  )
}
