'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
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
  X
} from 'lucide-react'

export default function MobileNav() {
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
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="font-bold tracking-wide text-lg text-white">MyWallet</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-800/50 text-neutral-300 hover:text-white transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/dashboard/income" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 text-neutral-300 transition-colors">
            <ArrowDownCircle className="w-5 h-5" />
            <span className="font-medium">Add Income</span>
          </Link>
          <Link href="/dashboard/expense" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-neutral-300 transition-colors">
            <ArrowUpCircle className="w-5 h-5" />
            <span className="font-medium">Add Expense</span>
          </Link>
          <Link href="/dashboard/goals" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-500/10 hover:text-purple-400 text-neutral-300 transition-colors">
            <Target className="w-5 h-5" />
            <span className="font-medium">Goals</span>
          </Link>
          <Link href="/dashboard/reports" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-500/10 hover:text-amber-400 text-neutral-300 transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </Link>
          <Link href="/dashboard/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-800/50 text-neutral-300 hover:text-white transition-colors">
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
