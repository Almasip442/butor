"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

const registerSchema = z.object({
  full_name: z.string().min(2, "A név megadása kötelező"),
  email: z.string().email("Érvénytelen e-mail cím"),
  password: z.string().min(6, "A jelszónak legalább 6 karakterből kell állnia"),
  password_confirmation: z.string().min(6, "A jelszó megerősítése kötelező"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "A jelszavak nem egyeznek",
  path: ["password_confirmation"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  })

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    toast.success("Sikeres regisztráció!")
    router.push('/login')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground">
          Regisztráció
        </h1>
        <p className="text-muted-foreground text-sm">
          Hozd létre saját egyedi FurnSpace fiókod
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                  Teljes név
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Kovács Anna"
                    className="h-11 bg-muted/40 focus:bg-background transition-colors"
                    {...field}
                  />
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
                <FormLabel className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                  E-mail cím
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="pelda@email.hu"
                    type="email"
                    className="h-11 bg-muted/40 focus:bg-background transition-colors"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                    Jelszó
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      className="h-11 bg-muted/40 focus:bg-background transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                    Jelszó megerősítése
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      className="h-11 bg-muted/40 focus:bg-background transition-colors"
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
            className="w-full h-11 font-semibold text-base shadow-md shadow-primary/10 hover:-translate-y-0.5 transition-all mt-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regisztráció...
              </>
            ) : (
              "Fiók létrehozása"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground pt-4">
        Már van fiókod?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
          Lépj be
        </Link>
      </div>
    </div>
  )
}
