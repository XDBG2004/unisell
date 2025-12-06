"use client"

import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  itemId: string
  initialFavorited?: boolean
  className?: string
}

export function FavoriteButton({ itemId, initialFavorited = false, className }: FavoriteButtonProps) {
  // Placeholder logic for now
  return (
    <Button 
      variant="outline" 
      size="lg" 
      className={cn(
        "w-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]",
        initialFavorited 
          ? "border-2 border-red-500 text-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30" 
          : "border-2 border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-500",
        className
      )}
    >
      <Heart className={cn("mr-2 h-5 w-5", initialFavorited && "fill-current")} />
      {initialFavorited ? "Favorited" : "Add to Favorites"}
    </Button>
  )
}
