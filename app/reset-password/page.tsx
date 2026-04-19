'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

const resetSchema = z
  .object({
    password: z.string().min(8, "A jelszónak legalább 8 karakterből kell állnia"),
    confirmPassword: z.string().min(8, "A jelszónak legalább 8 karakterből kell állnia"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "A két jelszó nem egyezik meg",
    path: ["confirmPassword"],
  })

type ResetFormValues = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSession, setHasSession] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session)
      setIsCheckingSession(false)
    })
  }, [])

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: ResetFormValues) {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    setIsSuccess(true)
    setIsLoading(false)

    setTimeout(() => {
      router.push("/login")
    }, 2000)
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-20 pb-24">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-sm p-6 sm:p-8 animate-in zoom-in-95 duration-500">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground">
              Jelszó visszaállítása
            </h1>
            <p className="text-muted-foreground text-sm">
              Add meg az új jelszavadat.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSuccess ? (
            <Alert>
              <AlertDescription>
                Jelszó sikeresen megváltoztatva! Átirányítás a bejelentkezési oldalra...
              </AlertDescription>
            </Alert>
          ) : !hasSession ? (
            <Alert variant="destructive">
              <AlertDescription>
                Érvénytelen vagy lejárt visszaállítási link. Kérjük, kérjen új linket.
              </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                        Új jelszó
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
                  name="confirmPassword"
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

                <Button
                  type="submit"
                  className="w-full h-11 font-semibold text-base shadow-md shadow-primary/10 hover:-translate-y-0.5 transition-all mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mentés...
                    </>
                  ) : (
                    "Jelszó mentése"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  )
}
