"use client"

import React from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  /** A gyermek komponensek, amelyeket ez a wrapper véd */
  children: React.ReactNode
  /** Egyéni hibaüzenet cím (opcionális) */
  title?: string
  /** Egyéni hibaüzenet szöveg (opcionális) */
  description?: string
  /** "Újrapróbál" gomb megjelenítése (alapértelmezett: true) */
  showRetry?: boolean
  /** Fallback UI a hibaüzenet helyett (teljesen egyéni) */
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * 🟨 Kliens-oldali hibakereső React class component.
 * Elkapja az alatta lévő komponenshibákat és barátságos hibaüzenettel helyettesíti.
 *
 * @example
 * <ErrorBoundary title="Nem sikerült betölteni a termékeket">
 *   <ProductList />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  static defaultProps = {
    title: "Valami hiba történt",
    description: "Váratlan hiba lépett fel. Kérjük, próbálja meg újra.",
    showRetry: true,
  }

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Éles környezetben ez az error.captureError() / Sentry hívásakor lenne
    console.error("[ErrorBoundary] Elkapott hiba:", error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    const { hasError, error } = this.state
    const { children, title, description, showRetry, fallback } = this.props

    if (!hasError) {
      return children
    }

    // Teljesen egyéni fallback UI
    if (fallback) {
      return fallback
    }

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="w-full rounded-xl p-4"
      >
        <Alert variant="destructive" className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 size-5 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <div className="flex-1 space-y-1">
              <AlertTitle className="text-destructive font-semibold">
                {title}
              </AlertTitle>
              <AlertDescription className="text-sm">
                {description}
              </AlertDescription>

              {/* Fejlesztői részletek (csak dev módban) */}
              {process.env.NODE_ENV === "development" && error && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-destructive/70 hover:text-destructive">
                    Technikai részletek
                  </summary>
                  <pre className="mt-1 overflow-auto rounded bg-destructive/5 p-2 text-xs text-destructive/80 whitespace-pre-wrap">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </details>
              )}
            </div>
          </div>

          {showRetry && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleRetry}
                className="touch-target gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                Újrapróbál
              </Button>
            </div>
          )}
        </Alert>
      </div>
    )
  }
}
