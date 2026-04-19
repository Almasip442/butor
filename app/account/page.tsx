import { redirect } from "next/navigation"
import Link from "next/link"
import { ProfileForm } from "@/components/account/ProfileForm"
import { OrderRow } from "@/components/account/OrderRow"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Package } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { OrderStatus } from "@/lib/types"

interface OrderSummary {
  id: string
  status: OrderStatus
  total_amount: number
  created_at: string
}

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const [profileResult, ordersResult] = await Promise.all([
    supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('orders')
      .select('id, status, total_amount, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const profile = profileResult.data ?? null
  const recentOrders = (ordersResult.data ?? []) as unknown as OrderSummary[]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">

        {/* Fejléc */}
        <div className="mb-10">
          <h1 className="hero-title text-foreground tracking-tight text-3xl sm:text-4xl">
            Fiókom
          </h1>
          <p className="text-muted-foreground mt-2">
            Kezeld személyes adataidat és tekintsd át korábbi rendeléseidet.
          </p>
        </div>

        {/* Tab Layout */}
        <Tabs defaultValue="profile" className="w-full space-y-8 animate-in zoom-in-95 duration-500">
          <TabsList className="grid w-full grid-cols-2 max-w-sm ml-0">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>Rendeléseim</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="focus-visible:outline-none focus-visible:ring-0 mt-6 lg:max-w-3xl">
            <ProfileForm initialProfile={profile} />
          </TabsContent>

          <TabsContent value="orders" className="focus-visible:outline-none focus-visible:ring-0 mt-6 lg:max-w-3xl">
            {recentOrders.length === 0 ? (
              <div className="bg-muted/30 border border-border/50 rounded-2xl p-8 text-center sm:p-12 flex flex-col items-center">
                <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2 font-display">
                  Rendelési előzmények
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  Tekintse át korábbi megrendeléseit, kövesse nyomon a feldolgozásukat és nézze meg a részleteket.
                </p>
                <Link href="/account/orders" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6 font-bold uppercase tracking-widest">
                  Ugrás a rendelésekhez
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
                <div className="pt-2 text-center">
                  <Link href="/account/orders" className="text-sm font-semibold text-primary/80 hover:text-primary transition-colors hover:underline underline-offset-4">
                    Összes rendelés megtekintése &rarr;
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
