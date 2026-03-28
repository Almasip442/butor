import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Instagram, Facebook } from "lucide-react"

// Pinterest SVG (lucide-react nem tartalmazza)
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.853 0 1.267.641 1.267 1.408 0 .858-.546 2.14-.828 3.33-.236.995.499 1.806 1.476 1.806 1.772 0 3.137-1.868 3.137-4.566 0-2.387-1.715-4.057-4.163-4.057-2.837 0-4.5 2.127-4.5 4.327 0 .856.33 1.775.741 2.278a.3.3 0 0 1 .069.286c-.076.314-.244.995-.277 1.134-.044.183-.146.222-.337.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
    </svg>
  )
}

const FOOTER_LINKS = {
  collections: {
    label: "Kollekciók",
    links: [
      { href: "/products?category=kanapek", label: "Kanapék" },
      { href: "/products?category=asztalok", label: "Asztalok" },
      { href: "/products?category=szekek", label: "Székek" },
      { href: "/products?category=szekrenyek", label: "Szekrények" },
      { href: "/products?category=agyak", label: "Ágyak" },
      { href: "/products?category=polcok", label: "Polcok" },
    ],
  },
  about: {
    label: "Rólunk",
    links: [
      { href: "#", label: "Cégünkről" },
      { href: "#", label: "Fenntarthatóság" },
      { href: "#", label: "Kézművesség" },
      { href: "#", label: "Showroom" },
    ],
  },
  support: {
    label: "Ügyfélszolgálat",
    links: [
      { href: "#", label: "Szállítás & Visszaáru" },
      { href: "#", label: "Gondozási útmutató" },
      { href: "#", label: "GYIK" },
      { href: "#", label: "Kapcsolat" },
    ],
  },
}

const SOCIAL_LINKS = [
  {
    href: "#",
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: "#",
    label: "Facebook",
    icon: Facebook,
  },
  {
    href: "#",
    label: "Pinterest",
    icon: PinterestIcon,
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border/60 mt-auto">
      {/* — Fő tartalom — */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── Oszlop 1: Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-block font-display text-xl font-bold text-foreground hover:text-primary transition-colors mb-3"
              aria-label="FurnSpace – Főoldal"
            >
              FurnSpace
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Időtlen dizájn, fenntartható anyagok és kivételes kézművesség. Mi olyan tereket alkotunk, amelyekben otthon érzed magad.
            </p>

            {/* Social ikonok */}
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="touch-target inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Oszlop 2-4: Navigáció ── */}
          {Object.entries(FOOTER_LINKS).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">
                {section.label}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center min-h-[44px] py-2 sm:min-h-0 sm:py-0 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* — Elválasztó + Copyright sor — */}
      <Separator />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground text-center sm:text-left">
          <p className="min-h-[44px] sm:min-h-0 flex items-center">
            &copy; {currentYear} FurnSpace. Minden jog fenntartva.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="#" className="inline-flex items-center min-h-[44px] sm:min-h-0 hover:text-foreground transition-colors">
              Adatvédelem
            </Link>
            <Link href="#" className="inline-flex items-center min-h-[44px] sm:min-h-0 hover:text-foreground transition-colors">
              Felhasználási feltételek
            </Link>
            <Link href="#" className="inline-flex items-center min-h-[44px] sm:min-h-0 hover:text-foreground transition-colors">
              Sütik
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
