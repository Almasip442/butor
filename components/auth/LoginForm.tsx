"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
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
import { Separator } from "@/components/ui/separator"

const loginSchema = z.object({
  email: z.string().email("Érvénytelen e-mail cím"),
  password: z.string().min(6, "A jelszónak legalább 6 karakterből kell állnia"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(data: LoginFormValues) {
    setIsLoading(true)

    // TODO: Supabase signIn
    console.log("Login data:", data)

    setTimeout(() => {
      setIsLoading(false)
      router.push("/")
    }, 1500)
  }

  function handleGoogleLogin() {
    setIsLoading(true)
    // TODO: Supabase Google OAuth signIn
    console.log("Google login clicked")
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground">
          Bejelentkezés
        </h1>
        <p className="text-muted-foreground text-sm">
          Lépj be a fiókodba a vásárlás folytatásához
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                    Jelszó
                  </FormLabel>
                  <Link
                    href="#"
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Elfelejtett jelszó?
                  </Link>
                </div>
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

          <Button
            type="submit"
            className="w-full h-11 font-semibold text-base shadow-md shadow-primary/10 hover:-translate-y-0.5 transition-all mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Belépés...
              </>
            ) : (
              "Bejelentkezés"
            )}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground font-medium">
            kattints vagy
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 font-medium bg-background hover:bg-muted/50 transition-colors"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
        </svg>
        Folytatás Google fiókkal
      </Button>

      <div className="text-center text-sm text-muted-foreground pt-4">
        Még nincs fiókod?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline underline-offset-4">
          Regisztrálj
        </Link>
      </div>
    </div>
  )
}
