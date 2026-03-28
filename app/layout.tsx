import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

// Inter — elsődleges sans-serif betűtípus
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Playfair Display — display/heading betűtípus
const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FurnSpace – Modern Bútor Webshop",
  description:
    "Fedezd fel prémium bútor kínálatunkat! Kanapék, asztalok, székek és szekrények széles választéka, kedvező áron.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hu"
      className={cn(inter.variable, playfairDisplay.variable)}
    >
      <body className="antialiased font-sans bg-background text-foreground flex flex-col min-h-screen">
        {/* Skip link — akadálymentes navigáció (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
                     focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground
                     focus:rounded focus:shadow-lg focus:outline-none"
        >
          Ugrás a tartalomra
        </a>

        <CartDrawer />
        <Header />

        <main id="main-content" className="w-full flex-1">
          {children}
        </main>

        <Footer />

        {/* Globális toast értesítések (shadcn/sonner) */}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
