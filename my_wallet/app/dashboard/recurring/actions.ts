'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface RecurringTransaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  sub_category?: string | null
  frequency: 'weekly' | 'monthly' | 'yearly'
  next_date: string
  created_at: string
}

export async function getRecurringTransactions() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('next_date', { ascending: true })

  if (error) {
    return { data: [], error: 'Error fetching recurring transactions' }
  }

  return { data: data as RecurringTransaction[] }
}

export async function cancelRecurringTransaction(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('recurring_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting recurring transaction:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/recurring')
  return { success: true }
}
