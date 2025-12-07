import { ProfileForm } from "@/components/profile-form"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.verification_status !== 'verified') {
    redirect('/onboarding')
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] space-y-8">
      <h1 className="text-3xl font-[TitleFont] font-normal">My Profile</h1>

      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b border-border/50 pb-2">My Information</h2>
          
          <ProfileForm user={{ email: user.email!, id: user.id }} profile={profile} />
        </div>
      </div>
    </div>
  )
}
