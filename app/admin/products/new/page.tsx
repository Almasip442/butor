import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NewProductPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Új termék létrehozása</h1>
          <p className="text-muted-foreground mt-2">
            Adja meg az új termék adatait és töltse fel a képeket!
          </p>
        </div>
      </div>
      
      <div className="bg-card border rounded-lg p-6">
        <ProductForm />
      </div>
    </div>
  );
}
