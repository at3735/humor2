import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './logout-button'

export default async function NoAccessPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#989fc0]">
      <div className="p-8 bg-[#eee5e0] rounded-lg shadow-md text-center text-black">
        <p className="mb-4">Logged in as {session.user.email}</p>
        <p className="mb-6 text-red-500">You do not have access to the dashboard</p>
        <LogoutButton />
      </div>
    </div>
  )
}
