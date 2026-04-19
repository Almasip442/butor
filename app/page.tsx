import { HeroSection } from "@/components/home/HeroSection"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()

  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true }),
  ])

  const products = productsResult.error ? [] : (productsResult.data ?? [])
  const categories = categoriesResult.error ? [] : (categoriesResult.data ?? [])

  return (
    <>
      <HeroSection />
      <FeaturedProducts products={products} />
      <CategoryGrid categories={categories} />
    </>
  )
}
