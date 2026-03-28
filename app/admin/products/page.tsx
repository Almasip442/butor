import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductsDataTable } from "@/components/admin/ProductsDataTable";
import { MOCK_PRODUCTS as products, MOCK_CATEGORIES as categories } from "@/lib/mock-data";

export default function AdminProductsPage() {
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
  );
}
