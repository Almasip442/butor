"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "./ImageUploader";
import { MOCK_CATEGORIES as categories } from "@/lib/mock-data";

const productSchema = z.object({
  name: z.string().min(3, "Legalább 3 karakter").max(200),
  slug: z.string().min(3, "Legalább 3 karakter"),
  description: z.string().min(10, "Részletesebb leírás szükséges"),
  price: z.coerce.number().min(0, "Nem lehet negatív"),
  stock_quantity: z.coerce.number().int().min(0, "Nem lehet negatív"),
  category_id: z.string().min(1, "Válassz kategóriát!"),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  images: z.array(z.string()).min(1, "Legalább 1 kép feltöltése kötelező"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any; // TBD: Product type
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      description: "",
      price: 0,
      stock_quantity: 0,
      category_id: "",
      is_active: true,
      is_featured: false,
      images: [],
    },
  });

  const onSubmit = (data: any) => {
    console.log("Mock product saved:", data);
    // TODO: Supabase query (insert / update)
    router.push("/admin/products");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Név */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Termék neve <span className="text-destructive ml-1">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Pl. Skandináv tölgyfa asztal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL (slug) <span className="text-destructive ml-1">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="pl. skandinav-tolgyfa-asztal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4 md:col-span-2 lg:col-span-1 lg:grid-cols-2 lg:gap-6">
            {/* Ár */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ár (Ft) <span className="text-destructive ml-1">*</span></FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Készlet */}
            <FormField
              control={form.control}
              name="stock_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="truncate">Készlet mennyiség <span className="text-destructive ml-1">*</span></FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem className="md:col-span-2 lg:col-span-1">
                <FormLabel>Kategória <span className="text-destructive ml-1">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz kategóriát" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Leírás */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leírás <span className="text-destructive ml-1">*</span></FormLabel>
              <FormControl>
                <Textarea placeholder="Részletes termékleírás..." className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Képek */}
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Termékképek <span className="text-destructive ml-1">*</span></FormLabel>
              <FormControl>
                <ImageUploader images={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Kapcsolók */}
        <div className="flex flex-col sm:flex-row gap-8 border rounded-lg p-4 bg-muted/20">
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 sm:w-48">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Aktív</FormLabel>
                  <FormDescription>Oldalon látható</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 sm:w-48 sm:border-l sm:pl-8">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Kiemelt</FormLabel>
                  <FormDescription>Főoldali szekció</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Mégse</Button>
          <Button type="submit">Mentés</Button>
        </div>
      </form>
    </Form>
  );
}
