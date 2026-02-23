'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Wallet, 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Target, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  History,
  Repeat
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, hoverClass: 'hover:bg-neutral-800/50 hover:text-white' , activeClass: 'bg-neutral-800/70 text-white' },
  { href: '/dashboard/income', label: 'Add Income', icon: ArrowDownCircle, hoverClass: 'hover:bg-emerald-500/10 hover:text-emerald-400', activeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  { href: '/dashboard/expense', label: 'Add Expense', icon: ArrowUpCircle, hoverClass: 'hover:bg-red-500/10 hover:text-red-400', activeClass: 'bg-red-500/15 text-red-400 border-red-500/20' },
  { href: '/dashboard/goals', label: 'Goals', icon: Target, hoverClass: 'hover:bg-purple-500/10 hover:text-purple-400', activeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3, hoverClass: 'hover:bg-amber-500/10 hover:text-amber-400', activeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  { href: '/dashboard/history', label: 'History', icon: History, hoverClass: 'hover:bg-blue-500/10 hover:text-blue-400', activeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  { href: '/dashboard/recurring', label: 'Recurring', icon: Repeat, hoverClass: 'hover:bg-indigo-500/10 hover:text-indigo-400', activeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, hoverClass: 'hover:bg-neutral-800/50 hover:text-white', activeClass: 'bg-neutral-800/70 text-white' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const sidebarContent = isOpen ? (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sidebar */}
      <aside className="absolute inset-y-0 left-0 w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col animate-slide-in shadow-2xl shadow-black">
        <div className="p-6 flex items-center justify-between border-b border-neutral-800">
          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 hover:opacity-80 transition-opacity relative z-10">
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="font-bold tracking-wide text-lg text-white">MyWallet</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors border border-transparent ${
                  isActive
                    ? item.activeClass
                    : `text-neutral-300 ${item.hoverClass}`
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
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
    </div>
  ) : null

  return (
    <>
      {/* Hamburger Button - visible only on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-xl hover:bg-neutral-800 text-neutral-300 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Portal the overlay to document.body so it escapes any stacking context */}
      {mounted && sidebarContent && createPortal(sidebarContent, document.body)}
    </>
  )
}
