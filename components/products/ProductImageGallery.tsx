"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-3xl border border-border flex items-center justify-center">
        <span className="text-muted-foreground text-sm font-medium">Nincs elérhető kép</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row-reverse gap-4 sm:gap-6 w-full">
      {/* Főkép */}
      <div className="relative aspect-square w-full sm:flex-1 overflow-hidden rounded-2xl sm:rounded-3xl bg-muted border border-border/60 shadow-sm">
        <Image
          src={images[activeIndex]}
          alt={`${productName} - Kép ${activeIndex + 1}`}
          fill
          className="object-cover object-center transition-opacity duration-500 ease-in-out"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {/* Bélyegképek (Thumbnails) */}
      {images.length > 1 && (
        <div className="flex flex-row sm:flex-col gap-3 sm:gap-4 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 sm:w-20 snap-x scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {images.map((image, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={`${image}-${index}`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 snap-start overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-300 touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? "border-2 border-primary ring-2 ring-primary/10 shadow-md transform scale-[1.02]"
                    : "border-2 border-transparent opacity-60 hover:opacity-100 bg-muted hover:border-primary/30"
                )}
                aria-label={`${index + 1}. kép kiválasztása`}
                aria-current={isActive ? "true" : undefined}
              >
                <Image
                  src={image}
                  alt={`${productName} miniatűr kép ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 80px, 96px"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
