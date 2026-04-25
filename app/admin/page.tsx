import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import StatsTimeGraph from './stats-time-graph'
import SmallStatCard from './small-stat-card'
import CaptionsRatedCard from './captions-rated-card'
import ContentOriginPieChart from './content-origin-pie-chart'

// --- DEVELOPER BACKDOOR ---
const DEVELOPER_EMAIL = 'at3735@columbia.edu'

// --- TYPE DEFINITIONS ---
type CaptionWithDetails = Database['public']['Tables']['captions']['Row'] & {
  images: { url: string | null } | null
  humor_flavors: { slug: string | null } | null
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

function FeaturedCaptionCard({ caption }: { caption: CaptionWithDetails }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-2xl font-semibold mb-4">Most Liked Caption</h3>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="sm:w-1/2 flex justify-center items-center">
          {caption.images?.url && (
            <img
              src={caption.images.url}
              alt="Most liked image"
              className="rounded-lg object-cover max-h-80"
            />
          )}
        </div>
        <div className="sm:w-1/2 flex flex-col justify-center">
          <p className="text-3xl font-bold text-gray-900 mb-6">"{caption.content}"</p>
          <div className="text-lg text-gray-600 space-y-2">
            <p><span className="font-semibold">Likes:</span> {caption.like_count}</p>
            <p><span className="font-semibold">Humor Flavor:</span> {caption.humor_flavors?.slug ?? 'N/A'}</p>
            <p><span className="font-semibold">Caption ID:</span> {caption.id}</p>
          </div>
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
  const [
    { count: totalUsers },
    { count: totalShares },
    { count: totalSidechatPosts },
    { count: totalTerms },
    { count: totalCaptions },
    { data: mostLikedCaption },
    images,
    captionsForGraphData,
    captionsForOriginData,
    humorFlavors,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('shares').select('*', { count: 'exact', head: true }),
    supabase.from('sidechat_posts').select('*', { count: 'exact', head: true }),
    supabase.from('terms').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*, images(url), humor_flavors(slug)').order('like_count', { ascending: false }).limit(1).single(),
    fetchAll(supabase, 'images', 'created_datetime_utc'),
    fetchAll(supabase, 'captions', 'created_datetime_utc'),
    fetchAll(supabase, 'captions', 'profile_id, profiles!captions_profile_id_fkey(is_superadmin)'),
    fetchAll(supabase, 'humor_flavors', 'created_datetime_utc'),
  ])

  // Prepare data for graphs, ensuring to filter out entries with null dates
  const imagesForGraph = (images || []).filter(i => i.created_datetime_utc).map(i => ({ date: i.created_datetime_utc, count: 1 }));
  const captionsForGraph = (captionsForGraphData || []).filter(c => c.created_datetime_utc).map(c => ({ date: c.created_datetime_utc, count: 1 }));
  const humorFlavorsForGraph = (humorFlavors || []).filter(h => h.created_datetime_utc).map(h => ({ date: h.created_datetime_utc, count: 1 }));

  // 3. Render the dashboard
  return (
    <div>
      <SideMenu user={user} />
      <div className="ml-64 flex flex-col min-h-screen">
        <main className="flex-grow p-8">
          <h1 className="text-center font-bold text-5xl text-black dark:text-white">Admin Board</h1>
          <hr className="my-4 -mx-8" />

          <div className="flex-grow p-6 rounded-lg">
            <section className="mb-8">
              <h2 className="text-3xl font-semibold text-black dark:text-white mb-4">Overall Statistics</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-8">
                <SmallStatCard title="Total Users" value={totalUsers ?? 0} />
                <SmallStatCard title="Total Shares" value={totalShares ?? 0} />
                <SmallStatCard title="Sidechat Posts" value={totalSidechatPosts ?? 0} />
                <SmallStatCard title="No. of Terms" value={totalTerms ?? 0} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatsTimeGraph data={imagesForGraph} totalCount={imagesForGraph.length} title="Total Images" lineColor="#d5245f" />
                <StatsTimeGraph data={humorFlavorsForGraph} totalCount={humorFlavorsForGraph.length} title="Total Humor Flavors" lineColor="#d5245f" />
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-black dark:text-white mb-4">Caption Statistics</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
                <StatsTimeGraph data={captionsForGraph} totalCount={totalCaptions ?? 0} title="Total Captions" lineColor="#d5245f" />
                <CaptionsRatedCard />
                <ContentOriginPieChart captions={captionsForOriginData || []} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {mostLikedCaption && (
                  <div className="sm:col-span-3">
                    <FeaturedCaptionCard caption={mostLikedCaption as CaptionWithDetails} />
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
