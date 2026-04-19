import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CategoriesClient } from "@/components/admin/CategoriesClient";
import type { Category } from "@/lib/types";

export default async function AdminCategoriesPage() {
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
  const { data: categories } = await adminClient
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  return (
    <CategoriesClient initialCategories={(categories ?? []) as unknown as Category[]} />
  );
}
