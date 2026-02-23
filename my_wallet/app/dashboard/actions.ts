'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function processRecurringTransactions() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  // Find all recurring transactions where next_date is today or in the past
  const today = new Date().toISOString().split('T')[0]
  
  const { data: dueTransactions, error } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', user.id)
    .lte('next_date', today)

  if (error || !dueTransactions || dueTransactions.length === 0) {
    return
  }

  for (const template of dueTransactions) {
    // 1. Insert into actual incomes or expenses table
    if (template.type === 'income') {
      const { error: incError } = await supabase.from('incomes').insert({
        user_id: user.id,
        amount: template.amount,
        source: template.category,
        date: template.next_date, // Log it on the date it was due
        time_of_day: template.time_of_day || 'N/A',
        notes: `[Auto-added ${template.frequency}] ` + (template.notes || '')
      })
      if (incError) console.error('Failed to auto-add income:', incError)
    } else {
      const { error: expError } = await supabase.from('expenses').insert({
        user_id: user.id,
        amount: template.amount,
        category: template.category,
        sub_category: template.sub_category,
        payment_method: template.payment_method || 'Cash',
        time_of_day: template.time_of_day || 'N/A',
        place: template.place || 'Outside',
        date: template.next_date, // Log it on the date it was due
        notes: `[Auto-added ${template.frequency}] ` + (template.notes || '')
      })
      if (expError) console.error('Failed to auto-add expense:', expError)
    }

    // 2. Calculate the *next* next_date
    const currentNextDate = new Date(template.next_date)
    let bumpedDate = new Date(currentNextDate)
    
    if (template.frequency === 'weekly') bumpedDate.setDate(currentNextDate.getDate() + 7)
    else if (template.frequency === 'monthly') bumpedDate.setMonth(currentNextDate.getMonth() + 1)
    else if (template.frequency === 'yearly') bumpedDate.setFullYear(currentNextDate.getFullYear() + 1)

    // 3. Update the template's next_date
    await supabase
      .from('recurring_transactions')
      .update({ next_date: bumpedDate.toISOString().split('T')[0] })
      .eq('id', template.id)
  }

  // Once all due transactions are processed, revalidate
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/history')
  revalidatePath('/dashboard/reports')
}
