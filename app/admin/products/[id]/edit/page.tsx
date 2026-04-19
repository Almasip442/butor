import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Category, Product } from "@/lib/types";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if ((profile as { role: string } | null)?.role !== 'admin') redirect('/');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any;

  const [productResult, categoriesResult] = await Promise.all([
    adminClient
      .from('products')
      .select('*')
      .eq('id', id)
      .single(),
    adminClient
      .from('categories')
      .select('*')
      .order('name', { ascending: true }),
  ]);

  if (!productResult.data) {
    notFound();
  }

  const product = productResult.data as unknown as Product;
  const categories = (categoriesResult.data ?? []) as unknown as Category[];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Vissza a termékekhez</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Termék szerkesztése</h1>
          <p className="text-muted-foreground mt-2">
            Módosítsa a termék adatait és mentse a változtatásokat.
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <ProductForm initialData={product} categories={categories} />
      </div>
    </div>
  );
}
