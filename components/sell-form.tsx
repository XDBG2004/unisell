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
import { useRouter } from "next/navigation"

export function SellForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // File Management State
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  
  const [category, setCategory] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const subCategories: Record<string, string[]> = {
    "Electronics": [
      "Mobile Phones & Tablets",
      "Computers & Laptops",
      "Phone & Computer Accessories",
      "TV, Audio & Video",
      "Cameras & Photography",
      "Gaming & Consoles"
    ],
    "Fashion": [
      "Men's Clothing",
      "Women's Clothing",
      "Shoes",
      "Bags & Wallets",
      "Watches & Accessories"
    ],
    "Furniture & Living": [
      "Tables & Desks",
      "Chairs",
      "Beds & Mattresses",
      "Sofas",
      "Storage & Organization",
      "Home Decor"
    ],
    "Books & Stationery": [
      "Textbooks",
      "Course Notes & Past Years",
      "Fiction & Non-Fiction",
      "Comics & Manga",
      "Stationery"
    ],
    "Room Rental": [
      "Single Room",
      "Shared Room",
      "Whole Unit / House",
      "Short-term / Homestay"
    ],
    "Vehicles": [
      "Motorcycles",
      "Bicycles",
      "Cars",
      "E-Scooters & Skateboards"
    ],
    "Others": [
      "Sports & Equipment",
      "Music Instruments",
      "Tickets & Vouchers",
      "Miscellaneous"
    ]
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      
      // Calculate how many we can add
      const remainingSlots = 5 - images.length
      
      if (remainingSlots <= 0) {
        setError("You can only upload up to 5 images.")
        return
      }

      const filesToAdd = fileArray.slice(0, remainingSlots)
      
      // Update Files State
      const updatedFiles = [...images, ...filesToAdd]
      setImages(updatedFiles)
      setError(null)

      // Generate Previews for NEW files only and append
      filesToAdd.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
    
    // Reset input so same file can be selected again if needed
    if (e.target) {
        e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    const newFiles = [...images]
    newFiles.splice(index, 1)
    setImages(newFiles)

    const newPreviews = [...previews]
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (value.includes('.')) {
      const parts = value.split('.')
      if (parts[1].length > 2) {
        // Enforce max 2 decimal places
        value = `${parts[0]}.${parts[1].slice(0, 2)}`
        e.target.value = value
      }
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (images.length === 0) {
      setError("Please upload at least one image.")
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    
    // Manually handle images: Remove existing 'images' field and append from state
    formData.delete('images')
    images.forEach((file) => {
        formData.append('images', file)
    })

    // Handle Checkbox (if unchecked, it might not send anything, so we force it or let logic handle 'on')
    // Actually, checked checkbox sends "on". Unchecked sends nothing.
    // Logic in server action: `formData.get("show_contact_info") === "true"`
    // So we need to ensure we send "true" if checked.
    // Or we can rely on standard checkbox behavior if we didn't use `=== "true"` check.
    // Let's manually set it to be safe.
    const showContact = (e.currentTarget.elements.namedItem('show_contact_info') as HTMLInputElement).checked
    formData.set('show_contact_info', String(showContact))

    const result = await createListing(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // Success redirect is handled in Server Action
  }

  return (
    <div className="w-full max-w-2xl glass-card flex flex-col gap-6 py-8 px-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-[TitleFont] font-normal text-[#00adb5] dark:text-[#00dee8]">Sell an Item</h1>
        <p className="text-muted-foreground font-[TitleFont] font-normal">List your item for sale in the marketplace</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2 font-[TitleFont] font-normal">
          <Label>Item Images <span className="text-xs text-muted-foreground ml-2">(Max 5)</span></Label>
          <div className="grid grid-cols-3 gap-4">
            {/* Upload Button */}
            {images.length < 5 && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-[#00dee8] transition-colors bg-background/50"
              >
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-2">Add Photos</span>
              </div>
            )}
            
            {/* Previews */}
            {previews.map((src, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                <Image src={src} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Title */}
        <div className="space-y-2 font-[TitleFont] font-normal">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="e.g. Calculus Textbook" required />
        </div>

        {/* Price */}
        <div className="space-y-2 font-[TitleFont] font-normal">
          <Label htmlFor="price">Price (RM)</Label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-muted-foreground pointer-events-none">RM</span>
            <Input 
              id="price" 
              name="price" 
              type="number" 
              step="0.01" 
              min="0" 
              style={{ paddingLeft: "3rem", fontSize: "1rem" }} 
              placeholder="0.00" 
              required 
              onChange={handlePriceChange}
            />
          </div>
        </div>

        {/* Category & Sub-Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 font-[TitleFont] font-normal">
            <Label htmlFor="category">Category</Label>
            <Select name="category" onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(subCategories).map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 font-[TitleFont] font-normal">
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
          <div className="space-y-2 font-[TitleFont] font-normal">
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

          <div className="space-y-2 font-[TitleFont] font-normal">
            <Label htmlFor="meetup_area">Preferred Meetup Area</Label>
            <Input id="meetup_area" name="meetup_area" placeholder="e.g., Fajar Harapan Cafe or DTSP" required />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 font-[TitleFont] font-normal">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            className="w-full min-h-[120px] px-4 py-3 rounded-lg outline-none transition-all duration-200 ease-in-out bg-white border border-gray-400 text-black placeholder:text-gray-400 dark:bg-black/50 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 focus:border-[#00dee8] focus:ring-1 focus:ring-[#00dee8]"
            placeholder="Describe your item..."
            required
          />
        </div>

        {/* Privacy Control */}
        <div className="flex items-center space-x-2 font-[TitleFont] font-normal">
            <input 
                type="checkbox" 
                id="show_contact_info" 
                name="show_contact_info"
                className="w-4! h-4! p-0! text-cyan-600 bg-background border-gray-300 focus:ring-cyan-500 dark:focus:ring-cyan-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <Label htmlFor="show_contact_info" className="font-normal cursor-pointer">Display my mobile number to buyers</Label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-4 pt-2">
            <Button 
                type="submit" 
                className="flex-2 bg-cyan-600 hover:bg-cyan-700 text-white text-lg h-12 font-[TitleFont] font-normal" 
                disabled={loading}
            >
                {loading ? "Listing Item..." : "List Item"}
            </Button>
            
            <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="flex-1 text-lg h-12 border border-gray-400 hover:bg-gray-200 font-[TitleFont] font-normal"
            >
                Cancel
            </Button>
        </div>
      </form>
    </div>
  )
}
