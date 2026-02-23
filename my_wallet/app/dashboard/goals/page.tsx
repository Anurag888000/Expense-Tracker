'use client'

import { saveGoals, getGoalsData, getGoalsTrend, GoalTrendPoint } from './actions'
import { useState, useEffect, useRef } from 'react'
import { Target, CheckCircle2, AlertCircle, RotateCcw, TrendingUp, Loader2 } from 'lucide-react'
import GoalsTrend from './GoalsTrend'

const categories = [
  '🍔 Food',
  '🏢 Office Travel',
  '🌍 Outside Travel',
  '🎬 Entertainment',
  '🛒 Shopping',
  '💡 Utilities',
  '🏥 Health',
  '📚 Education'
]

const quickSavingGoals = [1000, 5000, 10000, 25000, 50000]
const quickLimitAmounts = [500, 1000, 2000, 5000, 10000]

function ProgressBar({ spent, limit }: { spent: number; limit: number }) {
  const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const overBudget = spent > limit && limit > 0

  let barColor = 'from-emerald-500 to-emerald-400'
  if (percentage > 75) barColor = 'from-amber-500 to-orange-400'
  if (percentage > 90) barColor = 'from-red-500 to-rose-400'
  if (overBudget) barColor = 'from-red-600 to-red-400'

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className={overBudget ? 'text-red-400 font-semibold' : 'text-neutral-400'}>
          ₹{spent.toLocaleString('en-IN')} spent
        </span>
        <span className="text-neutral-500">
          {limit > 0 ? `${percentage.toFixed(0)}%` : 'No limit'}
        </span>
      </div>
      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: limit > 0 ? `${percentage}%` : '0%' }}
        />
      </div>
      {overBudget && (
        <p className="text-xs text-red-400 font-medium">
          ⚠️ Over budget by ₹{(spent - limit).toLocaleString('en-IN')}
        </p>
      )}
    </div>
  )
}

function SavingsRing({ current, goal }: { current: number; goal: number }) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  let ringColor = '#10b981' // emerald
  if (percentage < 50) ringColor = '#f59e0b' // amber
  if (percentage < 25) ringColor = '#ef4444' // red
  if (current < 0) ringColor = '#ef4444'

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} stroke="#262626" strokeWidth="8" fill="none" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={ringColor}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${ringColor}50)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white font-mono">{percentage.toFixed(0)}%</span>
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">saved</span>
        </div>
      </div>
      <div className="space-y-2 min-w-0">
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Current Savings</p>
          <p className={`text-2xl font-bold font-mono ${current >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ₹{Math.abs(current).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Target</p>
          <p className="text-lg font-semibold text-neutral-300 font-mono">
            {goal > 0 ? `₹${goal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Not set'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'fetching'>('fetching')
  const [errorMessage, setErrorMessage] = useState('')
  const [savingGoal, setSavingGoal] = useState('')
  const [categoryLimits, setCategoryLimits] = useState<Record<string, string>>({})
  const [categorySpending, setCategorySpending] = useState<Record<string, number>>({})
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [currentMonthYear, setCurrentMonthYear] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const [trendData, setTrendData] = useState<GoalTrendPoint[]>([])

  useEffect(() => {
    async function loadData() {
      const data = await getGoalsData()
      if (data.error) {
        setErrorMessage(data.error)
        setStatus('error')
        return
      }
      setSavingGoal(data.goals?.monthly_saving_goal ? String(data.goals.monthly_saving_goal) : '')
      const limits: Record<string, string> = {}
      if (data.goals?.category_limits) {
        Object.entries(data.goals.category_limits).forEach(([key, val]) => {
          limits[key] = String(val)
        })
      }
      setCategoryLimits(limits)
      setCategorySpending(data.categorySpending || {})
      setTotalIncome(data.totalIncome || 0)
      setTotalExpense(data.totalExpense || 0)
      setCurrentMonthYear(data.currentMonthYear || '')
      setStatus('idle')

      // Load trend data in parallel (non-blocking)
      const trend = await getGoalsTrend()
      setTrendData(trend.data)
    }
    loadData()
  }, [])

  function resetForm() {
    setSavingGoal('')
    setCategoryLimits({})
    setStatus('idle')
  }

  function setCategoryLimit(category: string, value: string) {
    setCategoryLimits(prev => ({ ...prev, [category]: value }))
  }

  async function handleSubmit(formData: FormData) {
    setStatus('loading')

    // Inject category limits into formData
    categories.forEach(cat => {
      const val = categoryLimits[cat]
      if (val) {
        formData.set(`limit_${cat}`, val)
      }
    })

    formData.set('monthly_saving_goal', savingGoal || '0')
    formData.set('month_year', currentMonthYear)

    const result = await saveGoals(formData)

    if (result?.error) {
      setErrorMessage(result.error)
      setStatus('error')
    } else {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const currentSavings = totalIncome - totalExpense
  const savingGoalNum = parseFloat(savingGoal) || 0

  if (status === 'fetching') {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-neutral-400 text-sm">Loading your goals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/20 p-3 rounded-2xl">
            <Target className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Monthly Goals</h1>
            <p className="text-neutral-400">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-400 text-sm font-medium hover:bg-neutral-700 hover:text-neutral-300 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All
        </button>
      </div>

      {/* Status Alerts */}
      {status === 'success' && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Goals saved successfully! 🎯</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Savings Goal Section */}
      <div className="backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden mb-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50" />

        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Savings Goal</h2>
        </div>

        {/* Savings Progress Ring */}
        <div className="bg-neutral-950/50 rounded-2xl border border-neutral-800 p-6 mb-6">
          <SavingsRing current={currentSavings} goal={savingGoalNum} />
        </div>

        {/* Quick Presets */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-300">Quick Set Target</label>
          <div className="flex flex-wrap gap-2">
            {quickSavingGoals.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setSavingGoal(String(preset))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                  savingGoal === String(preset)
                    ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                    : 'bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20'
                }`}
              >
                ₹{preset.toLocaleString('en-IN')}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSavingGoal('')}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs font-semibold hover:bg-neutral-700 transition-all active:scale-95"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Manual Savings Input */}
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium text-neutral-300" htmlFor="monthly_saving_goal">
            Or enter custom target (₹)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-purple-400 font-bold text-xl pointer-events-none">₹</span>
            <input
              id="monthly_saving_goal"
              type="number"
              step="0.01"
              value={savingGoal}
              onChange={(e) => setSavingGoal(e.target.value)}
              placeholder="0.00"
              className="w-full md:w-1/2 bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 pl-9 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-lg"
            />
          </div>
        </div>
      </div>

      {/* Category Spending Limits */}
      <div className="backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-50" />

        <h2 className="text-xl font-semibold text-white mb-2">Category Spending Limits</h2>
        <p className="text-sm text-neutral-400 mb-6">Set monthly budgets per category. Leave empty for no limit.</p>

        <form ref={formRef} action={handleSubmit}>
          <input type="hidden" name="month_year" value={currentMonthYear} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(category => {
              const spent = categorySpending[category] || 0
              const limitVal = parseFloat(categoryLimits[category] || '0')
              const emoji = category.split(' ')[0]
              const name = category.split(' ').slice(1).join(' ')

              return (
                <div
                  key={category}
                  className="bg-neutral-950/50 border border-neutral-800 rounded-2xl p-4 hover:border-neutral-700 transition-all group"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{emoji}</span>
                      <span className="text-sm font-medium text-neutral-200">{name}</span>
                    </div>
                    {spent > 0 && (
                      <span className="text-xs text-neutral-500 font-mono">
                        ₹{spent.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Limit Input */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500 text-sm pointer-events-none">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={categoryLimits[category] || ''}
                      onChange={(e) => setCategoryLimit(category, e.target.value)}
                      placeholder="No limit"
                      className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl py-2 pl-7 pr-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-mono group-hover:border-neutral-700"
                    />
                  </div>

                  {/* Quick Set Chips */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {quickLimitAmounts.map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCategoryLimit(category, String(amt))}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all active:scale-95 ${
                          categoryLimits[category] === String(amt)
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                            : 'bg-neutral-800/50 border border-neutral-800 text-neutral-500 hover:text-neutral-400 hover:bg-neutral-800'
                        }`}
                      >
                        {amt >= 1000 ? `${amt/1000}k` : amt}
                      </button>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  {limitVal > 0 && (
                    <ProgressBar spent={spent} limit={limitVal} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Hidden submit */}
          <button type="submit" id="hidden-goals-submit" className="hidden">Save</button>
        </form>
      </div>

      {/* Sticky Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-transparent z-50 md:pl-72">
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            disabled={status === 'loading'}
            onClick={() => {
              const form = formRef.current
              if (form) form.requestSubmit()
            }}
            className="w-full bg-purple-500 hover:bg-purple-400 text-neutral-950 font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              '💾  Save Goals'
            )}
          </button>
        </div>
      </div>

      {/* Multi-Month Trend */}
      <GoalsTrend data={trendData} />
    </div>
  )
}
