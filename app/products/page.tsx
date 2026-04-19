import { createClient } from "@/lib/supabase/server"
import { ProductGrid } from "@/components/products/ProductGrid"
import { ProductFilters } from "@/components/products/ProductFilters"
import { SortSelector } from "@/components/products/SortSelector"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams

  const categoryParam = resolvedParams.category as string | undefined
  const searchParam = resolvedParams.search as string | undefined
  const minPrice = Number(resolvedParams.minPrice) || 0
  const maxPrice = Number(resolvedParams.maxPrice) || 1000000
  const sort = (resolvedParams.sort as string) || "newest"

  const supabase = await createClient()

  // Resolve category slug to id if provided
  let categoryId: string | undefined
  let categoryName: string | undefined
  if (categoryParam) {
    const { data: catData } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', categoryParam)
      .single()
    const cat = catData as unknown as { id: string; name: string } | null
    if (cat) {
      categoryId = cat.id
      categoryName = cat.name
    }
  }

  // Build products query
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (searchParam) {
    query = query.or(`name.ilike.%${searchParam}%,description.ilike.%${searchParam}%`)
  }

  if (minPrice > 0) {
    query = query.gte('price', minPrice)
  }

  if (maxPrice < 1000000) {
    query = query.lte('price', maxPrice)
  }

  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'name_asc':
      query = query.order('name', { ascending: true })
      break
    case 'name_desc':
      query = query.order('name', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const [productsResult, categoriesResult] = await Promise.all([
    query,
    supabase.from('categories').select('*').order('name', { ascending: true }),
  ])

  const filteredProducts = productsResult.error ? [] : (productsResult.data ?? [])
  const categories = categoriesResult.error ? [] : (categoriesResult.data ?? [])

  return (
    <div className="min-h-screen bg-background pb-20">

      {/* ── Oldal Fejléc ── */}
      <div className="bg-muted/10 border-b border-border/40 py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h1 className="hero-title text-foreground mb-4">
              {searchParam ? (
                <>Keresés: <span className="text-primary italic font-normal">"{searchParam}"</span></>
              ) : categoryName ? (
                categoryName
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

          {/* Asztali Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <ProductFilters isDesktopOnly categories={categories} />
          </aside>

          {/* Termék lista oldali konténer */}
          <div className="flex-1 w-full min-w-0 flex flex-col">

            {/* Felső vezérlő sáv: Találatok száma + Rendezés Selector + Mobil Szűrők */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border/40">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest hidden sm:block">
                <span className="text-foreground tracking-tight">{filteredProducts.length}</span> Termék található
              </p>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex-1 md:hidden">
                  <ProductFilters isMobileOnly categories={categories} />
                </div>
                <div className="flex-1 sm:flex-none">
                  <SortSelector />
                </div>
              </div>
            </div>

            <ProductGrid products={filteredProducts} />
          </div>

        </div>
      </div>
    </div>
  )
}
