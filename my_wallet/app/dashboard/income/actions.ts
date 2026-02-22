'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addIncome(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not found')
  }

  const rawFormData = {
    amount: formData.get('amount'),
    source: formData.get('source'),
    date: formData.get('date'),
    time_of_day: formData.get('time_of_day'),
    notes: formData.get('notes'),
  }

  const { error } = await supabase.from('incomes').insert({
    user_id: user.id,
    amount: parseFloat(rawFormData.amount as string),
    source: rawFormData.source as string,
    date: rawFormData.date as string,
    time_of_day: rawFormData.time_of_day as string,
    notes: rawFormData.notes as string || null,
  })

  if (error) {
    console.error('Error inserting income:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
