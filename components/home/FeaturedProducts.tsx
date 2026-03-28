import { Product } from "@/lib/types"
import { ProductCard } from "@/components/products/ProductCard"

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products || products.length === 0) return null

  // A specifikáció szerint 4 darabot jelenítünk meg, bár a props alapján mi mindent is.
  // Biztonság kedvéért itt megjelöljük a korlátozást:
  const featuredOnly = products.filter((p) => p.is_featured).slice(0, 4)

  return (
    <section className="py-20 lg:py-32 bg-secondary/10 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Fejléc */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="section-heading text-foreground font-display mb-4">
              Kiemelt Termékek
            </h2>
            <p className="text-muted-foreground text-lg">
              Fedezd fel legújabb prémium kollekciónkat, ahol a kényelem találkozik a kifinomult designnal.
            </p>
          </div>
          <div className="shrink-0 text-sm font-semibold tracking-wider uppercase text-primary hover:text-foreground transition-colors touch-target self-start md:self-auto">
            <a href="/products">Összes Termék &rarr;</a>
          </div>
        </div>
        
        {/* Rács - 1 oszlopos mobilon, 2 oszlopos tableten, 4 oszlopos desktopon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featuredOnly.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
      </div>
    </section>
  )
}
