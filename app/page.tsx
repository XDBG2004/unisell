import Link from "next/link"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, Smartphone, Shirt, Armchair, Book, Home as HomeIcon, Car, Package } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/utils/supabase/server"
import { AnnouncementBar } from "@/components/announcement-bar"
import { CategoryRail } from "@/components/category-rail"
import { LandingPage } from "@/components/landing-page"
import { SearchBar } from "@/components/search-bar"
import { ItemGridSkeleton } from "@/components/skeletons/item-grid-skeleton"
import { ItemsGrid } from "@/components/items-grid"



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
        <div className="min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center p-4 text-foreground">
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

    const CATEGORIES_CONFIG: Record<string, { icon: React.ReactNode, shortName: string, color: string }> = {
      "Electronics": { 
        icon: <Smartphone className="h-8 w-8 sm:h-10 sm:w-10" />, 
        shortName: "Electronics", 
        color: "blue" 
      },
      "Fashion": { 
        icon: <Shirt className="h-8 w-8 sm:h-10 sm:w-10" />, 
        shortName: "Fashion", 
        color: "pink" 
      },
      "Furniture & Living": { 
        icon: <Armchair className="h-8 w-8 sm:h-10 sm:w-10" />, 
        shortName: "Furniture", 
        color: "amber" 
      },
      "Books & Stationery": { 
        icon: <Book className="h-8 w-8 sm:h-10 sm:w-10" />, 
        shortName: "Books", 
        color: "emerald" 
      },
      "Room Rental": { 
        icon: <HomeIcon className="h-8 w-8 sm:h-10 sm:w-10" />, 
        shortName: "Room Rental", 
        color: "violet" 
      },
      "Vehicles": { 
        icon: <Car className="h-8 w-8 sm:h-10 sm:w-10" />, 
        shortName: "Vehicles", 
        color: "red" 
      },
      "Others": { 
        icon: <Package className="h-8 w-8 sm:h-10 sm:w-10" />, 
        shortName: "Others", 
        color: "zinc" 
      }
    }

    // Fetch Category Counts via RPC
    const { data: countsData } = await supabase.rpc('get_category_counts')
    
    // Merge Data
    const categoryCounts = Object.entries(CATEGORIES_CONFIG).map(([name, config]) => {
      const match = countsData?.find((c: any) => c.category === name)
      return {
        name,
        count: match ? match.count : 0,
        ...config
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

          {/* Search Bar Section */}
          <section className="py-6 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto">
                <SearchBar />
              </div>
            </div>
          </section>

          {/* Categories Scroll Rail */}
          <section className="py-10 pb-2 w-full">
            <div className="container mx-auto px-4 mb-2">
              <div className="absolute left-[10vw] pb-6">
                <h2 className="text-2xl font-[TitleFont] select-none">Browse by Category</h2>
              </div>
            </div>
              
            <div className="w-full flex justify-center mt-8">
              <div className="w-full mx-auto justify-center">
                <CategoryRail categories={categoryCounts} />
              </div>
            </div>
          </section>

          {/* Recent Listings */}
          <section className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <div className="absolute left-[10vw]">
                <h2 className="text-2xl font-[TitleFont] select-none">
                  Recent Listings
                </h2>
              </div>
            </div>


            <Suspense fallback={<ItemGridSkeleton />}>
              <ItemsGrid />
            </Suspense>

          </section>
        </main>

        <footer className="bg-muted py-8 border-t border-border/40">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>&copy; 2025 UniSell. Built for USM Students.</p>
          </div>
        </footer>
      </div>
    )
  }

  // Fallback for non-logged in users (Landing Page)
  return <LandingPage />
}
