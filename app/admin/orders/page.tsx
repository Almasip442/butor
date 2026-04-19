import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrdersDataTable } from "@/components/admin/OrdersDataTable";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if ((profile as { role: string } | null)?.role !== 'admin') redirect('/');

  const adminClient = createAdminClient();
  const { data: orders } = await adminClient
    .from('orders')
    .select('id, status, total_amount, created_at, shipping_name, users(full_name)')
    .order('created_at', { ascending: false });

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

      <OrdersDataTable orders={(orders ?? []) as any} />
    </div>
  );
}
