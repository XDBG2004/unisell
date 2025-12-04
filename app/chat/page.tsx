import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch conversations where user is buyer OR seller
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      *,
      item:items(title, images, price),
      buyer:profiles!buyer_id(full_name),
      seller:profiles!seller_id(full_name)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching conversations:", error)
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      <div className="grid gap-4">
        {conversations && conversations.length > 0 ? (
          conversations.map((conv: any) => {
            const isBuyer = conv.buyer_id === user.id
            const otherUser = isBuyer ? conv.seller : conv.buyer
            
            return (
              <div key={conv.id} className="glass-card p-4 flex items-center gap-4 transition-all hover:border-cyan-500/50">
                {/* Item Image */}
                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                  {conv.item.images && conv.item.images[0] ? (
                    <Image 
                      src={conv.item.images[0]} 
                      alt={conv.item.title} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-xs text-muted-foreground">No Img</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{otherUser?.full_name || 'Unknown User'}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.item.title} • RM {conv.item.price}
                  </p>
                </div>

                {/* Action */}
                <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white shrink-0">
                  <Link href={`/chat/${conv.id}`}>
                    Open Chat
                  </Link>
                </Button>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="bg-muted/50 rounded-full p-6 w-fit mx-auto mb-4">
              <MessageCircle className="h-8 w-8" />
            </div>
            <p>No messages yet.</p>
            <p className="text-sm">Start chatting with sellers to make a deal!</p>
          </div>
        )}
      </div>
    </div>
  )
}
