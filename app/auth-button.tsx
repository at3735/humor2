'use client'

import { createClient } from '@/utils/supabase/client'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function AuthButton({ session }: { session: Session | null }) {
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm">Logged in as {session.user.email}</span>
        <button
          onClick={handleLogout}
          className="py-2 px-4 rounded-md bg-red-500 text-white"
        >
          Logout
        </button>
        <a
          href="/admin"
          className="py-2 px-4 rounded-md bg-blue-500 text-white"
        >
          Go to Admin Dashboard
        </a>
      </div>
    )
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="py-2 px-4 rounded-md bg-gray-800 text-white"
    >
      Login with Google
    </button>
  )
}