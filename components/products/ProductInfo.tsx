"use client"

import { useState } from "react"
import { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { QuantitySelector } from "@/components/products/QuantitySelector"
import { AddToCartButton } from "@/components/products/AddToCartButton"
import { Separator } from "@/components/ui/separator"
import { MOCK_CATEGORIES } from "@/lib/mock-data"
import { HelpCircle, Truck, PackageCheck } from "lucide-react"

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)

  const formattedPrice = new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0
  }).format(product.price)

  const inStock = product.stock_quantity > 0
  const categoryName = MOCK_CATEGORIES.find(c => c.id === product.category_id)?.name || "Termék"

  return (
    <div className="flex flex-col gap-6 lg:gap-8 animate-in fade-in slide-in-from-right-8 duration-700">
      
      {/* ── Cím & Badge ── */}
      <div className="space-y-4">
        <Badge 
          variant="outline" 
          className="text-muted-foreground border-border uppercase tracking-widest text-[10px] sm:text-xs font-semibold px-3 py-1 bg-muted/50 rounded-full"
        >
          {categoryName}
        </Badge>
        
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
          {product.name}
        </h1>
        
        <div className="text-3xl font-bold tabular-nums text-primary tracking-tight">
          {formattedPrice}
        </div>
      </div>

      <Separator className="bg-border/60" />

      {/* ── Leírás ── */}
      <div className="text-muted-foreground leading-relaxed">
        <p>{product.description}</p>
      </div>

      {/* ── Tulajdonságok rács ── */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 bg-muted/30 p-5 rounded-2xl border border-border/50 shadow-sm">
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Anyag</p>
          <p className="font-medium text-sm sm:text-base text-foreground">{product.material || "N/A"}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Szín</p>
          <p className="font-medium text-sm sm:text-base text-foreground">{product.color || "N/A"}</p>
        </div>
        <div className="space-y-1 col-span-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Készlet Info</p>
          <div className="flex items-center gap-2 mt-1 py-1 px-3 bg-background rounded-full border border-border/50 inline-flex shadow-sm">
            <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${inStock ? "bg-emerald-500 shadow-emerald-500/50" : "bg-destructive animate-pulse"}`} />
            <p className="font-semibold text-xs sm:text-sm text-foreground">
              {inStock ? `Raktáron (${product.stock_quantity} db)` : "Jelenleg elfogyott"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Kosárba helyezés ── */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex-shrink-0">
           <QuantitySelector
             value={quantity}
             onChange={setQuantity}
             max={product.stock_quantity}
             disabled={!inStock}
             className="h-14 bg-muted/40"
           />
        </div>
        
        <AddToCartButton
          product={product}
          quantity={quantity}
          fullWidth
          className="h-14 text-sm sm:text-base tracking-widest uppercase font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-shadow"
        />
      </div>

      {/* ── Információs sáv ── */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/60">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <span>Ingyenes szállítás</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <PackageCheck className="w-4 h-4" />
          </div>
          <span>5 év garancia</span>
        </div>
      </div>
    </div>
  )
}
