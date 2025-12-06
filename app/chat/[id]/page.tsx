'use client'

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type Message = {
  id: string
  content: string
  sender_id: string
  created_at: string
}

type Conversation = {
  id: string
  item: {
    title: string
    images: string[]
    price: number
    status: string
  }
  other_user: {
    full_name: string
  }
}

export default function ChatPage() {
  const { id } = useParams()
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const fetchConversation = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return null
      }
      setUserId(user.id)

      // Fetch conversation details
      const { data: conv, error } = await supabase
        .from('conversations')
        .select(`
          *,
          item:items(title, images, price, seller_id, status),
          buyer:profiles!buyer_id(full_name),
          seller:profiles!seller_id(full_name)
        `)
        .eq('id', id)
        .single()

      if (error || !conv) {
        console.error("Error fetching conversation:", error)
        return user
      }

      // Determine "other user"
      const isBuyer = conv.buyer_id === user.id
      const otherUser = isBuyer ? conv.seller : conv.buyer

      setConversation({
        id: conv.id,
        item: conv.item,
        other_user: otherUser
      })

      // Fetch existing messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })

      if (msgs) {
        setMessages(msgs)
      }
      
      return user
    }







    const init = async () => {
      await fetchConversation().then((user) => {
        if (user) {
          // Clean up existing if any (Safety check)
          if (channelRef.current) {
            supabase.removeChannel(channelRef.current)
          }

          // Real-time subscription
          const channel = supabase
            .channel(`chat_${id}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${id}`
              },
              (payload) => {
                const newMessage = payload.new as Message
                // Deduplication: Ignore if it's from me (optimistically added)
                if (newMessage.sender_id === user.id) return
                setMessages((current) => [...current, newMessage])
              }
            )
            .subscribe((status) => {

            })
            
          channelRef.current = channel
        }
      })
    }

    init()

    return () => {
      // Cleanup on unmount
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [id, supabase, router])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return

    const content = newMessage.trim()
    
    // Optimistic Update
    const tempId = `temp-${Date.now()}`
    const tempMessage: Message = {
      id: tempId,
      content,
      sender_id: userId,
      created_at: new Date().toISOString()
    }
    
    setMessages((prev) => [...prev, tempMessage])
    setNewMessage("")

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: id,
        sender_id: userId,
        content: content
      })

    if (error) {
      // Ideally show error toast or rollback
    }
  }

  if (!conversation || !userId) {
    return <div className="min-h-screen flex items-center justify-center">Loading chat...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur p-4 flex items-center gap-4 sticky top-0 z-10">
        <Button asChild variant="ghost" size="icon">
          <Link href="/chat">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        
        <div className="flex items-center gap-3">
           <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
              {/* Placeholder Avatar */}
              <div className="flex items-center justify-center h-full w-full bg-cyan-500/20 text-cyan-600 font-bold">
                 {conversation.other_user.full_name?.[0]?.toUpperCase() || '?'}
              </div>
           </div>
           <div>
              <h2 className="font-semibold leading-none">{conversation.other_user.full_name}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                 {conversation.item.title} • RM {conversation.item.price}
              </p>
           </div>
        </div>
      </header>

      {/* Deleted Item Alert */}
      {conversation.item.status === 'deleted' && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 text-center text-sm font-medium border-b border-destructive/20">
          This item has been deleted by the seller.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === userId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] md:max-w-[60%] px-4 py-2 rounded-2xl ${
                  isMe 
                    ? 'bg-cyan-600 text-white rounded-tr-none' 
                    : 'bg-muted text-foreground rounded-tl-none'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-cyan-100' : 'text-muted-foreground'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/40 bg-background">
        <form onSubmit={sendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={conversation.item.status === 'deleted' ? "Chat is disabled" : "Type a message..."}
            className="flex-1"
            disabled={conversation.item.status === 'deleted'}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="bg-cyan-600 hover:bg-cyan-700 text-white shrink-0"
            disabled={conversation.item.status === 'deleted'}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
