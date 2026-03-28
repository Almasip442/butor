import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function OrderConfirmationPage() {
  // Generate a mock order ID
  const orderId = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
        
        {/* Ikon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-emerald-100/50 p-4 border border-emerald-200">
            <CheckCircle2 className="w-16 h-16 text-emerald-600" />
          </div>
        </div>

        {/* Cöszönőszöveg & Rendelési azonosító */}
        <div className="space-y-3">
          <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground">
            Sikeres rendelés!
          </h1>
          <p className="text-muted-foreground text-base">
            Köszönjük a vásárlást! Rendelését rögzítettük, a visszaigazolást hamarosan elküldjük e-mailben.
          </p>
        </div>

        <div className="bg-muted/40 border border-border/50 rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">
            Rendelési azonosító
          </p>
          <p className="text-2xl font-mono font-bold text-foreground">
            {orderId}
          </p>
        </div>

        <Separator className="bg-border/60" />

        {/* Főoldalra gomb */}
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
