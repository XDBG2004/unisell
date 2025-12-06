import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper"

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch conversations with latest message and other user details
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

  // Fetch latest message for each conversation
  const conversationsWithMessages = await Promise.all(
    (conversations || []).map(async (conv) => {
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('content, created_at, sender_id')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Determine other user
      const isBuyer = conv.buyer_id === user.id
      const otherUser = isBuyer ? conv.seller : conv.buyer

      return {
        ...conv,
        last_message: lastMessage,
        other_user: otherUser
      }
    })
  )

  return (
    <ChatLayoutWrapper conversations={conversationsWithMessages}>
      {children}
    </ChatLayoutWrapper>
  )
}
