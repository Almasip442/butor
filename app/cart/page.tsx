import { CartItemList } from "@/components/cart/CartItemList"
import { OrderSummary } from "@/components/cart/OrderSummary"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background pb-20 pt-8 sm:pt-16">
      
      {/* ── Breadcrumbs / Navigáció sáv ── */}
      <div className="bg-muted/10 border-b border-border/40 py-4 mb-8 hidden sm:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center text-xs sm:text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1 group">
              <Home className="w-[14px] h-[14px] group-hover:scale-110 transition-transform" />
              <span className="sr-only">Főoldal</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 sm:mx-3 opacity-40 shrink-0" />
            <span className="text-foreground font-semibold" aria-current="page">
              Kosár
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-8 tracking-tight">
          Kosaram
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative items-start">
          <div className="lg:col-span-2">
            <CartItemList />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
