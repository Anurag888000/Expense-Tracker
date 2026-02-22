'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const origin = (await headers()).get('origin')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/update-password`,
  })

  if (error) {
    redirect('/reset-password?error=' + encodeURIComponent(error.message))
  }

  // Assuming email confirmation is not required for test, or user will get an email
  // If required, we should inform user. For now redirect to a success state or login.
  redirect('/reset-password?success=' + encodeURIComponent('Check your email for the password reset link!'))
}
