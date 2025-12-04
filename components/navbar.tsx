import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, Heart, Plus } from "lucide-react"
import { SearchBar } from "@/components/search-bar"
import { UserNav } from "@/components/user-nav"

interface NavbarProps {
  user?: {
    email?: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  } | null
}

export function Navbar({ user }: NavbarProps) {
  if (!user) return null

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold text-[#00adb5] dark:text-[#00dee8]">UniSell</div>
        </Link>

        {/* Center: SearchBar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <SearchBar />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Trigger (Optional, if SearchBar is hidden on mobile) */}
          <div className="md:hidden">
             {/* You might want a search icon here for mobile if SearchBar is hidden */}
          </div>

          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild className="relative h-9 w-9 rounded-x text-foreground hover:bg-[#00dee8]! hover:text-black! transition-colors cursor-pointer">
                <Link href="/chat">
                  <MessageSquare className="h-5 w-5" />
                  <span className="sr-only">Chat</span>
                </Link>
              </Button>

              <Button variant="ghost" size="icon" asChild className="relative h-9 w-9 rounded-x text-foreground hover:bg-[#00dee8]! hover:text-black! transition-colors cursor-pointer">
                <Link href="/favorites">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Favorites</span>
                </Link>
              </Button>

              <Button variant="pureglow" size="m" asChild className="hidden sm:flex text-black">
                <Link href="/sell">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Item
                </Link>
              </Button>

              <UserNav user={user} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}
