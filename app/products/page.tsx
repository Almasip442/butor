import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data"
import { ProductGrid } from "@/components/products/ProductGrid"
import { ProductFilters } from "@/components/products/ProductFilters"
import { SortSelector } from "@/components/products/SortSelector"
import { Separator } from "@/components/ui/separator"
import { Filter } from "lucide-react"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Turbo/Next 15+ async searchParams
  const resolvedParams = await searchParams
  
  const categoryParam = resolvedParams.category as string | undefined
  const searchParam = resolvedParams.search as string | undefined
  const minPrice = Number(resolvedParams.minPrice) || 0
  const maxPrice = Number(resolvedParams.maxPrice) || 1000000
  const sort = (resolvedParams.sort as string) || "newest"
  const materialsRaw = resolvedParams.materials as string | undefined
  const materials = materialsRaw ? materialsRaw.split(",") : []

  // Megállapítjuk a Kategória ID-t a slug alapján (a Mock adathoz szükséges)
  const categoryId = categoryParam 
    ? MOCK_CATEGORIES.find(c => c.slug === categoryParam)?.id 
    : undefined

  // ———— Kliens-oldali szűrés Mock adatokon ———— //
  let filteredProducts = MOCK_PRODUCTS.filter((product) => {
    // 1. Kategória (slug -> ID teszt)
    if (categoryId && product.category_id !== categoryId) return false
    
    // 2. Keresés szöveg alapján (SearchBar-ból: /products?search=...)
    if (searchParam) {
      const q = searchParam.toLowerCase()
      if (!product.name.toLowerCase().includes(q) && !product.description.toLowerCase().includes(q)) {
        return false
      }
    }

    // 3. Ár range
    if (product.price < minPrice || product.price > maxPrice) return false
    
    // 4. Anyag szűrés
    if (materials.length > 0) {
      if (!product.material) return false
      // Ellenőrizzük, hogy tartalmazza-e valamelyik kijelölt stringet (pl. "Fa", "MDF", "Szövet")
      const matchesMaterial = materials.some(mat => product.material!.includes(mat))
      if (!matchesMaterial) return false
    }

    return true
  })

  // ———— Rendezés Mock adatokon ———— //
  filteredProducts = filteredProducts.sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return a.price - b.price
      case "price_desc":
        return b.price - a.price
      case "name_asc":
        return a.name.localeCompare(b.name, "hu-HU")
      case "name_desc":
        return b.name.localeCompare(a.name, "hu-HU")
      case "newest":
      default:
        // Mock data fallback: egy szimulált rendezés ID alapján
        return a.id.localeCompare(b.id)
    }
  })

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* ── Oldal Fejléc ── */}
      <div className="bg-muted/10 border-b border-border/40 py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h1 className="hero-title text-foreground mb-4">
              {searchParam ? (
                <>Keresés: <span className="text-primary italic font-normal">"{searchParam}"</span></>
              ) : categoryParam ? (
                MOCK_CATEGORIES.find(c => c.slug === categoryParam)?.name || "Termékeink"
              ) : (
                "Termékeink"
              )}
            </h1>
            <p className="text-muted-foreground sm:text-lg">
              Fedezd fel a teljes kínálatunkat: a nappali és az étkező alapdarabjai, minőségi kivitelben.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative">
          
          {/* Asztali Sidebar / Mobil panel helye */}
          <div className="w-full lg:w-64 shrink-0 flex items-center justify-between lg:block">
            {/* Mobilon itt egy inline header jelenik meg a sheet gombbal */}
            <div className="lg:hidden flex items-center gap-2 text-foreground font-semibold uppercase tracking-widest text-sm">
               <Filter className="w-4 h-4" /> Szűrők
            </div>

            <ProductFilters />
          </div>
          
          {/* Termék lista oldali konténer */}
          <div className="flex-1 w-full min-w-0 flex flex-col">
            
            {/* Felső vezérlő sáv: Találatok száma + Rendezés Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border/40">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                <span className="text-foreground tracking-tight">{filteredProducts.length}</span> Termék található
              </p>
              
              <SortSelector />
            </div>
            
            <ProductGrid products={filteredProducts} />
          </div>

        </div>
      </div>
    </div>
  )
}
