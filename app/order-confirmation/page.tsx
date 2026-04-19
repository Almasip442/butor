import { redirect } from "next/navigation"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/server"
import type { OrderWithItems } from "@/lib/types"

interface Props {
  searchParams: Promise<{ orderId?: string }>
}

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const { orderId } = await searchParams

  if (!orderId) {
    redirect("/")
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single<OrderWithItems>()

  if (!order) {
    redirect("/")
  }

  const shortId = order.id.substring(0, 8).toUpperCase()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full space-y-8 animate-in zoom-in-95 duration-500">

        {/* Ikon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-emerald-100/50 p-4 border border-emerald-200">
            <CheckCircle2 className="w-16 h-16 text-emerald-600" />
          </div>
        </div>

        {/* Köszönőszöveg & Rendelési azonosító */}
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground">
            Sikeres rendelés!
          </h1>
          <p className="text-muted-foreground text-base">
            Köszönjük a vásárlást! Rendelését rögzítettük, a visszaigazolást hamarosan elküldjük e-mailben.
          </p>
        </div>

        <div className="bg-muted/40 border border-border/50 rounded-xl p-6 shadow-sm text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">
            Rendelési azonosító
          </p>
          <p className="text-2xl font-mono font-bold text-foreground">
            {shortId}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {order.id}
          </p>
        </div>

        {/* Szállítási adatok */}
        <div className="bg-background border border-border/60 rounded-xl p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Szállítási cím
          </h2>
          <div className="text-sm text-foreground space-y-1">
            <p className="font-medium">{order.shipping_name}</p>
            <p>{order.shipping_zip} {order.shipping_city}</p>
            <p>{order.shipping_address}</p>
            <p>{order.shipping_country}</p>
          </div>
        </div>

        {/* Tételek */}
        <div className="bg-background border border-border/60 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Rendelt termékek
          </h2>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-foreground">
                  {item.product_name}
                  <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                </span>
                <span className="font-medium text-foreground">
                  {(item.unit_price * item.quantity).toLocaleString("hu-HU")} Ft
                </span>
              </div>
            ))}
          </div>
          <Separator className="bg-border/60" />
          <div className="flex justify-between items-center font-semibold text-base">
            <span>Összesen</span>
            <span>{order.total_amount.toLocaleString("hu-HU")} Ft</span>
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Navigáció */}
        <div className="pt-2">
          <Button asChild size="lg" className="w-full text-base font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
            <Link href="/">
              Vissza a főoldalra
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full mt-3 text-muted-foreground hover:text-foreground">
            <Link href="/account/orders">
              Rendelések megtekintése
            </Link>
          </Button>
        </div>

      </div>
    </div>
  )
}
