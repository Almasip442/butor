import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductsDataTable } from "@/components/admin/ProductsDataTable"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Product } from "@/lib/types"

export default async function AdminProductsPage() {
  // Auth guard: must be logged in and have admin role
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profileData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as { role: string } | null

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // Use admin client to fetch all products (including inactive)
  const adminClient = createAdminClient()

  const [productsResult, categoriesResult] = await Promise.all([
    adminClient
      .from('products')
      .select('*, categories(id, name, slug)')
      .order('created_at', { ascending: false }),
    adminClient
      .from('categories')
      .select('*')
      .order('name', { ascending: true }),
  ])

  const products = (productsResult.data ?? []) as unknown as Product[]
  const categories = categoriesResult.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Termékek</h1>
          <p className="text-muted-foreground mt-2">
            Kezelje a webshop termékeit, árait és készleteit.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Új termék
          </Link>
        </Button>
      </div>

      <ProductsDataTable products={products} categories={categories} />
    </div>
  )
}
