import { updatePassword } from './actions'
import { Wallet, Lock, AlertCircle } from 'lucide-react'

export default async function UpdatePasswordPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  const error = searchParams.error

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
            <Wallet className="w-10 h-10 text-emerald-400" />
          </div>
        </div>

        <div className="backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-50" />
          
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Update Password</h1>
          <p className="text-neutral-400 text-center mb-8">Enter your new secure password</p>

          {error && (
             <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
             </div>
          )}

          <form action={updatePassword} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="password">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-neutral-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-[0.98] mt-2"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
