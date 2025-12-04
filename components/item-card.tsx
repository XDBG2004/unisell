import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ItemCardProps {
  id: string
  title: string
  price: number
  condition: string
  images: string[]
  category: string
}

export function ItemCard({ id, title, price, condition, images, category }: ItemCardProps) {
  return (
    <Link href={`/items/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="relative aspect-square bg-muted">
          {images && images[0] ? (
            <Image
              src={images[0]}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
              No Image
            </div>
          )}
          <Badge className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm">
            {condition}
          </Badge>
        </div>
        <CardContent className="p-4 flex-1">
          <div className="text-xs text-muted-foreground mb-1">{category}</div>
          <h3 className="font-semibold truncate">{title}</h3>
          <p className="text-lg font-bold text-[#00adb5] dark:text-[#00dee8] mt-1">
            RM {price.toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
