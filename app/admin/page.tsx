export const dynamic = 'force-dynamic'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Tag, DollarSign } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [
    { count: activeProductsCount },
    { count: categoriesCount },
    { count: pendingOrdersCount },
    { data: revenueData },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("categories")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("total_amount"),
  ]);

  const totalRevenue = (revenueData ?? []).reduce(
    (sum, row) => sum + (row.total_amount ?? 0),
    0
  );

  const stats = [
    {
      title: "Aktív termékek",
      value: String(activeProductsCount ?? 0),
      icon: Package,
      description: "Aktív termékek száma",
    },
    {
      title: "Kategóriák",
      value: String(categoriesCount ?? 0),
      icon: Tag,
      description: "Összes kategória",
    },
    {
      title: "Függő rendelések",
      value: String(pendingOrdersCount ?? 0),
      icon: ShoppingCart,
      description: "Feldolgozásra vár",
    },
    {
      title: "Teljes bevétel",
      value: `${totalRevenue.toLocaleString("hu-HU")} Ft`,
      icon: DollarSign,
      description: "Összes rendelés összege",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Áttekintés a webshop aktuális állapotáról.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 mt-8">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Legutóbbi rendelések</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A legutóbbi rendelések listája hamarosan itt lesz látható.
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Alacsony készlet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A kifogyó félben lévő termékek listája.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
