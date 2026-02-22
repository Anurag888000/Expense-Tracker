import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Wallet, 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Target, 
  Settings,
  LogOut 
} from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-neutral-950 flex text-white font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-950/50 backdrop-blur-xl flex flex-col fixed inset-y-0 z-50">
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
      <main className="flex-1 ml-64 p-8 relative min-h-screen">
        {/* Background Gradients for Main */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8 backdrop-blur-md bg-neutral-900/40 p-4 rounded-2xl border border-neutral-800 sticky top-4 z-40">
           <h2 className="text-xl font-semibold px-2 text-white">Overview</h2>
           <div className="flex items-center gap-4 pr-2">
             <div className="text-sm text-neutral-400">
                {user.email}
             </div>
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-sm font-bold shadow-lg">
                {user.email?.charAt(0).toUpperCase()}
             </div>
           </div>
        </header>

        {children}
      </main>
    </div>
  )
}
