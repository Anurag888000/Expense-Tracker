import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Wallet, 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Target, 
  BarChart3,
  Settings,
  LogOut 
} from 'lucide-react'
import MobileNav from './components/MobileNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U'

  return (
    <div className="min-h-screen bg-neutral-950 flex text-white font-sans selection:bg-emerald-500/30">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden md:flex w-64 border-r border-neutral-800 bg-neutral-950/50 backdrop-blur-xl flex-col fixed inset-y-0 z-50">
        <div className="p-6 flex items-center gap-3 border-b border-neutral-800">
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <Wallet className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="font-bold tracking-wide text-lg">MyWallet</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-800/50 text-neutral-300 hover:text-white transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/dashboard/income" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 text-neutral-300 transition-colors">
            <ArrowDownCircle className="w-5 h-5" />
            <span className="font-medium">Add Income</span>
          </Link>
          <Link href="/dashboard/expense" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-neutral-300 transition-colors">
            <ArrowUpCircle className="w-5 h-5" />
            <span className="font-medium">Add Expense</span>
          </Link>
          <Link href="/dashboard/goals" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-500/10 hover:text-purple-400 text-neutral-300 transition-colors">
            <Target className="w-5 h-5" />
            <span className="font-medium">Goals</span>
          </Link>
          <Link href="/dashboard/reports" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-500/10 hover:text-amber-400 text-neutral-300 transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-800/50 text-neutral-300 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-neutral-300 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 relative min-h-screen overflow-x-hidden">
        {/* Background Gradients for Main */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        {/* Top Header */}
        <header className="flex justify-between items-center mb-6 md:mb-8 backdrop-blur-md bg-neutral-900/40 p-3 md:p-4 rounded-2xl border border-neutral-800 sticky top-2 md:top-4 z-40">
           <div className="flex items-center gap-2">
             {/* Mobile hamburger */}
             <MobileNav />
             <h2 className="text-lg md:text-xl font-semibold px-1 md:px-2 text-white">Overview</h2>
           </div>
           <div className="flex items-center gap-2 md:gap-4 pr-1 md:pr-2">
             <div className="text-xs md:text-sm text-neutral-400 hidden sm:block">
                {displayName}
             </div>
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-sm font-bold shadow-lg">
                {initial}
             </div>
           </div>
        </header>

        {children}
      </main>
    </div>
  )
}
