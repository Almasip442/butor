import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative w-full bg-secondary/20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center py-16 lg:py-24 min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh]">
          
          {/* Szöveges tartalom */}
          <div className="flex flex-col justify-center max-w-xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out relative">
            <p className="text-accent uppercase tracking-[0.2em] text-[10px] sm:text-xs font-bold mb-6">
              Tavaszi Kollekció
            </p>
            
            <h1 className="hero-title text-foreground mb-6">
              Emeld új szintre <br className="hidden sm:block" />
              <span className="text-accent italic font-normal">az Élettered</span>
            </h1>
            
            <p className="text-muted-foreground sm:text-lg leading-relaxed mb-10 max-w-md">
              Gondosan válogatott kollekcióink ötvözik a modern minimalizmust az organikus melegséggel. Fedezd fel otthonod új arcát kézműves bútorainkkal.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-sm tracking-wide font-bold uppercase touch-target shadow-lg shadow-primary/20">
                <Link href="/products">Termékek böngészése</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-sm tracking-wide font-bold uppercase border-border/80 bg-transparent hover:bg-background hover:text-primary touch-target">
                <Link href="#">Rólunk</Link>
              </Button>
            </div>
          </div>

          {/* Kép bemutató (opcionális dekorációval) */}
          <div className="relative h-[350px] sm:h-[450px] lg:h-[600px] w-full animate-in fade-in slide-in-from-right-8 duration-1000 ease-out delay-200 fill-mode-both">
             {/* Dekoratív íves háttér elem */}
             <div className="absolute top-0 right-0 w-[80%] h-full bg-secondary/40 rounded-t-full -z-10 blur-3xl opacity-50" />
             
             <div className="absolute inset-0 lg:inset-y-8 lg:left-8 bg-muted rounded-t-full lg:rounded-t-[200px] lg:rounded-b-2xl overflow-hidden shadow-2xl ring-1 ring-border/50">
               <Image
                 src="/images/categories/kanapek.webp"
                 alt="Modern skandináv stílusú nappali egy kényelmes kanapéval"
                 fill
                 className="object-cover object-center hover:scale-105 transition-transform duration-1000"
                 priority
                 sizes="(max-width: 1024px) 100vw, 50vw"
               />
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
