'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getGoalsData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not found' }
  }

  const today = new Date()
  const currentMonthYear = today.toISOString().slice(0, 7)
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

  // Fetch goals, expenses, and incomes in parallel
  const [goalsResult, expensesResult, incomesResult] = await Promise.all([
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('month_year', currentMonthYear)
      .single(),
    supabase
      .from('expenses')
      .select('amount, category')
      .eq('user_id', user.id)
      .gte('date', firstDay)
      .lte('date', lastDay),
    supabase
      .from('incomes')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', firstDay)
      .lte('date', lastDay),
  ])

  const goals = goalsResult.data
  const expenses = expensesResult.data || []
  const incomes = incomesResult.data || []

  // Aggregate spending by category
  const categorySpending: Record<string, number> = {}
  expenses.forEach((exp) => {
    categorySpending[exp.category] = (categorySpending[exp.category] || 0) + Number(exp.amount)
  })

  const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0)
  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

  return {
    goals: {
      monthly_saving_goal: goals?.monthly_saving_goal || 0,
      category_limits: (goals?.category_limits as Record<string, number>) || {},
    },
    categorySpending,
    totalIncome,
    totalExpense,
    currentMonthYear,
  }
}

export async function saveGoals(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated. Please sign in again.' }
  }

  const monthYear = formData.get('month_year') as string
  const monthlySavingGoal = parseFloat(formData.get('monthly_saving_goal') as string)

  // Parse category limits from form data
  const categoryLimits: Record<string, number> = {}
  
  formData.forEach((value, key) => {
    if (key.startsWith('limit_') && value) {
      const category = key.replace('limit_', '')
      categoryLimits[category] = parseFloat(value as string)
    }
  })

  const { error } = await supabase
    .from('goals')
    .upsert(
      {
        user_id: user.id,
        month_year: monthYear,
        monthly_saving_goal: monthlySavingGoal || 0,
        category_limits: categoryLimits
      },
      { onConflict: 'user_id,month_year' }
    )

  if (error) {
    console.error('Error saving goals:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/goals')
  revalidatePath('/dashboard')
  return { success: true }
}

export interface GoalTrendPoint {
  month: string
  savingsGoal: number
  actualSavings: number
  totalIncome: number
  totalExpense: number
}

export async function getGoalsTrend(): Promise<{ data: GoalTrendPoint[] }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: [] }

  const today = new Date()
  const points: GoalTrendPoint[] = []

  // Build month keys and date ranges for last 6 months
  const monthQueries = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthYear = d.toISOString().slice(0, 7) // "YYYY-MM"
    const firstDay = d.toISOString().split('T')[0]
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })

    monthQueries.push({ monthYear, firstDay, lastDay, label })
  }

  // Fetch all goals for last 6 months in one query
  const monthYearKeys = monthQueries.map(m => m.monthYear)
  const { data: allGoals } = await supabase
    .from('goals')
    .select('month_year, monthly_saving_goal')
    .eq('user_id', user.id)
    .in('month_year', monthYearKeys)

  // Fetch all incomes and expenses for the entire 6-month range
  const overallFirst = monthQueries[0].firstDay
  const overallLast = monthQueries[monthQueries.length - 1].lastDay

  const [{ data: allIncomes }, { data: allExpenses }] = await Promise.all([
    supabase
      .from('incomes')
      .select('amount, date')
      .eq('user_id', user.id)
      .gte('date', overallFirst)
      .lte('date', overallLast),
    supabase
      .from('expenses')
      .select('amount, date')
      .eq('user_id', user.id)
      .gte('date', overallFirst)
      .lte('date', overallLast),
  ])

  // Assemble the trend data
  for (const mq of monthQueries) {
    const goal = allGoals?.find(g => g.month_year === mq.monthYear)
    const monthIncome = (allIncomes || [])
      .filter(inc => inc.date >= mq.firstDay && inc.date <= mq.lastDay)
      .reduce((sum, inc) => sum + Number(inc.amount), 0)
    const monthExpense = (allExpenses || [])
      .filter(exp => exp.date >= mq.firstDay && exp.date <= mq.lastDay)
      .reduce((sum, exp) => sum + Number(exp.amount), 0)

    points.push({
      month: mq.label,
      savingsGoal: goal?.monthly_saving_goal || 0,
      actualSavings: monthIncome - monthExpense,
      totalIncome: monthIncome,
      totalExpense: monthExpense,
    })
  }

  return { data: points }
}
