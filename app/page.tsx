import { createClient } from '@/utils/supabase/server'
import AuthButton from './auth-button'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    const user = session.user
    const isDeveloper = user.email === 'at3735@columbia.edu'
    const isSuperAdmin = user.user_metadata?.role === 'superadmin'

    if (isDeveloper || isSuperAdmin) {
      redirect('/admin')
    } else {
      redirect('/no-access')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#989fc0]">
      <div className="p-8 bg-[#eee5e0] rounded-lg shadow-md text-center text-black">
        <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>
        <p className="mb-6">
          Please log in to continue to the admin dashboard.
        </p>
        <AuthButton session={session} />
      </div>
    </div>
  )
}
