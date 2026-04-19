import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Package, Truck, CheckCircle2, Clock } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import type { OrderStatus } from "@/lib/types"
import type { Database } from "@/lib/database.types"

type OrderRow = Database['public']['Tables']['orders']['Row']
type OrderItemRow = Database['public']['Tables']['order_items']['Row']

interface OrderWithItems extends OrderRow {
  order_items: OrderItemRow[]
}

const statusMap: Record<OrderStatus, { label: string; step: number; colorClass: string }> = {
  pending: { label: "Függőben", step: 1, colorClass: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  confirmed: { label: "Visszaigazolva", step: 2, colorClass: "bg-teal-500/10 text-teal-600 border-teal-500/20" },
  processing: { label: "Feldolgozás alatt", step: 3, colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  shipped: { label: "Kiszállítva", step: 4, colorClass: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  delivered: { label: "Kézbesítve", step: 5, colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  cancelled: { label: "Törölve", step: -1, colorClass: "bg-red-500/10 text-red-600 border-red-500/20" },
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!data || error) {
    notFound()
  }

  const order = data as unknown as OrderWithItems
  const items = order.order_items ?? []

  const currentStatus = statusMap[order.status as OrderStatus] ?? {
    label: order.status,
    step: 0,
    colorClass: "bg-muted text-muted-foreground",
  }

  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const vat = subtotal * 0.27
  const shipping = order.total_amount - (subtotal + vat)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 max-w-5xl">

        {/* Back Link */}
        <div className="mb-6 animate-in fade-in duration-500">
          <Button variant="ghost" asChild className="pl-0 text-muted-foreground hover:text-foreground">
            <Link href="/account/orders">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Vissza a rendelésekhez
            </Link>
          </Button>
        </div>

        {/* Címsor és Státusz */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground uppercase">
              Rendelés Részletei
            </h1>
            <p className="text-muted-foreground text-sm mt-2 font-mono tracking-widest">
              #{order.id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Állapot:
            </span>
            <Badge variant="outline" className={`px-4 py-1.5 text-xs uppercase font-bold tracking-widest ${currentStatus.colorClass}`}>
              {currentStatus.label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">

          {/* Bal Panel: Timeline & Tételek */}
          <div className="lg:col-span-2 space-y-10">

            {/* Timeline UI */}
            {order.status !== "cancelled" && (
              <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold uppercase tracking-widest text-[10px] text-muted-foreground mb-6">
                  Szállítási Folyamat
                </h2>
                <div className="relative flex flex-col sm:flex-row gap-8 sm:gap-0 sm:justify-between items-start sm:items-center py-4 sm:py-0">
                  {/* Progress Vonal */}
                  <div className="absolute top-4 left-5 sm:top-1/2 sm:left-0 w-[2px] h-[calc(100%-2rem)] sm:w-full sm:h-[2px] bg-muted sm:-translate-y-1/2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary transition-all duration-1000 ease-out w-full h-[var(--progress)] sm:h-full sm:w-[var(--progress)]"
                      style={{ '--progress': `${(Math.max(currentStatus.step - 1, 0) / 4) * 100}%` } as React.CSSProperties}
                    />
                  </div>

                  {/* Lépések */}
                  {[
                    { step: 1, icon: Clock, label: "Függőben" },
                    { step: 2, icon: Package, label: "Visszaigazolva" },
                    { step: 3, icon: Package, label: "Feldolgozva" },
                    { step: 4, icon: Truck, label: "Úton" },
                    { step: 5, icon: CheckCircle2, label: "Kézbesítve" },
                  ].map((s) => {
                    const isCompleted = currentStatus.step >= s.step
                    const isCurrent = currentStatus.step === s.step
                    const Icon = s.icon

                    return (
                      <div key={s.step} className="relative z-10 flex flex-row sm:flex-col items-center gap-4 sm:gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors shrink-0 bg-background ${
                          isCompleted
                            ? "border-primary text-primary"
                            : "border-muted text-muted-foreground"
                        } ${isCurrent && "ring-4 ring-primary/20 bg-primary/10"}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                          {s.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Megrendelt tételek */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-semibold uppercase tracking-widest text-[10px] text-muted-foreground mb-6">
                Megrendelt Tételek
              </h2>

              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 sm:gap-6 items-center">
                    <div className="flex-1 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm sm:text-base line-clamp-2">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Mennyiség: {item.quantity} db &middot; Egységár: {new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(item.unit_price)}
                        </p>
                      </div>

                      <div className="font-bold text-sm sm:text-base tabular-nums shrink-0">
                        {new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(item.unit_price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Jobb Panel: Szállítás és Összesítő */}
          <div className="space-y-8">

            {/* Szállítási Adatok */}
            <div className="bg-muted/30 border border-border/50 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold uppercase tracking-widest text-[10px] text-muted-foreground mb-4">
                Szállítási Adatok
              </h2>
              <address className="not-italic text-sm space-y-2 text-foreground/80">
                <p className="font-bold text-foreground text-base mb-1">{order.shipping_name}</p>
                <p>{order.shipping_country}, {order.shipping_zip}</p>
                <p>{order.shipping_city}</p>
                <p>{order.shipping_address}</p>
                {order.notes && (
                  <div className="pt-2 mt-2 border-t border-border/50">
                    <p className="text-xs italic bg-muted/50 p-2 rounded">
                      " {order.notes} "
                    </p>
                  </div>
                )}
              </address>
            </div>

            {/* Pénzügyi Összesítő */}
            <div className="bg-muted/30 border border-border/50 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold uppercase tracking-widest text-[10px] text-muted-foreground mb-4">
                Összesítő
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Részösszeg (nettó)</span>
                  <span className="tabular-nums font-semibold tracking-tight">
                    {new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>ÁFA (27%)</span>
                  <span className="tabular-nums font-semibold tracking-tight">
                    {new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(vat)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Szállítás</span>
                  <span className="tabular-nums font-semibold tracking-tight">
                    {shipping <= 0 ? "Ingyenes" : new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(shipping)}
                  </span>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-base uppercase tracking-widest text-[10px] mt-1 text-muted-foreground">Végösszeg</span>
                  <span className="font-bold text-xl tabular-nums text-primary tracking-tight">
                    {new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
