import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { SellForm } from "@/components/sell-form"

export default async function SellPage() {
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
    // If not verified, redirect to home
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SellForm />
    </div>
  )
}
