"use client"

import Image from "next/image"
import Link from "next/link"
import { Product } from "@/lib/types"
import { AddToCartButton } from "./AddToCartButton"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0
  }).format(product.price)

  return (
    <Card className="group overflow-hidden rounded-2xl border-border/50 bg-background shadow-sm hover:shadow-xl transition-all duration-500 ease-out flex flex-col h-full">
      
      {/* Kép tartomány */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset" aria-label={`${product.name} részletek`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>
        
        {/* Badge - Kiemelt vagy Új (mock adatok alapján nincsenek új termékek, a kiemeltet mutatom) */}
        {product.is_featured && (
          <Badge className="absolute top-4 left-4 z-20 bg-background/90 text-foreground hover:bg-background/90 backdrop-blur-sm pointer-events-none">
            Kiemelt
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-col flex-grow p-5 space-y-2">
        <div className="flex flex-col gap-1">
          <Link href={`/products/${product.slug}`} className="block focus-visible:outline-none focus-visible:underline rounded-sm">
            <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </div>
        
        {/* Anyag és Szín */}
        {(product.material || product.color) && (
          <p className="text-xs text-muted-foreground pt-1 pb-2">
            {[product.color, product.material].filter(Boolean).join(" · ")}
          </p>
        )}
        
        {/* Arányosan kitölti az üres helyet */}
        <div className="flex-grow" />

        <div className="pt-2 font-semibold text-lg tabular-nums text-foreground tracking-tight">
          {formattedPrice}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <AddToCartButton 
          product={product} 
          fullWidth 
          variant="secondary"
          className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-2 lg:group-hover:translate-y-0 transition-all duration-300" 
        />
      </CardFooter>
    </Card>
  )
}
