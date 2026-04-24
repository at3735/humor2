import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import StatsTimeGraph from './stats-time-graph'

// --- DEVELOPER BACKDOOR ---
const DEVELOPER_EMAIL = 'at3735@columbia.edu'

// --- TYPE DEFINITIONS ---
type CaptionWithImage = Database['public']['Tables']['captions']['Row'] & {
  images: { url: string | null } | null
}

// --- UI COMPONENTS ---

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
  const managementLinks = [
    { href: '/admin/users', title: '1. READ Users' },
    { href: '/admin/images', title: '2. CRUD Images' },
    { href: '/admin/captions', title: '3. READ Captions' },
    { href: '/admin/humor-flavors', title: '4. READ Humor Flavors' },
    { href: '/admin/humor-mix', title: '5. R/U Humor Mix' },
    { href: '/admin/terms', title: '6. CRUD Terms' },
    { href: '/admin/caption-requests', title: '7. READ Caption Requests' },
    { href: '/admin/caption-examples', title: '8. CRUD Caption Examples' },
    { href: '/admin/llm-models', title: '9. CRUD LLM Models' },
    { href: '/admin/llm-providers', title: '10. CRUD LLM Providers' },
    { href: '/admin/llm-prompt-chains', title: '11. READ Prompt Chains' },
    { href: '/admin/llm-model-responses', title: '12. READ Model Responses' },
    { href: '/admin/allowed-signup-domains', title: '13. CRUD Signup Domains' },
    { href: '/admin/whitelist-email-addresses', title: '14. CRUD Whitelisted Emails' },
  ]

  return (
    <aside className="w-64 bg-gray-50 p-4 flex flex-col h-screen border-r fixed top-0 left-0">
      <nav className="flex-grow space-y-2 overflow-y-auto">
        {managementLinks.map((link) => (
          <NavLink key={link.href} href={link.href} title={link.title} />
        ))}
      </nav>
      <div className="p-4 bg-gray-200 rounded-lg text-sm text-black mt-auto">
        Logged in as: {user.email}
      </div>
    </aside>
  )
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow h-80 flex flex-col justify-center items-center">
      <h3 className="text-lg font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function FeaturedCaptionCard({ caption }: { caption: CaptionWithImage }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm h-80 flex flex-col">
      <h3 className="text-2xl font-semibold mb-2">Most Liked Caption</h3>
      <div className="flex-grow flex flex-col justify-center items-center">
        {caption.images?.url && (
          <img src={caption.images.url} alt="Most liked image" className="h-24 w-24 object-cover rounded-md mb-4" />
        )}
        <div className="text-center">
          <p className="text-gray-800">"{caption.content}"</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{caption.like_count} Likes</p>
        </div>
      </div>
    </div>
  )
}

// --- DATA FETCHING ---

async function fetchAll(supabase: any, tableName: string, columns: string) {
  const PAGE_SIZE = 1000;
  let allRows: any[] = [];
  let lastResult: any[] = [];
  let page = 0;

  do {
    const { data, error } = await supabase
      .from(tableName)
      .select(columns)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error(`Error fetching from ${tableName}:`, error);
      break;
    }

    lastResult = data || [];
    if (lastResult.length > 0) {
      allRows = allRows.concat(lastResult);
    }
    page++;
  } while (lastResult.length === PAGE_SIZE);

  return allRows;
}


// --- PAGE ---

export default async function Admin() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // 1. Authorization checks
  if (!user) return redirect('/')
  const isDeveloper = user.email === DEVELOPER_EMAIL
  const { data: userProfile } = await supabase.from('profiles').select('is_superadmin').eq('id', user.id).single()
  const isSuperAdmin = userProfile?.is_superadmin === true
  if (!isDeveloper && !isSuperAdmin) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p>You are not authorized to view this page.</p>
        <a href="/" className="mt-4 inline-block text-blue-500 hover:underline">Return to Home</a>
      </div>
    )
  }

  // 2. Fetch all statistics and data for charts
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: totalShares },
    { count: totalSidechatPosts },
    { count: totalTerms },
    { count: ratedLast7Days },
    { count: ratedLast24Hours },
    { data: mostLikedCaption },
    images,
    captions,
    humorFlavors,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('shares').select('*', { count: 'exact', head: true }),
    supabase.from('sidechat_posts').select('*', { count: 'exact', head: true }),
    supabase.from('terms').select('*', { count: 'exact', head: true }),
    supabase.from('caption_votes').select('*', { count: 'exact', head: true }).gte('created_datetime_utc', sevenDaysAgo),
    supabase.from('caption_votes').select('*', { count: 'exact', head: true }).gte('created_datetime_utc', twentyFourHoursAgo),
    supabase.from('captions').select('*, images(url)').order('like_count', { ascending: false }).limit(1).single(),
    fetchAll(supabase, 'images', 'created_datetime_utc'),
    fetchAll(supabase, 'captions', 'created_datetime_utc'),
    fetchAll(supabase, 'humor_flavors', 'created_datetime_utc'),
  ])

  // Prepare data for graphs, ensuring to filter out entries with null dates
  const imagesForGraph = (images || []).filter(i => i.created_datetime_utc).map(i => ({ date: i.created_datetime_utc, count: 1 }));
  const captionsForGraph = (captions || []).filter(c => c.created_datetime_utc).map(c => ({ date: c.created_datetime_utc, count: 1 }));
  const humorFlavorsForGraph = (humorFlavors || []).filter(h => h.created_datetime_utc).map(h => ({ date: h.created_datetime_utc, count: 1 }));

  // 3. Render the dashboard
  return (
    <div>
      <SideMenu user={user} />
      <div className="ml-64 flex flex-col min-h-screen">
        <main className="flex-grow p-8">
          <h1 className="text-center font-bold text-4xl text-black">Admin Board</h1>
          <hr className="my-4 -mx-8" />

          <div className="flex-grow p-6 rounded-lg bg-[#989fc0]">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Overall Statistics</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total Users" value={totalUsers ?? 0} />
                <StatsTimeGraph data={imagesForGraph} totalCount={imagesForGraph.length} title="Total Images" lineColor="#d5245f" />
                <StatsTimeGraph data={humorFlavorsForGraph} totalCount={humorFlavorsForGraph.length} title="Total Humor Flavors" lineColor="#d5245f" />
                <StatCard title="Total Shares" value={totalShares ?? 0} />
                <StatCard title="Sidechat Posts" value={totalSidechatPosts ?? 0} />
                <StatCard title="No. of Terms" value={totalTerms ?? 0} />
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Caption Statistics</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatsTimeGraph data={captionsForGraph} totalCount={captionsForGraph.length} title="Total Captions" lineColor="#d5245f" />
                <StatCard title="Captions Rated (7d)" value={ratedLast7Days ?? 0} />
                <StatCard title="Captions Rated (24h)" value={ratedLast24Hours ?? 0} />
                {mostLikedCaption && (
                  <div className="lg:col-span-1">
                    <FeaturedCaptionCard caption={mostLikedCaption as CaptionWithImage} />
                  </div>
                )}
              </div>
            </section>
          </div>
          <footer className="text-center text-xs text-gray-500 mt-4">
            Note: Time-series graphs only include records with a valid creation date.
          </footer>
        </main>
      </div>
    </div>
  )
}
