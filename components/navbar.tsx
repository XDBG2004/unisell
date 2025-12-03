import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { Input } from "@/components/ui/input"

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 font-bold text-xl text-[#00adb5] dark:text-[#00dee8]">
          <Link href="/" className="flex items-center gap-2">
            <span>UniSell</span>
          </Link>
        </div>

        {user ? (
          <>
            {/* Center: Search */}
             <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search items..."
                    className="w-full pl-8 bg-background h-9"
                  />
                </div>
             </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm" className="gap-2 border-cyan-500/50 hover:bg-cyan-500/10">
                <Link href="/sell">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Sell Item</span>
                </Link>
              </Button>
              <ThemeToggle />
              <UserNav />
            </div>
          </>
        ) : (
          /* Not Logged In */
          <div className="flex items-center gap-4">
             <ThemeToggle />
             <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign In</Link>
             </Button>
             <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Link href="/signup">Sign Up</Link>
             </Button>
          </div>
        )}
      </div>
    </header>
  )
}
