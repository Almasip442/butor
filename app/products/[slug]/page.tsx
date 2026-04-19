import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { ProductImageGallery } from "@/components/products/ProductImageGallery"
import { ProductInfo } from "@/components/products/ProductInfo"
import { RelatedProducts } from "@/components/products/RelatedProducts"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import type { Product, Category } from "@/lib/types"

type ProductWithCategory = Product & {
  categories: Pick<Category, 'id' | 'name' | 'slug'> | null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('products')
    .select('name, description, images')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) {
    return { title: 'Termék nem található' }
  }

  const meta = data as unknown as { name: string; description: string; images: string[] | null }

  return {
    title: meta.name,
    description: meta.description,
    openGraph: {
      images: meta.images?.[0] ? [meta.images[0]] : [],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch product with category join — cast to known shape
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data || error) {
    notFound()
  }

  const product = data as unknown as ProductWithCategory
  const category = product.categories

  // Fetch related products: same category, different id, active, limit 4
  const { data: related } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', product.category_id)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4)

  const relatedProducts = (related ?? []) as Product[]

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

            <Link
              href={`/products?category=${category?.slug ?? ''}`}
              className="hover:text-foreground transition-colors inline-block"
            >
              {category?.name ?? 'Termékek'}
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
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}

    </div>
  )
}
