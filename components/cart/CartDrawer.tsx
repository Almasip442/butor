"use client"

import { useCartDrawerStore } from "@/lib/store/cart-drawer-store"
import { useCartStore, useCartTotalPrice, useCartVat, useCartGrossTotal } from "@/lib/store/cart-store"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/ui/EmptyState"
import { CartItemRow } from "./CartItemRow"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export function CartDrawer() {
  const { isOpen, close } = useCartDrawerStore()
  const items = useCartStore((s) => s.items)
  
  const netTotal = useCartTotalPrice()
  const vat = useCartVat()
  const grossTotal = useCartGrossTotal()

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md p-0 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90" aria-describedby="cart-drawer-description">
        {/* Látássérülteknek vizuálisan rejtett, de a DOM-ban lévő description, ha a Screen Reader igényli */}
        <div id="cart-drawer-description" className="sr-only">
          Kosár tartalma, amelyből a termékek eltávolíthatók vagy megváltoztatható a mennyiségük. Pénztárhoz lépés a lenti gombbal.
        </div>

        <SheetHeader className="px-6 py-6 pb-2 text-left space-y-1">
          <SheetTitle className="font-display text-2xl font-bold tracking-tight text-foreground">Kosár</SheetTitle>
          <p className="text-xs text-muted-foreground tracking-widest uppercase font-semibold">
            FurnSpace Premium Interior
          </p>
        </SheetHeader>
        
        <Separator />
        
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex h-full items-center justify-center -mx-6">
              <EmptyState 
                title="A kosár üres"
                description="Helyezz termékeket a kosárba a böngészéshez!"
                icon={ShoppingBag}
                action={{
                  label: "Termékek böngészése",
                  onClick: close,
                  href: "/products"
                }}
                className="border-0 bg-transparent shadow-none"
              />
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/60">
              {items.map((item) => (
                <CartItemRow key={item.product.id} item={item} />
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-6 bg-background relative z-10">
            <div className="space-y-3 mb-6">
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
              <div className="flex justify-between items-center text-lg mt-2 pb-1">
                <span className="font-bold text-foreground font-display text-xl">Összesen</span>
                <span className="font-bold text-primary tabular-nums text-xl tracking-tight">{formatPrice(grossTotal)}</span>
              </div>
            </div>
            
            <SheetFooter>
              <Button asChild className="w-full text-sm h-12 uppercase tracking-wide font-bold touch-target shadow-md hover:shadow-lg transition-shadow">
                <Link href="/checkout" onClick={close}>
                  Pénztárhoz
                </Link>
              </Button>
            </SheetFooter>
            <p className="text-center text-[10px] uppercase text-muted-foreground tracking-widest mt-4">
              Biztonságos fizetés & Ingyenes visszaküldés
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
