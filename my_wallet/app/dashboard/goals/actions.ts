'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveGoals(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not found')
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
  return { success: true }
}
