"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Product, Category } from "@/lib/types";
import { deleteProduct } from "@/app/admin/products/actions";

interface ProductsDataTableProps {
  products: Product[];
  categories: Category[];
}

export function ProductsDataTable({ products: initialProducts, categories }: ProductsDataTableProps) {
  const [products, setProducts] = useState(initialProducts);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price);
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "Ismeretlen";

  const toggleActive = (id: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p));
  };

  const handleDeleteConfirm = () => {
    if (!deletingProduct) return;

    const productToDelete = deletingProduct;
    setDeletingProduct(null);

    startTransition(async () => {
      const result = await deleteProduct(productToDelete.id);
      if (result.success) {
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        toast.success(`"${productToDelete.name}" sikeresen törölve`);
      } else {
        toast.error(result.error ?? 'A törlés sikertelen');
      }
    });
  };

  return (
    <>
      <div className="rounded-md border bg-card w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Kép</TableHead>
              <TableHead>Név</TableHead>
              <TableHead>Kategória</TableHead>
              <TableHead>Ár</TableHead>
              <TableHead>Készlet</TableHead>
              <TableHead>Aktív</TableHead>
              <TableHead className="text-right">Akciók</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Nincsenek termékek.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[120px] truncate sm:max-w-[250px]" title={product.name}>
                    {product.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getCategoryName(product.category_id)}</Badge>
                  </TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    <Badge variant={product.stock_quantity > 5 ? "outline" : "destructive"}>
                      {product.stock_quantity} db
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={product.is_active}
                      onCheckedChange={() => toggleActive(product.id)}
                      aria-label={`Termék aktiválása: ${product.name}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menü megnyitása</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Műveletek</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Szerkesztés
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeletingProduct(product)}
                          disabled={isPending}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Törlés
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => { if (!open) setDeletingProduct(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Termék törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törli a(z) <strong>{deletingProduct?.name}</strong> terméket? Ez a művelet nem vonható vissza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
