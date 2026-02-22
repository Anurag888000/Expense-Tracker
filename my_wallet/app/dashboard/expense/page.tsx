'use client'

import { addExpense } from './actions'
import { useState, useMemo } from 'react'
import { ArrowUpCircle, CheckCircle2, AlertCircle } from 'lucide-react'

const categoriesAndSub = {
  '🍔 Food': ['Buy grocery', 'Eat fast food', 'Eat healthy food', 'Breakfast', 'Lunch', 'Dinner', 'Morning snack', 'Day snack', 'Night snack', 'Late night snack'],
  '🚗 Travel': ['Office travel', 'Other place travel'],
  '🎬 Entertainment': ['Movie', 'Events'],
  '🛒 Shopping': ['Online shopping', 'Offline shopping'],
  '💡 Utilities': ['Electricity', 'Water', 'Internet', 'Mobile recharge'],
  '🏥 Health': ['Medicine', 'Doctor visit'],
  '📚 Education': ['Books', 'Courses']
}

const paymentMethods = ['UPI', 'Card', 'Cash', 'Net Banking']
const timeClassifications = ['Morning', 'Afternoon', 'Evening', 'Night', 'Late Night']
const places = ['Home', 'Office', 'Outside']

export default function AddExpensePage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const subCategories = useMemo(() => {
    if (!selectedCategory) return []
    return categoriesAndSub[selectedCategory as keyof typeof categoriesAndSub] || []
  }, [selectedCategory])

  async function handleSubmit(formData: FormData) {
    setStatus('loading')
    const result = await addExpense(formData)
    
    if (result?.error) {
      setErrorMessage(result.error)
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-500/20 p-3 rounded-2xl">
          <ArrowUpCircle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Add Expense</h1>
          <p className="text-neutral-400">Track where your money is going.</p>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-50" />
        
        {status === 'success' && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
             <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
             <p className="text-sm">Expense added successfully!</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
             <AlertCircle className="w-5 h-5 flex-shrink-0" />
             <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="amount">Amount (₹)</label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-mono text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                required
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
              >
                <option value="" disabled>Select a category</option>
                {Object.keys(categoriesAndSub).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="sub_category">Sub-category</label>
              <select
                id="sub_category"
                name="sub_category"
                required
                disabled={!selectedCategory}
                defaultValue=""
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all disabled:opacity-50"
              >
                <option value="" disabled>Select sub-category</option>
                {subCategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="payment_method">Payment Method</label>
              <select
                id="payment_method"
                name="payment_method"
                required
                defaultValue=""
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
              >
                <option value="" disabled>Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="time_of_day">Time of Day</label>
              <select
                id="time_of_day"
                name="time_of_day"
                required
                defaultValue=""
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
              >
                <option value="" disabled>Select time</option>
                {timeClassifications.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
               <label className="text-sm font-medium text-neutral-300" htmlFor="place">Place</label>
               <div className="flex gap-4">
                 {places.map(place => (
                    <label key={place} className="flex-1 cursor-pointer">
                      <input type="radio" name="place" value={place} className="peer sr-only" required />
                      <div className="w-full text-center py-3 px-4 rounded-xl border border-neutral-800 bg-neutral-950/50 text-neutral-400 peer-checked:bg-red-500/10 peer-checked:border-red-500/50 peer-checked:text-red-400 transition-all">
                        {place}
                      </div>
                    </label>
                 ))}
               </div>
            </div>
            
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300" htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Any details about this expense..."
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-red-500 hover:bg-red-400 text-neutral-950 font-semibold py-4 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Saving...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}
