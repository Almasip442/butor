"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Tablet+ nézeten automatikusan fókusz az expandálásnál
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`)
      setIsExpanded(false)
      setQuery("")
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsExpanded(false)
      setQuery("")
    }
  }

  return (
    <div className="relative flex items-center">
      {/* Mobilon: csak ikon */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsExpanded((v) => !v)}
          aria-label="Keresés"
          aria-expanded={isExpanded}
          className="touch-target inline-flex items-center justify-center rounded-md text-foreground hover:text-primary transition-colors"
        >
          <Search className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {/* Mobil teljes képernyős keresősáv */}
        {isExpanded && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-start pt-20 px-4">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-lg mx-auto flex items-center gap-2"
            >
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Keresés a termékek között…"
                className="border-0 border-b border-border rounded-none bg-transparent text-lg focus-visible:ring-0 px-0"
                aria-label="Keresési kifejezés"
              />
              <button
                type="button"
                onClick={() => { setIsExpanded(false); setQuery("") }}
                aria-label="Keresés bezárása"
                className="touch-target inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Tablet+ nézeten: kinyíló keresősáv */}
      <div className="hidden sm:flex items-center relative">
        {isExpanded ? (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-1 animate-in fade-in slide-in-from-right-4 duration-200"
          >
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Keresés…"
              className="w-52 lg:w-64 h-9 text-sm"
              aria-label="Keresési kifejezés"
            />
            <button
              type="button"
              onClick={() => { setIsExpanded(false); setQuery("") }}
              aria-label="Keresés bezárása"
              className="touch-target inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            aria-label="Keresés megnyitása"
            aria-expanded={false}
            className="touch-target inline-flex items-center justify-center rounded-md text-foreground hover:text-primary transition-colors"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  )
}
