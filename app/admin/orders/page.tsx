import { OrdersDataTable } from "@/components/admin/OrdersDataTable";
import { MOCK_ORDERS as orders } from "@/lib/mock-data";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rendelések</h1>
          <p className="text-muted-foreground mt-2">
            Rendelések nyomon követése és státuszának kezelése.
          </p>
        </div>
      </div>
      
      <OrdersDataTable orders={orders} />
    </div>
  );
}
