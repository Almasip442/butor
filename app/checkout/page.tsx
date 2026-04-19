import { createClient } from "@/lib/supabase/server"
import { ShippingForm } from "@/components/checkout/ShippingForm"
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary"
import type { ShippingAddress } from "@/lib/types"

export default async function CheckoutPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let shippingDefaults: Partial<{
    full_name: string
    email: string
    phone: string
    zip_code: string
    city: string
    address: string
    country: string
    notes: string
  }> = {}

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("full_name, email, phone, shipping_address")
      .eq("id", user.id)
      .single()

    if (profile) {
      let parsedAddress: ShippingAddress | null = null

      if (profile.shipping_address) {
        if (typeof profile.shipping_address === "string") {
          try {
            parsedAddress = JSON.parse(profile.shipping_address) as ShippingAddress
          } catch {
            parsedAddress = null
          }
        } else if (typeof profile.shipping_address === "object") {
          parsedAddress = profile.shipping_address as ShippingAddress
        }
      }

      shippingDefaults = {
        full_name: parsedAddress?.full_name ?? profile.full_name ?? "",
        email: parsedAddress?.email ?? profile.email ?? "",
        phone: parsedAddress?.phone ?? profile.phone ?? "",
        zip_code: parsedAddress?.zip_code ?? "",
        city: parsedAddress?.city ?? "",
        address: parsedAddress?.address ?? "",
        country: parsedAddress?.country ?? "Magyarország",
      }
    }
  }

  return (
    <div className="min-h-screen bg-background pb-16">

      {/* Fejléc */}
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

      {/* Szállítási űrlap & Összesítő */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Bal oldal: Űrlap */}
          <div className="lg:col-span-7">
            <ShippingForm defaultValues={shippingDefaults} />
          </div>

          {/* Jobb oldal: Összesítő (Sticky) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <CheckoutSummary />
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
