import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

function NavHeading({ title }: { title: string }) {
  return <h3 className="font-bold text-sm text-[#591f20] uppercase mt-8 mb-2 px-2">{title}</h3>
}

function NavLink({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href}>
      <div className="p-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
        <p className="text-sm text-gray-700">{title}</p>
      </div>
    </Link>
  )
}

function SideMenu({ user }: { user: User }) {
  return (
    <aside className="w-64 bg-gray-50 p-4 flex flex-col h-screen border-r fixed top-0 left-0">
      <nav className="flex-grow space-y-1 overflow-y-auto">
        <Link href="/admin">
          <h1 className="font-bold text-lg mb-4 p-2 hover:bg-gray-200 rounded-lg">Admin Dashboard</h1>
        </Link>

        <NavHeading title="Input Control" />
        <NavLink href="/admin/images" title="1. Images (CRUD)" />
        <NavLink href="/admin/terms" title="2. Terms (CRUD)" />
        <NavLink href="/admin/caption-examples" title="3. Caption Examples (CRUD)" />
        <NavLink href="/admin/humor-flavors" title="4. Humor Flavors (READ)" />
        <NavLink href="/admin/humor-mix" title="5. Humor Mix (R/U)" />

        <NavHeading title="AI Model & Output" />
        <NavLink href="/admin/llm-models" title="6. LLM Models (CRUD)" />
        <NavLink href="/admin/llm-providers" title="7. LLM Providers (CRUD)" />
        <NavLink href="/admin/llm-prompt-chains" title="8. Prompt Chains (READ)" />
        <NavLink href="/admin/llm-model-responses" title="9. Model Responses (READ)" />
        <NavLink href="/admin/captions" title="10. Captions (READ)" />
        <NavLink href="/admin/caption-requests" title="11. Caption Requests (READ)" />

        <NavHeading title="Access Control" />
        <NavLink href="/admin/users" title="12. Users (READ)" />
        <NavLink href="/admin/allowed-signup-domains" title="13. Signup Domains (CRUD)" />
        <NavLink href="/admin/whitelist-email-addresses" title="14. Whitelisted Emails (CRUD)" />
      </nav>
      <div className="p-4 bg-gray-200 rounded-lg text-sm text-black mt-auto">
        Logged in as: {user.email}
      </div>
    </aside>
  )
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const isDeveloper = user.email === 'at3735@columbia.edu'
  const { data: userProfile } = await supabase.from('profiles').select('is_superadmin').eq('id', user.id).single()
  const isSuperAdmin = userProfile?.is_superadmin === true
  if (!isDeveloper && !isSuperAdmin) {
    return redirect('/no-access')
  }

  return (
    <div>
      <SideMenu user={user} />
      <div className="ml-64">
        <main className="flex-grow p-8">{children}</main>
      </div>
    </div>
  )
}
