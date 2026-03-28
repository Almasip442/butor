import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

type SpinnerSize = "sm" | "md" | "lg"

interface LoadingSpinnerProps {
  /** Megjelenítési méret: sm (kis), md (közepes, alapértelmezett), lg (nagy) */
  size?: SpinnerSize
  /** Kiegészítő CSS osztályok a külső konténerre */
  className?: string
  /** Screenreader szöveg (alapértelmezett: "Betöltés...") */
  label?: string
}

const containerSizes: Record<SpinnerSize, string> = {
  sm: "gap-2 p-3",
  md: "gap-3 p-6",
  lg: "gap-4 p-10",
}

const skeletonSizes: Record<SpinnerSize, { header: string; line: string; short: string }> = {
  sm: {
    header: "h-3 w-28",
    line:   "h-2 w-40",
    short:  "h-2 w-32",
  },
  md: {
    header: "h-4 w-40",
    line:   "h-3 w-56",
    short:  "h-3 w-44",
  },
  lg: {
    header: "h-5 w-56",
    line:   "h-4 w-72",
    short:  "h-4 w-60",
  },
}

/**
 * 🟩 Szerver/Kliens kompatibilis loading indikátor.
 * Skeleton animáció-t jelenít meg, míg az adatok betöltődnek.
 *
 * @example
 * <LoadingSpinner />
 * <LoadingSpinner size="lg" label="Termékek betöltése..." />
 */
export function LoadingSpinner({
  size = "md",
  className,
  label = "Betöltés...",
}: LoadingSpinnerProps) {
  const s = skeletonSizes[size]

  return (
    <div
      role="status"
      aria-label={label}
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center w-full",
        containerSizes[size],
        className
      )}
    >
      {/* Fő kártya skeleton */}
      <div className="w-full max-w-sm space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
        {/* Avatar + fejléc sor */}
        <div className="flex items-center gap-3">
          <Skeleton className={cn("rounded-full shrink-0", size === "sm" ? "size-8" : size === "md" ? "size-10" : "size-12")} />
          <div className="flex-1 space-y-2">
            <Skeleton className={s.header} />
            <Skeleton className={s.short} />
          </div>
        </div>

        {/* Tartalom sorok */}
        <div className="space-y-2 pt-1">
          <Skeleton className={cn(s.line, "w-full")} />
          <Skeleton className={cn(s.line, "w-4/5")} />
          <Skeleton className={cn(s.short, "w-3/5")} />
        </div>

        {/* Gomb placeholder */}
        <Skeleton className={cn(size === "sm" ? "h-6 w-20" : size === "md" ? "h-8 w-28" : "h-10 w-36", "rounded-lg")} />
      </div>

      {/* Screenreader szöveg */}
      <span className="sr-only">{label}</span>
    </div>
  )
}
