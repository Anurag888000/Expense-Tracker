'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string // Used for expense category or income source
  sub_category?: string | null
  payment_method?: string | null
  time_of_day: string
  place?: string | null // Used for expense place
  date: string
  notes: string | null
  created_at: string
}

export async function getTransactions(limit = 100) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'Not authenticated' }

  const [{ data: incomes, error: incomesError }, { data: expenses, error: expensesError }] = await Promise.all([
    supabase
      .from('incomes')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit),
  ])

  if (incomesError || expensesError) {
    return { data: [], error: 'Error fetching transactions' }
  }

  // Map and combine
  const formattedIncomes: Transaction[] = (incomes || []).map((inc) => ({
    id: inc.id,
    type: 'income',
    amount: inc.amount,
    category: inc.source, // Mapping source to category for uniform UI
    time_of_day: inc.time_of_day,
    date: inc.date,
    notes: inc.notes,
    created_at: inc.created_at,
  }))

  const formattedExpenses: Transaction[] = (expenses || []).map((exp) => ({
    id: exp.id,
    type: 'expense',
    amount: exp.amount,
    category: exp.category,
    sub_category: exp.sub_category,
    payment_method: exp.payment_method,
    time_of_day: exp.time_of_day,
    place: exp.place,
    date: exp.date,
    notes: exp.notes,
    created_at: exp.created_at,
  }))

  const allTransactions = [...formattedIncomes, ...formattedExpenses].sort((a, b) => {
    // Sort primarily by date, then by created_at time
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
    if (dateDiff !== 0) return dateDiff
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // Since we fetch `limit` from both, then combine, we might have 2x `limit` items
  // which we need to trim back down, or just return them all.
  // Returning all up to combined limit is simpler for the UI.
  return { data: allTransactions.slice(0, limit) }
}

export async function deleteTransaction(type: TransactionType, id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const tableName = type === 'income' ? 'incomes' : 'expenses'

  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error(`Error deleting ${type}:`, error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/history')
  revalidatePath('/dashboard/reports')
  revalidatePath('/dashboard/goals')
  
  return { success: true }
}

export async function updateTransaction(
  type: TransactionType,
  id: string,
  updates: Partial<Transaction>
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Map uniform UI fields back to DB schema
  const dbUpdates: any = {}
  
  // Validation common to both
  if (updates.amount !== undefined) {
      if (isNaN(updates.amount) || updates.amount <= 0) return { error: 'Amount must be positive' }
      dbUpdates.amount = updates.amount
  }
  if (updates.date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(updates.date)) return { error: 'Invalid date format' }
      dbUpdates.date = updates.date
  }
  if (updates.time_of_day !== undefined) dbUpdates.time_of_day = updates.time_of_day
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null

  const tableName = type === 'income' ? 'incomes' : 'expenses'

  if (type === 'income') {
    if (updates.category) dbUpdates.source = updates.category 
  } else {
    if (updates.category) dbUpdates.category = updates.category
    if (updates.sub_category !== undefined) dbUpdates.sub_category = updates.sub_category || null
    if (updates.payment_method !== undefined) dbUpdates.payment_method = updates.payment_method
    if (updates.place !== undefined) dbUpdates.place = updates.place
  }

  const { error } = await supabase
    .from(tableName)
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error(`Error updating ${type}:`, error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/history')
  revalidatePath('/dashboard/reports')
  revalidatePath('/dashboard/goals')
  
  return { success: true }
}
