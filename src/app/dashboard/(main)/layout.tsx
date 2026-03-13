import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayoutWrapper from '@/components/dashboard/DashboardLayoutWrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile to get the most up-to-date name and avatar
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0]
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url

  return (
    <DashboardLayoutWrapper 
      user={user} 
      displayName={displayName || ''} 
      avatarUrl={avatarUrl}
    >
      {children}
    </DashboardLayoutWrapper>
  )
}
