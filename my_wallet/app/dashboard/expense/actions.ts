'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addExpense(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated. Please sign in again.' }
  }

  const rawAmount = formData.get('amount') as string
  const category = (formData.get('category') as string || '').trim()
  const subCategory = (formData.get('sub_category') as string || '').trim()
  const paymentMethod = (formData.get('payment_method') as string || '').trim()
  const timeOfDay = formData.get('time_of_day') as string
  const place = (formData.get('place') as string || '').trim()
  const date = formData.get('date') as string
  const notes = (formData.get('notes') as string || '').trim()
  const frequency = formData.get('frequency') as string || 'None'

  // Validation
  const amount = parseFloat(rawAmount)
  if (isNaN(amount) || amount <= 0) {
    return { error: 'Amount must be a positive number.' }
  }

  if (!category) {
    return { error: 'Please select a category.' }
  }

  if (!paymentMethod) {
    return { error: 'Please select a payment method.' }
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: 'Please select a valid date.' }
  }

  // Insert the current transaction
  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    amount,
    category,
    sub_category: subCategory || null,
    payment_method: paymentMethod,
    time_of_day: timeOfDay || 'N/A',
    place: place || 'Outside',
    date,
    notes: notes || null,
  })

  if (error) {
    console.error('Error inserting expense:', error)
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
      type: 'expense',
      amount,
      category,
      sub_category: subCategory || null,
      payment_method: paymentMethod,
      time_of_day: timeOfDay || 'N/A',
      place: place || 'Outside',
      notes: notes || null,
      frequency: frequency.toLowerCase(),
      next_date: nextDate.toISOString().split('T')[0]
    })

    if (recurError) console.error('Error setting up recurring expense:', recurError)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/history')
  revalidatePath('/dashboard/reports')
  revalidatePath('/dashboard/goals')
  return { success: true }
}

export async function getRecentExpenses() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: [] }

  const { data } = await supabase
    .from('expenses')
    .select('id, amount, category, sub_category, date')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return { data: data || [] }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting expense:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/reports')
  revalidatePath('/dashboard/goals')
  return { success: true }
}
