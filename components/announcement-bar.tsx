'use client'

import { useState } from "react"
import { X } from "lucide-react"

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-[#00adb5] dark:bg-[#00dee8] text-primary-foreground px-4 py-2 text-sm font-medium relative">
      <div className="container mx-auto flex items-center justify-center text-center pr-8">
        <p>Welcome to UniSell! The exclusive marketplace for USM students.</p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
