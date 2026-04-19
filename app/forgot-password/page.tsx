'use client'

import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setIsLoading(false)
      return
    }

    setIsSubmitted(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-20 pb-24">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-sm p-6 sm:p-8 animate-in zoom-in-95 duration-500">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground">
              Elfelejtett jelszó
            </h1>
            <p className="text-muted-foreground text-sm">
              Add meg az e-mail címedet és küldünk egy visszaállítási linket.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSubmitted ? (
            <Alert>
              <AlertDescription>
                Ha a megadott email cím regisztrált, hamarosan megkapja a visszaállító linket.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-muted-foreground font-semibold text-xs uppercase tracking-wider"
                >
                  E-mail cím
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="pelda@email.hu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-muted/40 focus:bg-background transition-colors"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-semibold text-base shadow-md shadow-primary/10 hover:-translate-y-0.5 transition-all mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Küldés...
                  </>
                ) : (
                  "Link küldése"
                )}
              </Button>
            </form>
          )}

          <div className="text-center text-sm text-muted-foreground pt-2">
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Vissza a bejelentkezéshez
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
