'use client'

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [term, setTerm] = useState("")

  useEffect(() => {
    setTerm(searchParams.get("search") || "")
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    
    if (term.trim()) {
      params.set("search", term.trim())
    } else {
      params.delete("search")
    }
    
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center w-full pt-4 px-4">
      <div className="relative w-full">
        <Input
          type="search"
          placeholder="Search items..."
          className="w-full pr-12 pl-6 bg-white dark:bg-[#2a2a2a] h-12 text-md md:text-sm font-[TitleFont] tracking-wide shadow-lg rounded-full border-0 focus-visible:ring-2 focus-visible:ring-[#00dee8] placeholder:text-gray-400 placeholder:font-normal"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#00dee8] hover:bg-[#00dee8]/90 flex items-center justify-center transition-colors"
        >
          <Search className="h-4 w-4 text-black" />
        </button>
      </div>
    </form>
  )
}
