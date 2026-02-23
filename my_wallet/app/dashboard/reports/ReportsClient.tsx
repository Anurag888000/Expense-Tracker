'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, CalendarDays } from 'lucide-react'

interface Income {
  id: string
  amount: number
  source: string
  date: string
  time_of_day: string
  notes: string | null
}

interface Expense {
  id: string
  amount: number
  category: string
  sub_category: string | null
  payment_method: string
  time_of_day: string
  place: string
  date: string
  notes: string | null
}

interface ReportsClientProps {
  view: string
  periodLabel: string
  totalIncome: number
  totalExpense: number
  netSavings: number
  incomes: Income[]
  expenses: Expense[]
  categoryBreakdown: { name: string; value: number }[]
  sourceBreakdown: { name: string; value: number }[]
  prevDateParam: string
  nextDateParam: string
  currentDate: string
}

export default function ReportsClient({
  view,
  periodLabel,
  totalIncome,
  totalExpense,
  netSavings,
  incomes,
  expenses,
  categoryBreakdown,
  sourceBreakdown,
  prevDateParam,
  nextDateParam,
  currentDate,
}: ReportsClientProps) {
  const views = [
    { key: 'daily', label: '📅 Daily' },
    { key: 'weekly', label: '📆 Weekly' },
    { key: 'monthly', label: '🗓️ Monthly' },
    { key: 'custom', label: '📄 Custom Range' },
  ]

  // Combine and sort all transactions by date
  const allTransactions = [
    ...incomes.map(i => ({ ...i, type: 'income' as const })),
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-amber-500/20 p-3 rounded-2xl">
          <CalendarDays className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-neutral-400">View your financial summary</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 p-1.5 bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-2xl w-fit">
        {views.map(v => (
          <Link
            key={v.key}
            href={`/dashboard/reports?view=${v.key}`}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              view === v.key
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                : 'text-neutral-400 hover:text-neutral-300 border border-transparent'
            }`}
          >
            {v.label}
          </Link>
        ))}
      </div>

      {/* Period Navigation - not for custom range */}
      {view !== 'custom' && (
        <div className="flex items-center justify-between backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4">
          <Link
            href={`/dashboard/reports?view=${view}&date=${prevDateParam}`}
            className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="text-center">
            <p className="text-lg font-semibold text-white">{periodLabel}</p>
          </div>
          <Link
            href={`/dashboard/reports?view=${view}&date=${nextDateParam}`}
            className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {/* Custom Range Picker */}
      {view === 'custom' && (
        <div className="backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
          <p className="text-lg font-semibold text-white text-center mb-1">{periodLabel || 'Select a date range'}</p>
          <form className="flex flex-col md:flex-row gap-3 mt-4">
            <input type="hidden" name="view" value="custom" />
            <div className="flex-1">
              <label className="text-xs text-neutral-400 mb-1 block">From</label>
              <input
                name="from"
                type="date"
                defaultValue={currentDate}
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all [color-scheme:dark]"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-400 mb-1 block">To</label>
              <input
                name="to"
                type="date"
                defaultValue={currentDate}
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all [color-scheme:dark]"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl transition-all active:scale-95"
              >
                Show Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500 opacity-50" />
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <p className="text-neutral-400 text-sm font-medium">Income</p>
          </div>
          <p className="text-3xl font-bold text-emerald-400 font-mono">₹{totalIncome.toLocaleString('en-IN')}</p>
          <p className="text-xs text-neutral-500 mt-1">{incomes.length} transaction{incomes.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-50" />
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <p className="text-neutral-400 text-sm font-medium">Expenses</p>
          </div>
          <p className="text-3xl font-bold text-red-400 font-mono">₹{totalExpense.toLocaleString('en-IN')}</p>
          <p className="text-xs text-neutral-500 mt-1">{expenses.length} transaction{expenses.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50" />
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-blue-400" />
            <p className="text-neutral-400 text-sm font-medium">Net Savings</p>
          </div>
          <p className={`text-3xl font-bold font-mono ${netSavings >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            {netSavings >= 0 ? '+' : '-'}₹{Math.abs(netSavings).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Breakdown Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Expense Category Breakdown */}
        <div className="backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Expense Breakdown</h3>
          {categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {categoryBreakdown.map((cat, i) => {
                const percentage = totalExpense > 0 ? (cat.value / totalExpense) * 100 : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-white">{cat.name}</span>
                      <span className="text-sm text-red-400 font-mono">₹{cat.value.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm text-center py-6">No expenses in this period</p>
          )}
        </div>

        {/* Income Source Breakdown */}
        <div className="backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Income Breakdown</h3>
          {sourceBreakdown.length > 0 ? (
            <div className="space-y-3">
              {sourceBreakdown.map((src, i) => {
                const percentage = totalIncome > 0 ? (src.value / totalIncome) * 100 : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-white">{src.name}</span>
                      <span className="text-sm text-emerald-400 font-mono">₹{src.value.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm text-center py-6">No income in this period</p>
          )}
        </div>
      </div>

      {/* All Transactions */}
      <div className="backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
          All Transactions ({allTransactions.length})
        </h3>
        {allTransactions.length > 0 ? (
          <div className="space-y-2">
            {allTransactions.map((txn, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl bg-neutral-950/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${txn.type === 'income' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {txn.type === 'income' ? txn.source : txn.category}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {txn.type === 'expense' && txn.sub_category ? `${txn.sub_category} · ` : ''}
                      {new Date(txn.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      {txn.type === 'expense' && txn.payment_method ? ` · ${txn.payment_method}` : ''}
                    </p>
                  </div>
                </div>
                <p className={`font-mono font-semibold text-sm ${txn.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {txn.type === 'income' ? '+' : '-'}₹{Number(txn.amount).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-500">No transactions found for this period</p>
            <p className="text-neutral-600 text-sm mt-1">Try selecting a different date range</p>
          </div>
        )}
      </div>

      {/* Date Picker for specific day */}
      {view === 'daily' && (
        <div className="backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Jump to a specific day</h3>
          <form className="flex gap-3">
            <input type="hidden" name="view" value="daily" />
            <input
              name="date"
              type="date"
              defaultValue={currentDate}
              className="flex-1 bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all [color-scheme:dark]"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl transition-all active:scale-95"
            >
              Go
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
