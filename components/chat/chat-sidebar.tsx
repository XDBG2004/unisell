import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatSidebarProps {
  conversations: any[]
  currentChatId?: string
}

export function ChatSidebar({ conversations, currentChatId }: ChatSidebarProps) {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + "y"
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + "mo"
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + "d"
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + "h"
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + "m"
    return "now"
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#2c2c2c]">
      {/* Header */}
      <div className="p-4 border-b border-border/40 bg-gray-100 dark:bg-gray-800">
        <h1 className="text-xl font-bold">Messages</h1>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations && conversations.length > 0 ? (
          <div className="divide-y divide-border/40">
            {conversations.map((conv: any) => {
              const isActive = conv.id === currentChatId
              const otherUser = conv.other_user
              const lastMessage = conv.last_message

              return (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className={cn(
                    "block p-4 transition-colors hover:bg-muted/50",
                    isActive && "bg-[#00dee8]/10 hover:bg-[#00dee8]/15"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="shrink-0 w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-cyan-600">
                        {otherUser?.full_name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {otherUser?.full_name || 'Unknown User'}
                        </h3>
                        {lastMessage?.created_at && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {timeAgo(lastMessage.created_at)}
                          </span>
                        )}
                      </div>
                      
                      {lastMessage?.content && (
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage.content}
                        </p>
                      )}
                      
                      {conv.item?.title && (
                        <p className="text-xs text-muted-foreground/70 truncate mt-1">
                          {conv.item.title}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-muted/50 rounded-full p-6 mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No messages yet.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Start chatting with sellers!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
