import { MOCK_ORDERS } from "@/lib/mock-data"
import { OrderRow } from "@/components/account/OrderRow"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 max-w-4xl">
        
        {/* Back Link */}
        <div className="mb-6 animate-in fade-in duration-500">
          <Button variant="ghost" asChild className="pl-0 text-muted-foreground hover:text-foreground">
            <Link href="/account">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Vissza a fiókhoz
            </Link>
          </Button>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-semibold tracking-tight text-foreground">
            Rendelési előzmények
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Tekintse át eddigi megrendeléseit és kövesse nyomon a szállítási státuszt.
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          {MOCK_ORDERS.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>

      </div>
    </div>
  )
}
