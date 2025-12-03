'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createListing } from "@/app/items/actions"
import { useState, useRef } from "react"
import { ImagePlus, X } from "lucide-react"
import Image from "next/image"

export function SellForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [category, setCategory] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const subCategories: Record<string, string[]> = {
    "Electronics": ["Mobile Phones", "Laptops", "Tablets", "Accessories"],
    "Clothing": ["Men", "Women", "Unisex", "Shoes", "Bags"],
    "Books": ["Textbooks", "Fiction", "Comics", "Notes"],
    "Furniture": ["Table/Desk", "Chair", "Cabinet", "Bedding"],
    "Others": ["Sports", "Music", "Stationary", "Miscellaneous"]
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newPreviews: string[] = []
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === files.length) {
            setPreviews(newPreviews)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await createListing(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl glass-card flex flex-col gap-6 py-8 px-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-[#00adb5] dark:text-[#00dee8]">Sell an Item</h1>
        <p className="text-muted-foreground">List your item for sale in the marketplace</p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Item Images</Label>
          <div className="grid grid-cols-3 gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-[#00dee8] transition-colors bg-background/50"
            >
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-2">Add Photos</span>
            </div>
            
            {previews.map((src, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                <Image src={src} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    // This is just a visual removal, clearing the actual input is harder with standard file inputs
                    // For a real app we'd manage a separate file array state.
                    // For this MVP, we'll just reset everything if they want to change.
                    setPreviews([])
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-red-500 transition-colors"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            name="images"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageChange}
            required
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="e.g. Calculus Textbook" required />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Price (RM)</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground">RM</span>
            <Input id="price" name="price" type="number" step="0.01" min="0" className="pl-10" placeholder="0.00" required />
          </div>
        </div>

        {/* Category & Sub-Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Books">Books</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub_category">Sub-Category</Label>
            <Select name="sub_category" disabled={!category} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Sub-Category" />
              </SelectTrigger>
              <SelectContent>
                {category && subCategories[category]?.map((sub) => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Condition & Meetup Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select name="condition" required>
              <SelectTrigger>
                <SelectValue placeholder="Select Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Brand New">Brand New</SelectItem>
                <SelectItem value="Like New">Like New</SelectItem>
                <SelectItem value="Lightly Used">Lightly Used</SelectItem>
                <SelectItem value="Heavily Used">Heavily Used</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetup_area">Preferred Meetup Area</Label>
            <Input id="meetup_area" name="meetup_area" placeholder="e.g., Fajar Harapan Cafe or DTSP" required />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            className="w-full min-h-[120px] px-4 py-3 rounded-lg outline-none transition-all duration-200 ease-in-out bg-white border border-gray-400 text-black placeholder:text-gray-400 dark:bg-black/50 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 focus:border-[#00dee8] focus:ring-1 focus:ring-[#00dee8]"
            placeholder="Describe your item..."
            required
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-lg h-12" disabled={loading}>
          {loading ? "Listing Item..." : "List Item"}
        </Button>
      </form>
    </div>
  )
}
