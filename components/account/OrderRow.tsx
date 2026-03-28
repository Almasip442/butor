import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Order } from "@/lib/types"

const statusMap: Record<Order["status"], { label: string; colorClass: string }> = {
  pending: { label: "Függőben", colorClass: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  processing: { label: "Feldolgozás alatt", colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  shipped: { label: "Kiszállítva", colorClass: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  delivered: { label: "Kézbesítve", colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  cancelled: { label: "Törölve", colorClass: "bg-red-500/10 text-red-600 border-red-500/20" },
}

export function OrderRow({ order }: { order: Order }) {
  const statusMeta = statusMap[order.status] || { label: order.status, colorClass: "bg-muted text-muted-foreground" }
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between p-5 bg-card border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      
      {/* Bal oldal: ID & Dátum */}
      <div className="flex flex-col gap-1 w-full sm:w-1/4">
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Rendelés száma</span>
        <span className="font-mono font-bold text-foreground text-sm uppercase">{order.id}</span>
        <span className="text-xs text-muted-foreground mt-1">
          {new Intl.DateTimeFormat("hu-HU", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }).format(new Date(order.created_at))}
        </span>
      </div>

      {/* Középpont: Státusz */}
      <div className="w-full sm:w-1/4 flex sm:justify-center">
        <Badge variant="outline" className={`px-3 py-1 font-semibold uppercase tracking-wider text-[10px] ${statusMeta.colorClass}`}>
          {statusMeta.label}
        </Badge>
      </div>

      {/* Ár */}
      <div className="w-full sm:w-1/4 flex sm:justify-end">
        <span className="font-bold text-lg tabular-nums">
          {new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(order.total_amount)}
        </span>
      </div>

      {/* Akció */}
      <div className="w-full sm:w-auto flex justify-end">
        <Link 
          href={`/account/orders/${order.id}`} 
          className="text-sm font-semibold text-primary/80 hover:text-primary transition-colors hover:underline underline-offset-4"
        >
          Részletek &rarr;
        </Link>
      </div>
    </div>
  )
}
