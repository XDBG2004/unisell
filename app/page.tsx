import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="relative w-[200px] h-[200px]">
           {/* Placeholder for logo.png. Using a text fallback if image missing for now, or assume public/logo.png exists */}
           {/* Since user provided logo.png is mentioned in PRD but not present, I will use a placeholder or text */}
           <div className="flex items-center justify-center w-full h-full border-2 border-primary rounded-full">
             <span className="text-4xl font-bold text-primary">UniSell</span>
           </div>
           {/* Uncomment when logo.png is available
           <Image
             src="/logo.png"
             alt="UniSell Logo"
             fill
             className="object-contain"
             priority
           />
           */}
        </div>

        {/* Spacing is handled by gap-8 */}

        {/* Button Group */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
            <Link href="/sign-up">Sign Up</Link>
          </Button>
          <Button asChild variant="outline" className="w-full" size="lg">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
