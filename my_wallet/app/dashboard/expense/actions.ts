'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addExpense(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not found')
  }

  const rawFormData = {
    amount: formData.get('amount'),
    category: formData.get('category'),
    sub_category: formData.get('sub_category'),
    payment_method: formData.get('payment_method'),
    time_of_day: formData.get('time_of_day'),
    place: formData.get('place'),
    date: formData.get('date'),
    notes: formData.get('notes'),
  }

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    amount: parseFloat(rawFormData.amount as string),
    category: rawFormData.category as string,
    sub_category: rawFormData.sub_category as string || null,
    payment_method: rawFormData.payment_method as string,
    time_of_day: rawFormData.time_of_day as string,
    place: rawFormData.place as string,
    date: rawFormData.date as string,
    notes: rawFormData.notes as string || null,
  })

  if (error) {
    console.error('Error inserting expense:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
