'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const fullName = formData.get('full_name') as string

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    redirect('/dashboard/settings?profile_error=' + encodeURIComponent(error.message))
  }

  redirect('/dashboard/settings?profile_success=true')
}

export async function updatePasswordSettings(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentPassword = formData.get('current_password') as string
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (newPassword !== confirmPassword) {
    redirect('/dashboard/settings?password_error=' + encodeURIComponent('New passwords do not match'))
  }
  
  if (newPassword.length < 6) {
    redirect('/dashboard/settings?password_error=' + encodeURIComponent('New password must be at least 6 characters'))
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })

  if (signInError) {
    redirect('/dashboard/settings?password_error=' + encodeURIComponent('Current password is incorrect'))
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    redirect('/dashboard/settings?password_error=' + encodeURIComponent(updateError.message))
  }

  redirect('/dashboard/settings?password_success=true')
}
