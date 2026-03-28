import { type LucideIcon, PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateAction {
  /** A gomb szövege */
  label: string
  /** Kattintás eseménykezelő */
  onClick?: () => void
  /** Link href (onClick helyett) */
  href?: string
}

interface EmptyStateProps {
  /** Elsődleges cím (pl. "Nincs találat") */
  title: string
  /** Leíró szöveg (pl. "Próbálj más keresési feltételt!") */
  description?: string
  /** Lucide ikon — alapértelmezett: PackageSearch */
  icon?: LucideIcon
  /** Opcionális CTA gomb */
  action?: EmptyStateAction
  /** Kiegészítő CSS osztályok */
  className?: string
}

/**
 * 🟩 Szerver-kompatibilis üres állapot jelző komponens.
 * Megjelenik, ha nincs megjeleníthető adat (üres lista, 0 találat, stb.).
 *
 * @example
 * <EmptyState
 *   title="A kosár üres"
 *   description="Helyezz termékeket a kosárba a böngészéshez!"
 *   action={{ label: "Termékek böngészése", href: "/products" }}
 * />
 */
export function EmptyState({
  title,
  description,
  icon: Icon = PackageSearch,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-label={title}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl",
        "border border-dashed border-border bg-muted/40",
        "px-6 py-14 text-center",
        className
      )}
    >
      {/* Ikon */}
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-8 opacity-70" aria-hidden="true" />
      </div>

      {/* Szöveg */}
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Opcionális CTA gomb */}
      {action && (
        action.href ? (
          <a href={action.href}>
            <Button variant="default" size="sm" className="mt-1 touch-target">
              {action.label}
            </Button>
          </a>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="mt-1 touch-target"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )
      )}
    </div>
  )
}
