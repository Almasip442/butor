"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuantitySelectorProps {
  /** Jelenlegi mennyiség értéke */
  value: number
  /** Értékváltozás eseménykezelője */
  onChange: (value: number) => void
  /** Minimum érték (alapértelmezett: 1) */
  min?: number
  /** Maximum érték (pl. készlet alapján) */
  max?: number
  /** Letiltott állapot */
  disabled?: boolean
  /** Kiegészítő CSS osztályok */
  className?: string
}

/**
 * 🟨 Kliens — Mennyiség kiválasztó komponens.
 * − / + gombok, min 44×44px touch target.
 *
 * @example
 * <QuantitySelector value={qty} onChange={setQty} max={product.stock_quantity} />
 */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  className,
}: QuantitySelectorProps) {
  const canDecrement = value > min
  const canIncrement = max === undefined || value < max

  const decrement = () => {
    if (canDecrement) onChange(value - 1)
  }

  const increment = () => {
    if (canIncrement) onChange(value + 1)
  }

  return (
    <div
      role="group"
      aria-label="Mennyiség kiválasztó"
      className={cn(
        "inline-flex items-center gap-0 rounded-lg border border-border bg-background",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Csökkentő gomb */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={decrement}
        disabled={disabled || !canDecrement}
        aria-label="Mennyiség csökkentése"
        className={cn(
          // touch-target: min 44×44px (WCAG 2.5.5)
          "touch-target size-11 rounded-r-none border-r border-border",
          "hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed",
          "transition-colors"
        )}
      >
        <Minus className="size-4" aria-hidden="true" />
      </Button>

      {/* Értékkijelző */}
      <output
        aria-live="polite"
        aria-label={`Jelenlegi mennyiség: ${value}`}
        className="min-w-[3rem] select-none text-center text-sm font-semibold tabular-nums text-foreground"
      >
        {value}
      </output>

      {/* Növelő gomb */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={increment}
        disabled={disabled || !canIncrement}
        aria-label="Mennyiség növelése"
        className={cn(
          "touch-target size-11 rounded-l-none border-l border-border",
          "hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed",
          "transition-colors"
        )}
      >
        <Plus className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
