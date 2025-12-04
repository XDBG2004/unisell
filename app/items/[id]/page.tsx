import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle, MapPin, Tag, Info } from "lucide-react"

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item, error } = await supabase
    .from('items')
    .select('*, profiles:seller_id(full_name, campus)')
    .eq('id', id)
    .single()

  if (error || !item || item.status === 'deleted') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Item Unavailable</h1>
        <p className="text-muted-foreground">The item you are looking for has been removed by the seller.</p>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <Button asChild variant="ghost" className="mb-6 gap-2 pl-0 hover:bg-transparent hover:text-cyan-500">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left Column: Image */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-muted/20 min-h-[400px]">
             {item.images && item.images[0] ? (
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No Image Available
                </div>
              )}
          </div>

          {/* Right Column: Details */}
          <div className="p-6 md:p-10 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-medium border border-cyan-500/20">
                    {item.category}
                 </span>
                 {item.sub_category && (
                   <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border">
                      {item.sub_category}
                   </span>
                 )}
                 <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border ml-auto">
                    {item.condition}
                 </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{item.title}</h1>
              <p className="text-3xl font-bold text-[#00adb5] dark:text-[#00dee8]">
                RM {item.price.toFixed(2)}
              </p>
            </div>

            <div className="space-y-4">
               <div className="flex items-start gap-3 text-muted-foreground">
                  <Info className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="leading-relaxed whitespace-pre-wrap">{item.description}</p>
               </div>

               <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-5 w-5 shrink-0" />
                  <span>Meetup: <span className="text-foreground font-medium">{item.meetup_area}</span></span>
               </div>
               
               <div className="flex items-center gap-3 text-muted-foreground">
                  <Tag className="h-5 w-5 shrink-0" />
                  <span>Seller: <span className="text-foreground font-medium">{item.profiles?.full_name || 'Unknown'}</span> ({item.profiles?.campus || 'Main Campus'})</span>
               </div>
            </div>

            <div className="mt-auto pt-6 border-t border-border/50">
               <Button asChild size="lg" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-lg h-12 gap-2 shadow-lg shadow-cyan-500/20">
                  <Link href={`/chat/start?itemId=${item.id}`}>
                    <MessageCircle className="h-5 w-5" />
                    Chat with Seller
                  </Link>
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
