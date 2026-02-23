import { createClient } from '@/utils/supabase/server'
import ReportsClient from './ReportsClient'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get view type from query params (default: daily)
  const view = (params.view as string) || 'daily'
  const dateParam = params.date as string
  const fromParam = params.from as string
  const toParam = params.to as string

  const today = new Date()
  let startDate: string
  let endDate: string
  let periodLabel: string

  if (view === 'custom' && fromParam && toParam) {
    startDate = fromParam
    endDate = toParam
    const fromLabel = new Date(fromParam + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const toLabel = new Date(toParam + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    periodLabel = `${fromLabel} — ${toLabel}`
  } else if (view === 'monthly') {
    // Full current month (or specified month)
    const targetDate = dateParam ? new Date(dateParam) : today
    startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString().split('T')[0]
    endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).toISOString().split('T')[0]
    periodLabel = targetDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  } else if (view === 'weekly') {
    // Current week (Mon-Sun)
    const targetDate = dateParam ? new Date(dateParam) : today
    const dayOfWeek = targetDate.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(targetDate)
    monday.setDate(targetDate.getDate() + mondayOffset)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    startDate = monday.toISOString().split('T')[0]
    endDate = sunday.toISOString().split('T')[0]
    periodLabel = `${monday.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${sunday.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
  } else {
    // Daily - specific day
    const targetDate = dateParam || today.toISOString().split('T')[0]
    startDate = targetDate
    endDate = targetDate
    periodLabel = new Date(targetDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Fetch incomes and expenses in parallel with specific fields
  const [{ data: incomes }, { data: expenses }] = await Promise.all([
    supabase
      .from('incomes')
      .select('id, amount, source, date, time_of_day, notes')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false }),
    supabase
      .from('expenses')
      .select('id, amount, category, sub_category, payment_method, time_of_day, place, date, notes')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false }),
  ])

  const totalIncome = incomes?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const totalExpense = expenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const netSavings = totalIncome - totalExpense

  // Category breakdown for expenses
  const categoryMap: Record<string, number> = {}
  expenses?.forEach(exp => {
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + Number(exp.amount)
  })
  const categoryBreakdown = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Source breakdown for incomes
  const sourceMap: Record<string, number> = {}
  incomes?.forEach(inc => {
    sourceMap[inc.source] = (sourceMap[inc.source] || 0) + Number(inc.amount)
  })
  const sourceBreakdown = Object.entries(sourceMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Navigation dates
  const prevDate = new Date(startDate)
  const nextDate = new Date(endDate)

  if (view === 'monthly') {
    prevDate.setMonth(prevDate.getMonth() - 1)
    nextDate.setMonth(nextDate.getMonth() + 1)
  } else if (view === 'weekly') {
    prevDate.setDate(prevDate.getDate() - 7)
    nextDate.setDate(nextDate.getDate() + 7)
  } else {
    prevDate.setDate(prevDate.getDate() - 1)
    nextDate.setDate(nextDate.getDate() + 1)
  }

  return (
    <ReportsClient
      view={view}
      periodLabel={periodLabel}
      totalIncome={totalIncome}
      totalExpense={totalExpense}
      netSavings={netSavings}
      incomes={incomes || []}
      expenses={expenses || []}
      categoryBreakdown={categoryBreakdown}
      sourceBreakdown={sourceBreakdown}
      prevDateParam={prevDate.toISOString().split('T')[0]}
      nextDateParam={nextDate.toISOString().split('T')[0]}
      currentDate={startDate}
    />
  )
}
