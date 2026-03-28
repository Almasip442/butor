import { notFound } from "next/navigation"
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data"
import { ProductImageGallery } from "@/components/products/ProductImageGallery"
import { ProductInfo } from "@/components/products/ProductInfo"
import { RelatedProducts } from "@/components/products/RelatedProducts"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  
  // 1. Termék keresése slug alapján
  const product = MOCK_PRODUCTS.find(p => p.slug === resolvedParams.slug)

  if (!product) {
    notFound()
  }

  // 2. Kategória név kikeresése a breadcrumbhoz
  const categoryName = MOCK_CATEGORIES.find(c => c.id === product.category_id)?.name || "Termékek"

  // 3. Hasonló termékek keresése (azonos kategória, kivéve önmaga)
  // És biztosítjuk, hogy abból max 4 db-ot jelenítünk meg
  const related = MOCK_PRODUCTS.filter(
    (p) => p.category_id === product.category_id && p.id !== product.id
  ).slice(0, 4)

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      
      {/* ── Breadcrumbs / Navigáció sáv ── */}
      <div className="bg-muted/10 border-b border-border/40 py-4 mb-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1 group">
              <Home className="w-[14px] h-[14px] group-hover:scale-110 transition-transform" />
              <span className="sr-only">Főoldal</span>
            </Link>
            
            <ChevronRight className="w-3.5 h-3.5 mx-2 sm:mx-3 opacity-40 shrink-0" />
            
            <Link href={`/products?category=${product.category_id}`} className="hover:text-foreground transition-colors inline-block">
              {categoryName}
            </Link>
            
            <ChevronRight className="w-3.5 h-3.5 mx-2 sm:mx-3 opacity-40 shrink-0" />
            
            <span className="text-foreground font-semibold inline-block truncate max-w-[150px] sm:max-w-none" aria-current="page">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Termék Részletek Fő Szakasza ── */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-4 lg:pt-10 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 xl:gap-24 items-start relative">
          
          {/* Bal oldal: Képgaléria (Sticky) */}
          <div className="lg:sticky lg:top-28 w-full z-10">
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Jobb oldal: Termékinformációk */}
          <div className="w-full relative z-20">
            <ProductInfo product={product} />
          </div>
          
        </div>
      </main>

      {/* ── Hasonló Termékek ── */}
      {related.length > 0 && (
        <RelatedProducts products={related} />
      )}
      
    </div>
  )
}
