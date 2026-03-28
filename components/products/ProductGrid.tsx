import { Product } from "@/lib/types"
import { ProductCard } from "./ProductCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { PackageX } from "lucide-react"

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="py-16 flex justify-center w-full min-h-[400px]">
        <EmptyState 
          title="Nincsenek találatok"
          description="A választott szűrő feltételek alapján nem találtunk terméket a teljes kínálatunkban. Próbálkozz más feltételekkel!"
          icon={PackageX}
          action={{
            label: "Szűrők és keresés törlése",
            href: "/products"
          }}
          className="max-w-xl w-full border-border bg-transparent shadow-none"
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
