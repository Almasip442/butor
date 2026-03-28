"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SortSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get("sort") || "newest"

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    
    // Router push `scroll: false` opcióval, hogy ne ugorjon fel az oldal tetejére minden rendezésnél
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <label htmlFor="sort-selector" className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden sm:inline-block">
        Rendezés:
      </label>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger id="sort-selector" className="w-full sm:w-[200px] h-10 border-border bg-background focus:ring-primary touch-target">
          <SelectValue placeholder="Válassz rendezést" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="newest" className="cursor-pointer">Legújabb (Alapértelmezett)</SelectItem>
          <SelectItem value="price_asc" className="cursor-pointer">Nettó ár: növekvő</SelectItem>
          <SelectItem value="price_desc" className="cursor-pointer">Nettó ár: csökkenő</SelectItem>
          <SelectItem value="name_asc" className="cursor-pointer">Név: A-Z</SelectItem>
          <SelectItem value="name_desc" className="cursor-pointer">Név: Z-A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
