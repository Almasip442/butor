import { ShippingForm } from "@/components/checkout/ShippingForm"
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary"

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      
      {/* ── Fejléc ── */}
      <div className="bg-muted/10 border-b border-border/40 py-10 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="hero-title text-foreground tracking-tight max-w-2xl">
            Biztonságos Pénztár
          </h1>
          <p className="text-muted-foreground mt-4 sm:text-lg max-w-xl leading-relaxed">
            Kérjük, pontosan töltsd ki a szállítási adatokat a megrendelés véglegesítéséhez. Minden tranzakciónk titkosított és 100%-ig biztonságos.
          </p>
        </div>
      </div>

      {/* ── Szállítási űrlap & Összesítő terület ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Bal oldal: Űrlap */}
          <div>
            <ShippingForm />
          </div>

          {/* Jobb oldal: Összesítő tábla (Sticky) */}
          <div className="lg:sticky lg:top-24">
            <CheckoutSummary />
          </div>
          
        </div>
      </div>
      
    </div>
  )
}
