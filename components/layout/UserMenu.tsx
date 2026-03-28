"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Package, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { MOCK_USER } from "@/lib/mock-data"

export function UserMenu() {
  const user = MOCK_USER

  // Inicialék generálása
  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Felhasználói menü – ${user.full_name}`}
          className="touch-target inline-flex items-center gap-2 justify-center rounded-full md:rounded-md md:px-2 md:py-1 text-foreground hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="h-8 w-8 md:h-7 md:w-7">
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] md:text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block text-sm font-medium">
            Profil
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-foreground">{user.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            <span>Profilom</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account/orders" className="flex items-center gap-2 cursor-pointer">
            <Package className="h-4 w-4" />
            <span>Rendeléseim</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>Beállítások</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer">
          {/* TODO: Supabase signOut */}
          <LogOut className="h-4 w-4" />
          <span>Kijelentkezés</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
