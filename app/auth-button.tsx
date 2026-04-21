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
        queryParams: {
          prompt: 'select_account',
        },
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-black">
          Logged in as {session.user.email}
        </span>
        <button
          onClick={handleLogout}
          className="py-2 px-4 rounded-md bg-[#d5245f] text-[#eee5e0] hover:bg-[#591f20] transition-colors"
        >
          Logout
        </button>
        <a
          href="/admin"
          className="py-2 px-4 rounded-md bg-[#d5245f] text-[#eee5e0] hover:bg-[#591f20] transition-colors"
        >
          Go to Admin Dashboard
        </a>
      </div>
    )
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="py-2 px-4 rounded-md bg-[#d5245f] text-[#eee5e0] hover:bg-[#591f20] transition-colors"
    >
      Login with Google
    </button>
  )
}
