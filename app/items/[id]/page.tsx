import { redirect, notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, MessageSquare, Flag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FavoriteButton } from "@/components/favorite-button"
import { ImageCarousel } from "@/components/image-carousel"

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch listing details
  const { data: listing, error } = await supabase
    .from("items")
    .select(
      `
      *,
      seller:profiles!seller_id(id, full_name, campus)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !listing) {
    notFound()
  }

  // Check if user has favorited this listing
  const { data: favorite } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_id", id)
    .single()

  const isFavorited = !!favorite

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `RM ${price.toFixed(2)}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isOwnListing = listing.seller_id === user.id

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <main className="container relative z-10 mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          asChild 
          variant="ghost" 
          className="mb-6 group hover:text-[#00dee8] hover:scale-105 transition-all duration-300 ease-out"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Home
          </Link>
        </Button>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg isolate">
              <CardContent className="p-0">
                <ImageCarousel images={listing.images} alt={listing.title} />
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mt-6 shadow-lg isolate">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold">Description</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">{listing.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <Card className="shadow-lg isolate">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-balance mb-2">{listing.title}</h1>
                  <p className="text-3xl font-bold text-primary">{formatPrice(listing.price)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{listing.condition}</Badge>
                  {listing.category && <Badge variant="secondary">{listing.category}</Badge>}
                  {listing.status === 'sold' && <Badge variant="destructive">SOLD</Badge>}
                </div>

                <div className="space-y-2 text-sm">
                  {listing.meetup_area && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.meetup_area}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Posted on {formatDate(listing.created_at)}</span>
                  </div>
                </div>

                {!isOwnListing && listing.status !== 'sold' && (
                  <div className="space-y-3 pt-4">
                    <Button 
                      asChild 
                      className="w-full bg-[#00dee8] hover:bg-[#00dee8] text-black font-semibold
                        shadow-lg
                        hover:shadow-[0_0_10px_rgba(0,222,232,0.5)] 
                        hover:scale-[1.02] transition-all duration-100" 
                      size="lg"
                    >
                      <Link href={`/chat/start?itemId=${listing.id}`}>
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Chat with Seller
                      </Link>
                    </Button>
                    <FavoriteButton itemId={listing.id} initialFavorited={isFavorited} />
                    
                    {/* Report Button */}
                    <Button 
                      variant="ghost" 
                      size="lg" 
                      className="w-full mt-6 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:scale-[1.02] transition-all duration-200" 
                      asChild
                    >
                      <Link href={`/report?itemId=${listing.id}`}>
                        <Flag className="mr-2 h-5 w-5" />
                        Report Listing
                      </Link>
                    </Button>
                  </div>
                )}

                {isOwnListing && (
                  <div className="space-y-3 pt-4">
                    <Button 
                      asChild 
                      className="w-full border-2 border-[#00dee8] dark:hover:border-[#00dee8] text-[#00dee8] hover:bg-[#00dee8] dark:hover:bg-[#00dee8] hover:text-black font-semibold shadow-md hover:shadow-lg hover:shadow-[#00dee8]/20 dark:hover:shadow-[#00dee8]/20 hover:scale-[1.02] transition-all duration-100" 
                      variant="outline"
                      size="lg"
                    >
                      <Link href={`/sell?edit=${listing.id}`}>Edit Listing</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="shadow-lg isolate">
              <CardContent className="p-6">
                <h3 className="mb-4 font-bold">Seller Information</h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {listing.seller.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{listing.seller.full_name}</p>
                    <p className="text-sm text-muted-foreground">{listing.seller.campus} Campus</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
