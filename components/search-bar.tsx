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
    <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-sm mx-4">
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items..."
          className="w-full pl-8 bg-background h-9"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </div>
    </form>
  )
}
