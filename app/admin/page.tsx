import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Összes termék",
      value: "18",
      icon: Package,
      description: "Aktív kategóriákban",
    },
    {
      title: "Aktív rendelések",
      value: "3",
      icon: ShoppingCart,
      description: "Feldolgozásra vár",
    },
    {
      title: "Összes felhasználó",
      value: "1",
      icon: Users,
      description: "Regisztrált vásárló",
    },
    {
      title: "Teljes bevétel",
      value: "2 540 000 Ft",
      icon: DollarSign,
      description: "Az elmúlt 30 napban",
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
