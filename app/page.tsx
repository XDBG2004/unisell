
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/utils/supabase/server"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Fetch items
    const { data: items } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })

    // Dashboard View
    return (
      <div className="min-h-screen text-foreground">
        {/* Navbar handled by layout */}

        {/* Main Content */}
        <main className="container mx-auto p-4 space-y-8">
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Welcome back, <span className="text-[#00adb5] dark:text-[#00dee8]">{user.email}</span>!
            </h1>
            <p className="text-muted-foreground text-lg">
              Explore the latest items from your campus.
            </p>
          </div>

          {/* Items Grid */}
          {items && items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item: any) => (
                <Link key={item.id} href={`/items/${item.id}`} className="block h-full group">
                  <div className="glass-card flex flex-col overflow-hidden h-full transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10">
                    {/* Image */}
                    <div className="aspect-square relative bg-muted overflow-hidden">
                      {item.images && item.images[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 flex flex-col flex-grow gap-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg truncate group-hover:text-[#00adb5] transition-colors" title={item.title}>{item.title}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                          {item.category}
                        </span>
                      </div>
                      
                      <p className="font-bold text-xl text-[#00adb5] dark:text-[#00dee8]">
                        RM {item.price.toFixed(2)}
                      </p>
                      
                      <div className="mt-auto pt-2">
                         <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-700 text-white pointer-events-none group-hover:bg-cyan-500">
                           <span>View Details</span>
                         </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="bg-muted/50 rounded-full p-6">
                <Plus className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No items yet</h3>
              <p className="text-muted-foreground">Be the first to sell something on UniSell!</p>
              <Button asChild className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Link href="/sell">Sell Item</Link>
              </Button>
            </div>
          )}
        </main>
      </div>
    )
  }

  // Landing Page View (No Session)
  return (
    <div className="min-h-screen flex flex-col justify-between">

      {/* ThemeToggle handled by layout Navbar */}

      {/* Main Section */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-2xl">
          {/* Logo and Branding */}
          <div className="animate-fade-in-up space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="bg-transparent rounded-2xl p-1">
                 <Image
                  src="/logo.png"
                  alt="UniSell Logo"
                  width={86}
                  height={86}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-balance bg-gradient-to-r from-[#00adb5] to-[#00fff0] dark:from-[#00dee8] dark:to-[#00adb5] bg-clip-text text-transparent">
              UniSell
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-xl text-gray-600 dark:text-gray-300 text-balance animate-fade-in-up animate-delay-200 leading-relaxed">
            Buy, Sell & Connect with Verified USM Students.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center animate-fade-in-up animate-delay-400">
            <Button
              asChild
              size="lg"
              variant="glowalt"
              className="text-lg px-8 py-6 rounded-xl"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="glow"
              className="text-lg px-8 py-6 rounded-xl"
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-fade-in-up animate-delay-400">
            Exclusive marketplace for{" "}
            <span className="font-semibold text-[#00adb5] dark:text-[#00dee8]">@student.usm.my</span> verified students
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t border-gray-200 dark:border-gray-800 py-8 
        text-gray-600 dark:text-gray-400 transition-colors duration-500"
      >
        <div className="container mx-auto px-4 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-semibold text-[#00adb5] dark:text-[#00dee8]">
              UniSell
            </span> - Universiti Sains Malaysia
          </p>
        </div>
      </footer>
    </div>
  )
}
