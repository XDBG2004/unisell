import { ItemActions } from "@/components/item-actions"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Clock } from "lucide-react"
import { BackButton } from "@/components/back-button"

export default async function MyListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check verification status
  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status')
    .eq('id', user.id)
    .single()

  if (profile?.verification_status !== 'verified') {
    redirect('/onboarding')
  }

  // Fetch Pending Listings (awaiting approval)
  const { data: pendingItems } = await supabase
    .from('items')
    .select('*')
    .eq('seller_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Fetch Active Listings
  const { data: activeItems } = await supabase
    .from('items')
    .select('*')
    .eq('seller_id', user.id)
    .eq('status', 'available')
    .order('created_at', { ascending: false })

  // Fetch Sold History
  const { data: soldItems } = await supabase
    .from('items')
    .select('*')
    .eq('seller_id', user.id)
    .eq('status', 'sold')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] space-y-8">
      <BackButton />
      <h1 className="text-3xl font-[TitleFont] font-normal">My Inventory</h1>

      <div className="glass-card p-6 min-h-[500px]">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pending">Pending ({pendingItems?.length || 0})</TabsTrigger>
            <TabsTrigger value="active">Active Listings ({activeItems?.length || 0})</TabsTrigger>
            <TabsTrigger value="sold">Sold History ({soldItems?.length || 0})</TabsTrigger>
          </TabsList>

          {/* Pending Listings Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pendingItems && pendingItems.length > 0 ? (
              pendingItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border-2 border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-900/10 hover:bg-yellow-50/70 dark:hover:bg-yellow-900/20 transition-colors">
                  {/* Image */}
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
                    {item.images && item.images[0] ? (
                      <>
                        <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-yellow-500/10" />
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-xs text-muted-foreground">No Img</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.title}</h3>
                    <p className="text-sm text-[#00adb5]">RM {item.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Submitted {new Date(item.created_at).toLocaleDateString()}</p>
                  </div>

                  {/* Pending Badge */}
                  <div className="px-3 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-500 text-xs rounded-full font-medium">
                    PENDING
                  </div>

                  {/* Actions */}
                  <ItemActions itemId={item.id} />
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-yellow-600 dark:text-yellow-500 mb-2">
                  <Clock className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-muted-foreground">No pending listings.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  New listings will appear here while awaiting approval.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Active Listings Tab */}
          <TabsContent value="active" className="space-y-4">
            {activeItems && activeItems.length > 0 ? (
              activeItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border border-border/40 bg-background/40 hover:bg-background/60 transition-colors">
                  {/* Image */}
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
                    {item.images && item.images[0] ? (
                      <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-xs text-muted-foreground">No Img</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.title}</h3>
                    <p className="text-sm text-[#00adb5]">RM {item.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  <ItemActions itemId={item.id} />
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No active listings.
              </div>
            )}
          </TabsContent>

          {/* Sold History Tab */}
          <TabsContent value="sold" className="space-y-4">
            {soldItems && soldItems.length > 0 ? (
              soldItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border border-border/40 bg-muted/20 opacity-70">
                  {/* Image */}
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0 grayscale">
                    {item.images && item.images[0] ? (
                      <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-xs text-muted-foreground">No Img</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate text-muted-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">RM {item.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Sold on {new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="px-3 py-1 bg-green-500/10 text-green-600 text-xs rounded-full font-medium">
                    SOLD
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No sold items yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
