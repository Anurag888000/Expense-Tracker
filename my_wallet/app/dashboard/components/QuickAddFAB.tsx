'use client'

import Link from 'next/link'
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useState } from 'react'

export default function QuickAddFAB() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 md:hidden">
      {isOpen && (
        <>
          <Link 
            href="/dashboard/income"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg transition-transform transform hover:scale-105"
            onClick={() => setIsOpen(false)}
          >
            <span className="font-semibold text-sm">Income</span>
            <ArrowDownCircle className="w-5 h-5" />
          </Link>
          <Link 
            href="/dashboard/expense"
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform transform hover:scale-105"
            onClick={() => setIsOpen(false)}
          >
            <span className="font-semibold text-sm">Expense</span>
            <ArrowUpCircle className="w-5 h-5" />
          </Link>
        </>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isOpen ? 'bg-neutral-700 text-white rotate-45' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
