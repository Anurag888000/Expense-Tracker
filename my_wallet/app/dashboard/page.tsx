import { createClient } from '@/utils/supabase/server'
import { ExpensePieChart, IncomeExpenseBarChart } from './components/Charts'
import BudgetAlerts, { BudgetAlert } from './components/BudgetAlerts'
import { processRecurringTransactions } from './actions'

import QuickAddFAB from './components/QuickAddFAB'
import RecentTransactions, { Transaction } from './components/RecentTransactions'
import UpcomingRecurring, { UpcomingTransaction } from './components/UpcomingRecurring'
import TopCategories, { TopCategory } from './components/TopCategories'

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Trigger lazy processing of recurring transactions for this user.
  processRecurringTransactions()

  // Current month date range
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
  const currentMonthYear = `${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`

  // Previous month date range
  const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const prevMonthFirstDay = prevMonthDate.toISOString().split('T')[0]
  const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0]

  // Fetch last 6 months date range for bar chart
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1)
  const sixMonthsFirstDay = sixMonthsAgo.toISOString().split('T')[0]

  // Next 7 days for upcoming recurring
  const next7Days = new Date(today)
  next7Days.setDate(next7Days.getDate() + 7)
  const next7DaysStr = next7Days.toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]

  // Parallel queries
  const [
    { data: incomes },
    { data: expenses },
    { data: allIncomes6m },
    { data: allExpenses6m },
    { data: goalData },
    { data: prevIncomes },
    { data: prevExpenses },
    { data: recentIncomes },
    { data: recentExpenses },
    { data: upcomingRecurringData }
  ] = await Promise.all([
    supabase.from('incomes').select('amount, source').eq('user_id', user.id).gte('date', firstDay).lte('date', lastDay),
    supabase.from('expenses').select('amount, category').eq('user_id', user.id).gte('date', firstDay).lte('date', lastDay),
    supabase.from('incomes').select('amount, date').eq('user_id', user.id).gte('date', sixMonthsFirstDay).lte('date', lastDay),
    supabase.from('expenses').select('amount, date').eq('user_id', user.id).gte('date', sixMonthsFirstDay).lte('date', lastDay),
    supabase.from('goals').select('category_limits').eq('user_id', user.id).eq('month_year', currentMonthYear).single(),
    supabase.from('incomes').select('amount').eq('user_id', user.id).gte('date', prevMonthFirstDay).lte('date', prevMonthLastDay),
    supabase.from('expenses').select('amount').eq('user_id', user.id).gte('date', prevMonthFirstDay).lte('date', prevMonthLastDay),
    supabase.from('incomes').select('id, amount, source, date, notes').eq('user_id', user.id).order('date', { ascending: false }).limit(10),
    supabase.from('expenses').select('id, amount, category, date, notes').eq('user_id', user.id).order('date', { ascending: false }).limit(10),
    supabase.from('recurring_transactions').select('id, type, amount, category, next_date, frequency').eq('user_id', user.id).gte('next_date', todayStr).lte('next_date', next7DaysStr).order('next_date', { ascending: true })
  ])

  // Current month totals
  const totalIncome = incomes?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const totalExpense = expenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const balance = totalIncome - totalExpense

  // Savings rate
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0
  const savingsRateClamped = Math.max(0, savingsRate)

  // Previous month totals & MoM calculations
  const totalPrevIncome = prevIncomes?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const totalPrevExpense = prevExpenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const prevBalance = totalPrevIncome - totalPrevExpense

  const calcMoM = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? 100 : 0
    return ((current - prev) / prev) * 100
  }

  const incomeMoM = calcMoM(totalIncome, totalPrevIncome)
  const expenseMoM = calcMoM(totalExpense, totalPrevExpense)

  // 6-month bar chart data
  const barData: { name: string; Income: number; Expense: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthStart = d.toISOString().split('T')[0]
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
    const monthLabel = d.toLocaleDateString('en-IN', { month: 'short' })

    const monthIncome = allIncomes6m?.filter(inc => inc.date >= monthStart && inc.date <= monthEnd).reduce((sum, item) => sum + Number(item.amount), 0) || 0
    const monthExpense = allExpenses6m?.filter(exp => exp.date >= monthStart && exp.date <= monthEnd).reduce((sum, item) => sum + Number(item.amount), 0) || 0

    barData.push({ name: monthLabel, Income: monthIncome, Expense: monthExpense })
  }

  // Categories & Pie Chart Data
  const categoryMap: Record<string, number> = {}
  expenses?.forEach(exp => {
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + Number(exp.amount)
  })
  
  const pieData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key]
  }))

  const topCategoriesArray: TopCategory[] = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalExpense > 0 ? Math.round((value / totalExpense) * 100) : 0
    }))

  // Budget formatting
  const alerts: BudgetAlert[] = []
  const categoryLimits = goalData?.category_limits || {}

  for (const [cat, limit] of Object.entries(categoryLimits)) {
    const limitNum = Number(limit)
    if (limitNum <= 0) continue
    const spent = categoryMap[cat] || 0
    if (spent > 0) {
      const ratio = spent / limitNum
      if (ratio >= 1.0) alerts.push({ category: cat, spent, limit: limitNum, type: 'danger' })
      else if (ratio >= 0.8) alerts.push({ category: cat, spent, limit: limitNum, type: 'warning' })
    }
  }

  // Combine & Sort Recent Transactions
  let combinedTransactions: Transaction[] = []
  if (recentIncomes) {
    combinedTransactions.push(...recentIncomes.map(inc => ({
      id: `inc-${inc.id}`,
      type: 'income' as const,
      amount: inc.amount,
      category: inc.source,
      date: inc.date,
      description: inc.notes
    })))
  }
  if (recentExpenses) {
    combinedTransactions.push(...recentExpenses.map(exp => ({
      id: `exp-${exp.id}`,
      type: 'expense' as const,
      amount: exp.amount,
      category: exp.category,
      date: exp.date,
      description: exp.notes
    })))
  }
  combinedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  combinedTransactions = combinedTransactions.slice(0, 8) // show top 8

  // Helper for MoM formatting
  const formatMoM = (val: number, isGoodLogic: (val: number) => boolean) => {
    const isGood = isGoodLogic(val)
    const isZero = val === 0
    if (isZero) return null
    return (
      <span className={`text-xs font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full ${isGood ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
        {val > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(val).toFixed(0)}%
      </span>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-20 md:pb-6 relative">
      <QuickAddFAB />
      <BudgetAlerts alerts={alerts} />
      
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Balance Card */}
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-neutral-400 font-medium">Total Balance</h3>
            {savingsRate > 0 && (
              <span className="text-xs bg-indigo-500/10 text-indigo-400 font-medium px-2 py-1 rounded-lg">
                {savingsRate.toFixed(1)}% Saved
              </span>
            )}
          </div>
          <p className="text-3xl lg:text-4xl font-bold text-white relative z-10 mb-4">₹{balance.toFixed(2)}</p>
          
          <div className="w-full bg-neutral-800/50 rounded-full h-1.5 relative z-10 overflow-hidden">
             <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(savingsRateClamped, 100)}%` }} />
          </div>
        </div>
        
        {/* Income Card */}
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500 opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-neutral-400 font-medium">Total Income</h3>
            {formatMoM(incomeMoM, (v) => v >= 0)}
          </div>
          <p className="text-3xl lg:text-4xl font-bold text-emerald-400 relative z-10">₹{totalIncome.toFixed(2)}</p>
          
          <p className="text-xs text-neutral-500 mt-4 relative z-10">
            {prevMonthDate.toLocaleDateString('en-IN', {month: 'long'})}: ₹{totalPrevIncome.toFixed(2)}
          </p>
        </div>

        {/* Expense Card */}
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl relative overflow-hidden group hover:border-red-500/30 transition-colors">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-neutral-400 font-medium">Total Expense</h3>
            {formatMoM(expenseMoM, (v) => v <= 0)}
          </div>
          <p className="text-3xl lg:text-4xl font-bold text-red-500 relative z-10">₹{totalExpense.toFixed(2)}</p>

          <p className="text-xs text-neutral-500 mt-4 relative z-10">
            {prevMonthDate.toLocaleDateString('en-IN', {month: 'long'})}: ₹{totalPrevExpense.toFixed(2)}
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-5 md:p-6 rounded-3xl h-[400px] relative overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-6">Income vs Expense (6 Months)</h3>
            <div className="flex-1 w-full relative z-10">
               <IncomeExpenseBarChart data={barData} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="min-h-[250px]">
              <TopCategories categories={topCategoriesArray} />
            </div>
            
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-5 md:p-6 rounded-3xl h-[300px] relative overflow-hidden flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-4">Expense Distribution</h3>
              <div className="flex-1 w-full relative z-10 min-h-0">
                 <ExpensePieChart data={pieData} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar Section */}
        <div className="lg:col-span-1 space-y-6 flex flex-col"> 
          <div className="shrink-0 max-h-[250px]">
             <UpcomingRecurring upcoming={upcomingRecurringData as UpcomingTransaction[] || []} />
          </div>
          
          <div className="flex-1 min-h-[400px]">
            <RecentTransactions transactions={combinedTransactions} />
          </div>
        </div>

      </div>
    </div>
  )
}
