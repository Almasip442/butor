"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { SearchBar } from "./SearchBar"
import { UserMenu } from "./UserMenu"
import { CartIcon } from "@/components/cart/CartIcon"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/products", label: "Termékeink" },
  { href: "/products?category=kanapek", label: "Kanapék" },
  { href: "/products?category=asztalok", label: "Asztalok" },
  { href: "/products?category=szekek", label: "Székek" },
]

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="shrink-0 font-display text-xl whitespace-nowrap font-bold tracking-tight text-foreground hover:text-primary transition-colors"
            aria-label="FurnSpace – Főoldal"
          >
            FurnSpace
          </Link>

          {/* ── Desktop navigáció ── */}
          <nav
            aria-label="Főnavigáció"
            className="hidden md:flex items-center gap-1"
          >
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/products"
                  ? pathname === "/products"
                  : pathname.startsWith(link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "text-primary after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-primary after:rounded-full"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* ── Jobb oldali ikonok ── */}
          <div className="flex items-center gap-1 sm:gap-2">
            <SearchBar />
            <UserMenu />
            <CartIcon />

            {/* ── Hamburger (csak mobilon) ── */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label={mobileOpen ? "Menü bezárása" : "Menü megnyitása"}
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-nav"
                  className="touch-target md:hidden inline-flex items-center justify-center rounded-md text-foreground hover:text-primary transition-colors"
                >
                  {mobileOpen ? (
                    <X className="h-5 w-5" strokeWidth={1.5} />
                  ) : (
                    <Menu className="h-5 w-5" strokeWidth={1.5} />
                  )}
                </button>
              </SheetTrigger>

              <SheetContent side="left" id="mobile-nav" className="w-72 pt-12">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle className="font-display text-xl font-bold">
                    FurnSpace
                  </SheetTitle>
                </SheetHeader>

                <Separator className="mb-4" />

                <nav aria-label="Mobil navigáció" className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => {
                    const isActive =
                      link.href === "/products"
                        ? pathname === "/products"
                        : pathname.startsWith(link.href)

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        )}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                </nav>

                <Separator className="my-4" />

                {/* Admin link */}
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-3 py-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-md transition-colors"
                >
                  Admin panel
                </Link>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
