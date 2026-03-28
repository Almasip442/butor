import { HeroSection } from "@/components/home/HeroSection"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts products={MOCK_PRODUCTS} />
      <CategoryGrid categories={MOCK_CATEGORIES} />
    </>
  )
}
