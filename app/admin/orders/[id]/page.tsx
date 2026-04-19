import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect"
import type { OrderStatus } from "@/lib/types"

const statusMap: Record<OrderStatus, { label: string; colorClass: string }> = {
  pending: { label: "Függőben", colorClass: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  confirmed: { label: "Visszaigazolva", colorClass: "bg-teal-500/10 text-teal-600 border-teal-500/20" },
  processing: { label: "Feldolgozás alatt", colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  shipped: { label: "Kiszállítva", colorClass: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  delivered: { label: "Kézbesítve", colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  cancelled: { label: "Törölve", colorClass: "bg-red-500/10 text-red-600 border-red-500/20" },
}

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as { role: string } | null)?.role !== 'admin') redirect('/')

  const adminClient = createAdminClient()
  const { data: rawOrder } = await adminClient
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('id', id)
    .single()

  if (!rawOrder) {
    notFound()
  }

  const order = rawOrder as unknown as {
    id: string
    status: string
    total_amount: number
    shipping_name: string
    shipping_address: string
    shipping_city: string
    shipping_zip: string
    shipping_country: string
    order_items: Array<{
      id: string
      product_name: string
      unit_price: number
      quantity: number
      products?: { slug?: string; images?: string[] | null } | null
    }>
  }

  const currentStatus = statusMap[order.status as OrderStatus]

  const items = (order.order_items ?? []) as Array<{
    id: string
    product_name: string
    unit_price: number
    quantity: number
    products?: { slug?: string; images?: string[] | null } | null
  }>

  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const vat = subtotal * 0.27
  const shipping = order.total_amount - (subtotal + vat)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground h-10 w-10 shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Vissza a rendelésekhez</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rendelés részletei</h1>
          <p className="text-muted-foreground mt-1 font-mono">
            #{order.id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Bal oldalsó (fő) oszlop */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Megrendelt Tételek</h2>

            <div className="space-y-6">
              {items.map((item) => {
                const imgUrl = item.products?.images?.[0] ?? "/placeholder.svg"
                const productSlug = item.products?.slug

                return (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:items-start border-b border-border/40 pb-6 last:border-0 last:pb-0">
                    <div className="relative w-full sm:w-20 h-32 sm:h-20 bg-muted rounded-md overflow-hidden shrink-0 border border-border/50">
                      <Image
                        src={imgUrl}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between gap-2">
                      <div>
                        {productSlug ? (
                          <Link
                            href={`/products/${productSlug}`}
                            className="font-semibold text-base hover:text-primary transition-colors hover:underline line-clamp-2"
                          >
                            {item.product_name}
                          </Link>
                        ) : (
                          <p className="font-semibold text-base line-clamp-2">{item.product_name}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          Egységár: {new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(item.unit_price)}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                          {item.quantity} db
                        </span>
                        <span className="font-bold tabular-nums">
                          {new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(item.unit_price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Jobb oldalsó (sidebar) oszlop */}
        <div className="space-y-6">
          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Rendelés állapota</h2>
            <Badge
              variant="outline"
              className={`w-full py-2 flex justify-center text-sm uppercase font-bold tracking-widest ${currentStatus.colorClass}`}
            >
              {currentStatus.label}
            </Badge>
            <div className="mt-4">
              <OrderStatusSelect orderId={order.id} currentStatus={order.status as OrderStatus} />
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Szállítási Adatok</h2>
            <address className="not-italic text-sm space-y-2 text-foreground/80">
              <p className="font-bold text-foreground text-base mb-1">{order.shipping_name}</p>
              <p>{order.shipping_country}, {order.shipping_zip}</p>
              <p>{order.shipping_city}</p>
              <p>{order.shipping_address}</p>
            </address>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Összesítő</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Részösszeg (nettó)</span>
                <span className="tabular-nums font-medium">
                  {new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>ÁFA (27%)</span>
                <span className="tabular-nums font-medium">
                  {new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(vat)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Szállítás</span>
                <span className="tabular-nums font-medium">
                  {shipping <= 0 ? "Ingyenes" : new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(shipping)}
                </span>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-base">Végösszeg</span>
                <span className="font-bold text-xl tabular-nums text-primary">
                  {new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
