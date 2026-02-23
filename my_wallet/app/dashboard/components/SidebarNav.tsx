'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowUpCircle,
  ArrowDownCircle,
  Target,
  BarChart3,
  History,
  Settings,
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

export default function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {navItems.map((item) => {
        const isActive = item.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname.startsWith(item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
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
  )
}
