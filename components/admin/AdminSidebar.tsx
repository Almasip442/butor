"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants, Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { LayoutDashboard, Package, ShoppingCart, Tags, Menu } from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Termékek",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Rendelések",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Kategóriák",
    href: "/admin/categories",
    icon: Tags,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="space-y-4 py-4 w-full">
      <h2 className="px-4 text-lg font-semibold tracking-tight">Admin Panel</h2>
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "justify-start focus-visible:ring-primary touch-target",
              pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            <item.icon className="mr-2 h-4 w-4" aria-hidden="true" />
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-background pt-4 md:block">
        <SidebarContent />
      </aside>
      <div className="md:hidden flex items-center justify-between border-b border-border bg-background p-4 w-full shrink-0">
        <span className="font-display font-semibold uppercase tracking-widest text-lg px-2">
          Admintér
        </span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="touch-target">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Admin menü megnyitása</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80vw] max-w-sm sm:max-w-xs">
            <SheetHeader>
               <SheetTitle className="text-left font-display">Admintér</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
