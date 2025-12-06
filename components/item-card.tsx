import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin } from "lucide-react"

interface ItemCardProps {
  item: any
  isFavorited?: boolean
}

export function ItemCard({ item, isFavorited = false }: ItemCardProps) {
  
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
    <Link href={`/items/${item.id}`} className="group h-full block">
      <div className="glass-card flex flex-col h-full overflow-hidden hover:shadow-cyan-500/20 hover:border-cyan-500/30 transition-all duration-300 border rounded-lg bg-card text-card-foreground shadow-sm">
        {/* Image */}
        <div className="relative aspect-square bg-muted">
          <Image 
            src={item.images?.[0] || '/placeholder.png'} 
            alt={item.title} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          {/* Heart Button Positioned Top Right */}
          <div className="absolute top-2 right-2 z-10">
             <div className="p-2 rounded-full bg-black/50 text-white hover:bg-[#00dee8] hover:text-black transition-colors backdrop-blur-sm">
                <Heart size={16} className={isFavorited ? "fill-current text-red-500" : ""} />
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          {/* Title */}
          <h3 className="font-semibold text-base line-clamp-1 group-hover:text-[#00dee8] transition-colors" title={item.title}>
            {item.title}
          </h3>
          
          {/* Price */}
          <p className="text-xl font-bold text-[#00dee8]">
            {item.price === 0 ? "Free" : `RM ${item.price.toFixed(2)}`}
          </p>

          {/* Badges Row: Condition | Category | Subcategory */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-muted-foreground/30 text-muted-foreground whitespace-nowrap">
              {item.condition}
            </Badge>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 whitespace-nowrap">
              {item.category}
            </Badge>
            {item.sub_category && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-muted text-muted-foreground hover:bg-muted/80 whitespace-nowrap">
                {item.sub_category}
              </Badge>
            )}
          </div>

          {/* Footer Info: Seller (Left) | Meetup & Time (Right) */}
          <div className="mt-auto pt-3 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 gap-2">
             <span className="font-medium text-foreground/80 truncate max-w-[80px]" title={item.seller?.full_name}>
               {item.seller?.full_name || 'Unknown'}
             </span>
             
             <div className="flex items-center gap-2 shrink-0 max-w-[60%] justify-end">
                {item.meetup_area && (
                  <div className="flex items-center gap-1 truncate min-w-0">
                    <MapPin size={10} className="shrink-0" />
                    <span className="truncate">{item.meetup_area}</span>
                  </div>
                )}
                <span className="shrink-0 opacity-50">•</span>
                <span className="whitespace-nowrap shrink-0">{timeAgo(item.created_at)}</span>
             </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
