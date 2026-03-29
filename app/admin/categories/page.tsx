"use client";

import { useState } from "react";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import Image from "next/image";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MOCK_CATEGORIES as initialCategories } from "@/lib/mock-data";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", description: "" });

  const handleSave = () => {
    // Generate mock ID
    const newId = `cat-${Math.random().toString(36).substring(2, 9)}`;
    const newImageUrl = `/images/categories/${newCategory.slug || 'default'}.webp`;
    
    setCategories([
      ...categories,
      {
        id: newId,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        image_url: newImageUrl,
      }
    ]);
    
    setNewCategory({ name: "", slug: "", description: "" });
    setIsDialogOpen(false);
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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <Label htmlFor="name">Kategória neve</Label>
                <Input 
                  id="name" 
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="Pl. Lámpák" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input 
                  id="slug" 
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                  placeholder="pl. lampak" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Leírás</Label>
                <Textarea 
                  id="description" 
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  placeholder="Rövid leírás a kategóriáról..." 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Mégse</Button>
              <Button type="button" onClick={handleSave} disabled={!newCategory.name || !newCategory.slug}>Mentés</Button>
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
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Nincsenek kategóriák.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
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
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Szerkesztés
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
                          setCategories(categories.filter(c => c.id !== category.id));
                        }}>
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
    </div>
  );
}
