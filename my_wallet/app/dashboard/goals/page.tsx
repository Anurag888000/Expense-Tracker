import { saveGoals } from './actions'
import { Target, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

const categories = [
  '🍔 Food',
  '🚗 Travel',
  '🎬 Entertainment',
  '🛒 Shopping',
  '💡 Utilities',
  '🏥 Health',
  '📚 Education'
]

export default async function GoalsPage(props: { searchParams: Promise<{ success?: string, error?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  const currentMonthYear = new Date().toISOString().slice(0, 7) // 'YYYY-MM'

  // Fetch current goals
  const { data: goalsData } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user?.id)
    .eq('month_year', currentMonthYear)
    .single()

  const monthlySavingGoal = goalsData?.monthly_saving_goal || ''
  const categoryLimits = goalsData?.category_limits || {}

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-purple-500/20 p-3 rounded-2xl">
          <Target className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Monthly Goals</h1>
          <p className="text-neutral-400">Set limits for this month ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})</p>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50" />
        
        {searchParams.success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
             <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
             <p className="text-sm">Goals saved successfully!</p>
          </div>
        )}

        {searchParams.error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
             <AlertCircle className="w-5 h-5 flex-shrink-0" />
             <p className="text-sm">{searchParams.error}</p>
          </div>
        )}

        {/* Server action form */}
        <form action={async (formData) => {
          'use server'
          const res = await saveGoals(formData)
          // Simple server redirect or state pass for alert (next.js app router doesn't allow direct mutate and redirect easily inside same component, so we're relying on a wrapper client form normally, 
          // but for simplicity we'll just handle it directly here if user doesn't care about a hard reload, or we can use a client component wrapper.
          // Because we used an async layout we'll do this trick to preserve pure server components if possible, but actually we need client interactivity for better UX.)
        }} className="space-y-8">
          
          <input type="hidden" name="month_year" value={currentMonthYear} />

          <div className="space-y-4">
             <h2 className="text-xl font-semibold text-white">Savings Goal</h2>
             <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300" htmlFor="monthly_saving_goal">Target Monthly Savings (₹)</label>
                <input
                  id="monthly_saving_goal"
                  name="monthly_saving_goal"
                  type="number"
                  step="0.01"
                  defaultValue={monthlySavingGoal}
                  placeholder="0.00"
                  className="w-full md:w-1/2 bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-lg"
                />
             </div>
          </div>

          <hr className="border-neutral-800" />

          <div className="space-y-4">
             <h2 className="text-xl font-semibold text-white">Category Spending Limits</h2>
             <p className="text-sm text-neutral-400 mb-4">Leave empty if you don't want to set a limit for a category.</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {categories.map(category => (
                  <div key={category} className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300" htmlFor={`limit_${category}`}>{category} Limit</label>
                    <input
                      id={`limit_${category}`}
                      name={`limit_${category}`}
                      type="number"
                      step="0.01"
                      defaultValue={categoryLimits[category] || ''}
                      placeholder="No limit"
                      className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono"
                    />
                  </div>
               ))}
             </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-400 text-neutral-950 font-semibold py-4 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] active:scale-[0.98]"
          >
            Save Goals
          </button>
        </form>
      </div>
    </div>
  )
}
