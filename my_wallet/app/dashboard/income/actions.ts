'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addIncome(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated. Please sign in again.' }
  }

  const rawAmount = formData.get('amount') as string
  const source = (formData.get('source') as string || '').trim()
  const date = formData.get('date') as string
  const timeOfDay = formData.get('time_of_day') as string
  const notes = (formData.get('notes') as string || '').trim()
  const frequency = formData.get('frequency') as string || 'None'

  // Validation
  const amount = parseFloat(rawAmount)
  if (isNaN(amount) || amount <= 0) {
    return { error: 'Amount must be a positive number.' }
  }

  if (!source) {
    return { error: 'Please select an income source.' }
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: 'Please select a valid date.' }
  }

  // Insert the current transaction
  const { error } = await supabase.from('incomes').insert({
    user_id: user.id,
    amount,
    source,
    date,
    time_of_day: timeOfDay || 'N/A',
    notes: notes || null,
  })

  if (error) {
    console.error('Error inserting income:', error)
    return { error: error.message }
  }

  // Insert recurring template if selected
  if (frequency !== 'None') {
    // Calculate the next date
    const currentDate = new Date(date)
    let nextDate = new Date(currentDate)
    
    if (frequency === 'Weekly') nextDate.setDate(currentDate.getDate() + 7)
    else if (frequency === 'Monthly') nextDate.setMonth(currentDate.getMonth() + 1)
    else if (frequency === 'Yearly') nextDate.setFullYear(currentDate.getFullYear() + 1)

    const { error: recurError } = await supabase.from('recurring_transactions').insert({
      user_id: user.id,
      type: 'income',
      amount,
      category: source, // Incomes use 'source' for their category field
      time_of_day: timeOfDay || 'N/A',
      notes: notes || null,
      frequency: frequency.toLowerCase(),
      next_date: nextDate.toISOString().split('T')[0]
    })

    if (recurError) console.error('Error setting up recurring income:', recurError)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/history')
  revalidatePath('/dashboard/reports')
  revalidatePath('/dashboard/goals')
  return { success: true }
}

export async function getRecentIncomes() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: [] }

  const { data } = await supabase
    .from('incomes')
    .select('id, amount, source, date')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return { data: data || [] }
}

export async function deleteIncome(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase
    .from('incomes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting income:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/reports')
  revalidatePath('/dashboard/goals')
  return { success: true }
}
