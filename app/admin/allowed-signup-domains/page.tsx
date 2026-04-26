import { createClient } from '@/utils/supabase/server'
import DomainsTable from './allowed-signup-domains-table'

export default async function AdminAllowedSignupDomainsPage() {
  const supabase = await createClient()
  const { data: domains } = await supabase
    .from('allowed_signup_domains')
    .select('*')
    .order('apex_domain', { ascending: true });

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Allowed Signup Domains</h1>
      </header>

      <main>
        <DomainsTable domains={domains || []} />
      </main>
    </>
  )
}
