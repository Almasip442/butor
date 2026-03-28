"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { MOCK_CATEGORIES } from "@/lib/mock-data"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Filter, X, RefreshCw } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useDebounce } from "@/hooks/use-debounce"

const KNOWN_MATERIALS = ["Fa", "Szövet", "Bársony", "Üveg", "Fém", "Bőr", "MDF"]

interface ProductFiltersProps {
  isMobileOnly?: boolean
  isDesktopOnly?: boolean
}

export function ProductFilters({ isMobileOnly, isDesktopOnly }: ProductFiltersProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get("category") || "all"
  
  // Initialize states from URL
  const [priceRange, setPriceRange] = useState<number[]>([
    Number(searchParams.get("minPrice") || 0),
    Number(searchParams.get("maxPrice") || 1000000),
  ])
  
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    searchParams.get("materials") ? searchParams.get("materials")!.split(",") : []
  )

  // Apply filters to URL
  const applyFilters = (newCategory: string, newPrice: number[], newMaterials: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Kategória
    if (newCategory === "all") params.delete("category")
    else params.set("category", newCategory)

    // Ár
    if (newPrice[0] > 0) params.set("minPrice", newPrice[0].toString())
    else params.delete("minPrice")
    
    if (newPrice[1] < 1000000) params.set("maxPrice", newPrice[1].toString())
    else params.delete("maxPrice")

    // Anyag
    if (newMaterials.length > 0) params.set("materials", newMaterials.join(","))
    else params.delete("materials")

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Handle category change (Select)
  const handleCategoryChange = (val: string) => {
    applyFilters(val, priceRange, selectedMaterials)
  }

  // Handle material toggle
  const toggleMaterial = (material: string) => {
    const updated = selectedMaterials.includes(material)
      ? selectedMaterials.filter((m) => m !== material)
      : [...selectedMaterials, material]
      
    setSelectedMaterials(updated)
    applyFilters(currentCategory, priceRange, updated)
  }

  // Handle price commit
  const handlePriceCommit = (value: number[]) => {
    applyFilters(currentCategory, value, selectedMaterials)
  }

  const clearFilters = () => {
    setPriceRange([0, 1000000])
    setSelectedMaterials([])
    router.push(pathname, { scroll: false })
  }

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(val)
  }

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Kategória szűrő */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground">Kategória</h3>
        <Select value={currentCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full bg-background border-border hover:bg-muted/50 transition-colors">
            <SelectValue placeholder="Minden kategória" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Minden kategória</SelectItem>
            {MOCK_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Ár szűrő */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground">Árkategória</h3>
        </div>
        <Slider
          min={0}
          max={1000000}
          step={10000}
          value={priceRange}
          onValueChange={setPriceRange}
          onValueCommit={handlePriceCommit}
          className="mt-6"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium tabular-nums mt-3">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      <Separator />

      {/* Anyag szűrő */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground">Anyagok</h3>
        <div className="grid grid-cols-1 gap-3">
          {KNOWN_MATERIALS.map((mat) => (
            <div key={mat} className="flex items-center gap-2 group min-h-[44px]">
              <Checkbox
                id={`mat-${mat}`}
                checked={selectedMaterials.includes(mat)}
                onCheckedChange={() => toggleMaterial(mat)}
                className="rounded text-primary data-[state=checked]:bg-primary"
              />
              <Label
                htmlFor={`mat-${mat}`}
                className="text-sm cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors leading-none"
              >
                {mat}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={clearFilters}
        className="w-full text-muted-foreground hover:text-foreground touch-target"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Szűrők törlése
      </Button>
    </div>
  )

  return (
    <>
      {/* Asztali nézet */}
      {!isMobileOnly && (
        <div className="hidden md:block w-full">
          <div className="sticky top-24 bg-background/50 rounded-2xl border border-border/50 p-6 shadow-sm">
            <FilterContent />
          </div>
        </div>
      )}

      {/* Mobil nézet (Sheet) */}
      {!isDesktopOnly && (
        <div className="w-full">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 bg-background border-border w-full min-h-[44px]">
                <Filter className="h-4 w-4" />
                Szűrők
                {selectedMaterials.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full font-bold">
                    {selectedMaterials.length + (currentCategory !== "all" ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 1000000 ? 1 : 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-6 pt-12 overflow-y-auto">
              <SheetHeader className="mb-8 text-left">
                <SheetTitle className="font-display text-2xl">Szűrés & Keresés</SheetTitle>
              </SheetHeader>
              <FilterContent />
            </SheetContent>
          </Sheet>
        </div>
      )}
    </>
  )
}
