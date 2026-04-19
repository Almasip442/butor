import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OrderRow } from "@/components/account/OrderRow"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, Package } from "lucide-react"
import type { OrderStatus } from "@/lib/types"

interface OrderSummary {
  id: string
  status: OrderStatus
  total_amount: number
  created_at: string
}

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total_amount, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const orderList = (orders ?? []) as unknown as OrderSummary[]

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
        {orderList.length === 0 ? (
          <div className="bg-muted/30 border border-border/50 rounded-2xl p-8 text-center sm:p-12 flex flex-col items-center">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2 font-display">
              Még nincs rendelésed
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Böngéssz termékeink között és add le az első rendelésed!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6 font-bold uppercase tracking-widest"
            >
              Termékek böngészése
            </Link>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            {orderList.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
