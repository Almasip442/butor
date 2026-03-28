import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "404 - Az oldal nem található | FurnSpace",
  description: "A keresett oldal nem található a FurnSpace webshopban.",
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-8xl md:text-9xl font-bold font-display text-primary tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Az oldal nem található
        </h2>
      </div>
      <p className="text-muted-foreground max-w-[500px] text-lg">
        Sajnáljuk, de az általad keresett oldal nem létezik. Lehet, hogy elgépelted a címet, 
        vagy a link már nem él.
      </p>
      <Button asChild size="lg" className="mt-8 touch-target h-12 px-8">
        <Link href="/">
          Vissza a főoldalra
        </Link>
      </Button>
    </div>
  );
}
