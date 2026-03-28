import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { MOCK_PRODUCTS as products } from "@/lib/mock-data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const product = products.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

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
        <ProductForm initialData={product} />
      </div>
    </div>
  );
}
