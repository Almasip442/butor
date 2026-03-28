import { Product } from "@/lib/types"
import { ProductCard } from "@/components/products/ProductCard"

interface RelatedProductsProps {
  products: Product[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null

  return (
    <section className="py-16 lg:py-24 border-t border-border/50 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Fejléc */}
        <div className="mb-12 text-center sm:text-left max-w-2xl mx-auto sm:mx-0">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Hasonló termékek
          </h2>
          <p className="text-muted-foreground mt-3 sm:text-lg">
            Egészítsd ki stílusban illő darabokkal az étkezőt vagy nappalit
          </p>
        </div>
        
        {/* Termékrács */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
      </div>
    </section>
  )
}
