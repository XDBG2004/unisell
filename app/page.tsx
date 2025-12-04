import Link from "next/link"
import { Item } from "@/types"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, Smartphone, Shirt, Armchair, Book, Home as HomeIcon, Car, Package } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/utils/supabase/server"
import { AnnouncementBar } from "@/components/announcement-bar"
import { CategoryCard } from "@/components/category-card"
import { ItemCard } from "@/components/item-card"
import { LandingPage } from "@/components/landing-page"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default async function Home({ searchParams }: { searchParams: Promise<{ search?: string, category?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Fetch profile for verification status
    const { data: profile } = await supabase
      .from('profiles')
      .select('verification_status, campus')
      .eq('id', user.id)
      .single()

    const isVerified = profile?.verification_status === 'verified'

    // If NOT verified, show Welcome Banner
    if (!isVerified) {
      return (
        <div className="min-h-screen text-foreground flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-8 text-center space-y-6">
            <div className="bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
            </div>
            <h1 className="text-3xl font-bold">Welcome to UniSell!</h1>
            <p className="text-muted-foreground text-lg">
              The exclusive marketplace for USM students. To start buying and selling, please complete your verification.
            </p>
            <div className="pt-4">
              <Button asChild size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white px-8">
                <Link href="/onboarding">Complete Verification</Link>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Parse Search Params
    const search = (await searchParams)?.search || ''
    const category = (await searchParams)?.category || 'All'

    // Base Query
    let query = supabase
      .from('items')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    // Apply Filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    const { data: items } = await query.returns<Item[]>()

    const categories = [
      "Electronics", 
      "Fashion", 
      "Furniture & Living", 
      "Books & Stationery", 
      "Room Rental", 
      "Vehicles", 
      "Others"
    ]

    const CATEGORY_ICONS: Record<string, React.ReactNode> = {
      "Electronics": <Smartphone className="h-8 w-8" />,
      "Fashion": <Shirt className="h-8 w-8" />,
      "Furniture & Living": <Armchair className="h-8 w-8" />,
      "Books & Stationery": <Book className="h-8 w-8" />,
      "Room Rental": <HomeIcon className="h-8 w-8" />,
      "Vehicles": <Car className="h-8 w-8" />,
      "Others": <Package className="h-8 w-8" />
    }

    // Fetch Category Counts via RPC
    const { data: countsData } = await supabase.rpc('get_category_counts')
    
    // Merge Data
    const categoryCounts = categories.map(cat => {
      const match = countsData?.find((c: any) => c.category === cat)
      return {
        name: cat,
        count: match ? match.count : 0,
        icon: CATEGORY_ICONS[cat]
      }
    })

    return (
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-linear-to-r from-cyan-600 to-cyan-400 dark:from-cyan-900 dark:to-cyan-700 text-white py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <div className="text-center flex-1">
                  <h1 className="text-4xl font-bold mb-4">Welcome to UniSell</h1>
                  <p className="text-lg opacity-90">Buy and sell items within your {profile?.campus || 'USM'} Campus community</p>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </section>

          {/* Categories Carousel */}
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Browse by Category</h2>
              <div className="w-full max-w-6xl mx-auto px-4">
                <Carousel
                  opts={{
                    align: "center",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <div className="flex items-center gap-4">
                    <CarouselPrevious className="hidden md:flex static translate-y-0 h-12 w-12 border-2 border-primary/20 hover:bg-primary hover:text-white transition-colors" />
                    
                    <div className="flex-1 overflow-hidden">
                      <CarouselContent className="-ml-4 items-stretch">
                        {categoryCounts.map((category) => (
                          <CarouselItem key={category.name} className="basis-[75%] md:basis-[45%] lg:basis-[25%] pl-4 h-full">
                            <div className="p-1 h-full">
                              <CategoryCard name={category.name} count={category.count} icon={category.icon} />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </div>

                    <CarouselNext className="hidden md:flex static translate-y-0 h-12 w-12 border-2 border-primary/20 hover:bg-primary hover:text-white transition-colors" />
                  </div>
                </Carousel>
              </div>
            </div>
          </section>

          {/* Recent Listings */}
          <section className="py-12 container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Recent Listings</h2>
              <div className="flex gap-2">
                 {search && (
                    <Button variant="outline" asChild>
                       <Link href="/">Clear Filters</Link>
                    </Button>
                 )}
                 {category !== 'All' && (
                    <Button variant="outline" asChild>
                       <Link href="/">Clear Category</Link>
                    </Button>
                 )}
              </div>
            </div>

            {items && items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <ItemCard 
                    key={item.id} 
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    condition={item.condition}
                    images={item.images}
                    category={item.category}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No items found matching your criteria.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/">Clear all filters</Link>
                </Button>
              </div>
            )}
          </section>
        </main>

        <footer className="bg-muted py-8 border-t border-border/40">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>&copy; 2024 UniSell. Built for USM Students.</p>
          </div>
        </footer>
      </div>
    )
  }

  // Fallback for non-logged in users (Landing Page)
  return <LandingPage />
}
