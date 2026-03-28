"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { MOCK_USER } from "@/lib/mock-data"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

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

const profileSchema = z.object({
  full_name: z.string().min(2, "Teljes név megadása kötelező"),
  email: z.string().email("Érvénytelen e-mail cím"),
  phone: z.string().min(6, "Telefonszám megadása kötelező").or(z.literal("")),
  zip_code: z.string().min(4, "Irányítószám megadása kötelező").or(z.literal("")),
  city: z.string().min(2, "Város megadása kötelező").or(z.literal("")),
  address: z.string().min(5, "Utca, házszám megadása kötelező").or(z.literal("")),
  country: z.string().min(2, "Ország megadása kötelező").or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: MOCK_USER.full_name,
      email: MOCK_USER.email,
      phone: "+36 30 123 4567", // Mocking a default since MOCK_USER doesn't strictly have phone at the root
      zip_code: MOCK_USER.shipping_address?.zip_code || "",
      city: MOCK_USER.shipping_address?.city || "",
      address: MOCK_USER.shipping_address?.address || "",
      country: MOCK_USER.shipping_address?.country || "Magyarország",
    },
  })

  function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true)
    
    // Simulate network request
    setTimeout(() => {
      // TODO: Supabase update
      console.log("Profile updated:", data)
      toast.success("Profil sikeresen frissítve", {
        description: "A személyes adataidat és a szállítási címet mentettük.",
      })
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
        
        {/* Személyes adatok szekció */}
        <div className="space-y-5 bg-background border border-border/60 p-6 sm:p-8 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold font-display tracking-tight text-foreground uppercase border-b border-border/40 pb-4">
            Személyes Adatok
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Teljes név</FormLabel>
                  <FormControl>
                    <Input className="h-11 bg-muted/40 transition-colors focus:bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">E-mail cím</FormLabel>
                  <FormControl>
                    <Input disabled readOnly className="h-11 bg-muted/30 text-muted-foreground cursor-not-allowed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="md:w-1/2 md:pr-2.5">
                <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Telefonszám</FormLabel>
                <FormControl>
                  <Input className="h-11 bg-muted/40 transition-colors focus:bg-background" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Szállítási cím szekció */}
        <div className="space-y-5 bg-background border border-border/60 p-6 sm:p-8 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold font-display tracking-tight text-foreground uppercase border-b border-border/40 pb-4">
            Szállítási Cím
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-1">
              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Irányítószám</FormLabel>
                    <FormControl>
                      <Input className="h-11 bg-muted/40 transition-colors focus:bg-background" {...field} />
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
                      <Input className="h-11 bg-muted/40 transition-colors focus:bg-background" {...field} />
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
                  <Input className="h-11 bg-muted/40 transition-colors focus:bg-background" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="md:w-1/2 md:pr-2.5">
                <FormLabel className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Ország</FormLabel>
                <FormControl>
                  <Input className="h-11 bg-muted/40 transition-colors focus:bg-background" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full sm:w-auto h-12 px-8 text-sm uppercase tracking-widest font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all touch-target"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mentés...
              </>
            ) : (
              "Változások mentése"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
