import { updateProfile, updatePasswordSettings } from './actions'
import { Settings, CheckCircle2, AlertCircle, User, Lock } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

export default async function SettingsPage(props: { searchParams: Promise<{ profile_success?: string, profile_error?: string, password_success?: string, password_error?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch current profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-neutral-800 p-3 rounded-2xl border border-neutral-700">
          <Settings className="w-8 h-8 text-neutral-300" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-neutral-400">Manage your account preferences and profile.</p>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-neutral-600 to-neutral-400 opacity-50" />
        
        {searchParams.profile_success && (
           <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Profile updated successfully!</p>
           </div>
        )}

        {searchParams.profile_error && (
           <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{searchParams.profile_error}</p>
           </div>
        )}

        <form action={updateProfile} className="space-y-6">
          
          <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="full_name">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-neutral-500" />
                </div>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  defaultValue={profile?.full_name || user.user_metadata?.full_name || ''}
                  placeholder="John Doe"
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/50 focus:border-neutral-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                disabled
                defaultValue={user.email}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-neutral-500 cursor-not-allowed opacity-70"
              />
              <p className="text-xs text-neutral-500 mt-1">Email cannot be changed currently.</p>
            </div>
          </div>

          <button
            type="submit"
            className="bg-white hover:bg-neutral-200 text-neutral-950 font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-[0.98] mt-4"
          >
            Save Changes
          </button>
        </form>

        <div className="my-10 border-t border-neutral-800" />

        {searchParams.password_success && (
           <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Password updated successfully!</p>
           </div>
        )}

        {searchParams.password_error && (
           <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{searchParams.password_error}</p>
           </div>
        )}

        <form action={updatePasswordSettings} className="space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Change Password</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300" htmlFor="current_password">Current Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-neutral-500" />
              </div>
              <input
                id="current_password"
                name="current_password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full md:w-1/2 bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/50 focus:border-neutral-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="new_password">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-neutral-500" />
                </div>
                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/50 focus:border-neutral-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="confirm_password">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-neutral-500" />
                </div>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/50 focus:border-neutral-500 transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="bg-white hover:bg-neutral-200 text-neutral-950 font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-[0.98] mt-4"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}
