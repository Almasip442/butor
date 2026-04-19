"use client";

import { useState, useTransition } from "react";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/lib/types";
import { createCategory, updateCategory, deleteCategory } from "@/app/admin/categories/actions";

interface CategoriesClientProps {
  initialCategories: Category[];
}

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
}

const emptyForm: CategoryFormState = { name: "", slug: "", description: "" };

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<CategoryFormState>(emptyForm);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState<CategoryFormState>(emptyForm);

  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const handleCreate = () => {
    const fd = new FormData();
    fd.append('name', newCategory.name);
    fd.append('slug', newCategory.slug);
    fd.append('description', newCategory.description);

    startTransition(async () => {
      const result = await createCategory(fd);
      if (result.success) {
        toast.success('Kategória sikeresen létrehozva');
        setIsCreateOpen(false);
        setNewCategory(emptyForm);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Hiba a létrehozás során');
      }
    });
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setEditForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
    });
  };

  const handleEdit = () => {
    if (!editingCategory) return;

    const fd = new FormData();
    fd.append('name', editForm.name);
    fd.append('slug', editForm.slug);
    fd.append('description', editForm.description);

    startTransition(async () => {
      const result = await updateCategory(editingCategory.id, fd);
      if (result.success) {
        toast.success('Kategória sikeresen frissítve');
        setEditingCategory(null);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Hiba a frissítés során');
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingCategory) return;

    const categoryToDelete = deletingCategory;
    setDeletingCategory(null);

    startTransition(async () => {
      const result = await deleteCategory(categoryToDelete.id);
      if (result.success) {
        toast.success(`"${categoryToDelete.name}" sikeresen törölve`);
        router.refresh();
      } else {
        toast.error(result.error ?? 'A törlés sikertelen');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategóriák</h1>
          <p className="text-muted-foreground mt-2">
            Termékkategóriák kezelése és szerkesztése.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Új kategória
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Új kategória létrehozása</DialogTitle>
              <DialogDescription>
                Hozzon létre egy új termékkategóriát a webshophoz.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-name">Kategória neve</Label>
                <Input
                  id="create-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Pl. Lámpák"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-slug">URL Slug</Label>
                <Input
                  id="create-slug"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  placeholder="pl. lampak"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-description">Leírás</Label>
                <Textarea
                  id="create-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Rövid leírás a kategóriáról..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isPending}
              >
                Mégse
              </Button>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={!newCategory.name || !newCategory.slug || isPending}
              >
                Mentés
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Kép</TableHead>
              <TableHead>Név</TableHead>
              <TableHead>URL (Slug)</TableHead>
              <TableHead>Leírás</TableHead>
              <TableHead className="text-right">Akciók</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Nincsenek kategóriák.
                </TableCell>
              </TableRow>
            ) : (
              initialCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex items-center justify-center text-xs text-muted-foreground border">
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        "Nincs kép"
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono font-normal">
                      /{category.slug}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {category.description || "-"}
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
                        <DropdownMenuItem onClick={() => openEdit(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Szerkesztés
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeletingCategory(category)}
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

      {/* Szerkesztés dialóg */}
      <Dialog open={!!editingCategory} onOpenChange={(open: boolean) => { if (!open) setEditingCategory(null); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Kategória szerkesztése</DialogTitle>
            <DialogDescription>
              Módosítsa a kategória adatait és mentse a változtatásokat.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Kategória neve</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Pl. Lámpák"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">URL Slug</Label>
              <Input
                id="edit-slug"
                value={editForm.slug}
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                placeholder="pl. lampak"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Leírás</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Rövid leírás a kategóriáról..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingCategory(null)}
              disabled={isPending}
            >
              Mégse
            </Button>
            <Button
              type="button"
              onClick={handleEdit}
              disabled={!editForm.name || !editForm.slug || isPending}
            >
              Mentés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Törlés megerősítő dialóg */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open: boolean) => { if (!open) setDeletingCategory(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategória törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törli a(z) <strong>{deletingCategory?.name}</strong> kategóriát? Ez a művelet nem vonható vissza.
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
    </div>
  );
}
