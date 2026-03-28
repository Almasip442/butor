import { Category } from "@/lib/types"
import { CategoryCard } from "./CategoryCard"

interface CategoryGridProps {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-20 lg:py-32 bg-background border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Fejléc */}
        <div className="text-center mb-16">
          <p className="text-muted-foreground uppercase tracking-widest text-xs font-semibold mb-3">
            Gondosan Válogatott
          </p>
          <h2 className="section-heading text-foreground font-display font-medium">
            Kategóriák
          </h2>
          <div className="mx-auto mt-6 w-16 h-1 bg-primary/20 rounded-full" />
        </div>
        
        {/* Grid beépítve a 2x3 responsive elrendezésbe */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-12 sm:gap-8">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        
      </div>
    </section>
  )
}
