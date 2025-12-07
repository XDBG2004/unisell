import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      <div className="glass-card p-12 text-center">
        <p className="text-xl text-muted-foreground">Coming Soon...</p>
      </div>
    </div>
  )
}
