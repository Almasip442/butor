"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCartStore } from "@/lib/store/cart-store"
import { MOCK_USER } from "@/lib/mock-data"
import { Loader2 } from "lucide-react"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const shippingSchema = z.object({
  full_name: z.string().min(2, "Teljes név megadása kötelező"),
  email: z.string().email("Érvénytelen e-mail cím"),
  phone: z.string().min(6, "Telefonszám megadása kötelező"),
  zip_code: z.string().min(4, "Irányítószám megadása kötelező"),
  city: z.string().min(2, "Város megadása kötelező"),
  address: z.string().min(5, "Utca, házszám megadása kötelező"),
  country: z.string().min(2, "Ország megadása kötelező"),
  notes: z.string().optional(),
})

type ShippingFormValues = z.infer<typeof shippingSchema>

export function ShippingForm() {
  const router = useRouter()
  const clearCart = useCartStore((state) => state.clearCart)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      full_name: MOCK_USER.shipping_address?.full_name || "",
      email: MOCK_USER.shipping_address?.email || "",
      phone: "",
      zip_code: MOCK_USER.shipping_address?.zip_code || "",
      city: MOCK_USER.shipping_address?.city || "",
      address: MOCK_USER.shipping_address?.address || "",
      country: MOCK_USER.shipping_address?.country || "Magyarország",
      notes: "",
    },
  })

  function onSubmit(data: ShippingFormValues) {
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      // TODO: replace with Supabase Server Action
      console.log("Form data:", data)
      clearCart()
      setIsSubmitting(false)
      router.push("/order-confirmation")
    }, 1500)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-5 bg-background border border-border/60 p-6 sm:p-8 rounded-2xl shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold font-display tracking-tight text-foreground uppercase border-b border-border/40 pb-4">
            Szállítási Adatok
          </h2>

          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Teljes név</FormLabel>
                <FormControl>
                  <Input placeholder="Kovács Anna" className="h-11 bg-muted/40 transition-colors focus:bg-background" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">E-mail cím</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="anna@example.com" className="h-11 bg-muted/40 transition-colors focus:bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Telefonszám</FormLabel>
                  <FormControl>
                    <Input placeholder="+36 30 123 4567" className="h-11 bg-muted/40 transition-colors focus:bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-1">
              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Irányítószám</FormLabel>
                    <FormControl>
                      <Input placeholder="1051" className="h-11 bg-muted/40 transition-colors focus:bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Város</FormLabel>
                    <FormControl>
                      <Input placeholder="Budapest" className="h-11 bg-muted/40 transition-colors focus:bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Utca, házszám, emelet, ajtó</FormLabel>
                <FormControl>
                  <Input placeholder="Deák Ferenc utca 5." className="h-11 bg-muted/40 transition-colors focus:bg-background" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Ország</FormLabel>
                <FormControl>
                  <Input {...field} disabled className="h-11 bg-muted/40 text-muted-foreground opacity-70" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Megjegyzés a futárnak (opcionális)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Pl.: A kapukód 1234, kérem hívjon, ha megérkezett." 
                    className="resize-none bg-muted/40 transition-colors focus:bg-background"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full h-14 text-sm sm:text-base uppercase tracking-widest font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all touch-target"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
              Rendelés feldolgozása...
            </>
          ) : (
            "Megrendelés Véglegesítése"
          )}
        </Button>
      </form>
    </Form>
  )
}
