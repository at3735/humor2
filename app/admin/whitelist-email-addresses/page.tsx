import { createClient } from '@/utils/supabase/server'
import WhitelistTable from './whitelist-email-addresses-table'

export default async function AdminWhitelistEmailAddressesPage() {
  const supabase = await createClient()
  const { data: emails } = await supabase
    .from('whitelist_email_addresses')
    .select('*')
    .order('email_address', { ascending: true });

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Whitelisted Emails</h1>
      </header>

      <main>
        <WhitelistTable emails={emails || []} />
      </main>
    </>
  )
}
