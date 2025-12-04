import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface CategoryCardProps {
  name: string
  count?: number
  icon?: React.ReactNode
}

export function CategoryCard({ name, count, icon }: CategoryCardProps) {
  return (
    <Link href={`/?category=${encodeURIComponent(name)}`} className="block h-full">
      <div className="glass-card w-full h-52 flex flex-col items-center justify-start pt-12 p-4 text-center hover:scale-105 transition-transform border border-border/50">
        {icon && <div className="text-cyan-600 dark:text-cyan-400 mb-4">{icon}</div>}
        <h3 className="font-medium text-sm sm:text-base whitespace-normal leading-tight px-2">{name}</h3>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground mt-2">{count} items</span>
        )}
      </div>
    </Link>
  )
}
