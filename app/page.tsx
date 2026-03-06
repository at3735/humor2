import { createClient } from '@/utils/supabase/server'
import AuthButton from './auth-button'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>
        <p className="mb-6 text-gray-600">
          Please log in to continue to the admin dashboard.
        </p>
        <AuthButton session={session} />
      </div>
    </div>
  )
}