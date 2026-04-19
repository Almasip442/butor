import Image from "next/image"
import Link from "next/link"
import { Category } from "@/lib/types"

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link 
      href={`/products?category=${category.slug}`} 
      className="group flex flex-col items-center gap-4 touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 rounded-xl"
    >
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-muted border border-border/50 shadow-sm group-hover:shadow-xl transition-all duration-500 ease-out">
        <Image
          src={category.image_url ?? '/placeholder.svg'}
          alt={`Navigáció a(z) ${category.name} kategóriához`}
          fill
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        />
        {/* Halvány sötétítő overlay hover esetén */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500" />
      </div>
      
      <h3 className="font-display text-sm sm:text-base font-semibold tracking-wide text-foreground text-center group-hover:text-primary transition-colors">
        {category.name}
      </h3>
    </Link>
  )
}
