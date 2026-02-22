'use client'

import { addIncome } from './actions'
import { useState } from 'react'
import { ArrowDownCircle, CheckCircle2, AlertCircle } from 'lucide-react'

const incomeSources = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Gifts',
  'Other'
]

const timeClassifications = [
  'Morning',
  'Afternoon',
  'Evening',
  'Night',
  'Late Night'
]

export default function AddIncomePage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(formData: FormData) {
    setStatus('loading')
    const result = await addIncome(formData)
    
    if (result?.error) {
      setErrorMessage(result.error)
      setStatus('error')
    } else {
      setStatus('success')
      // Reset form logic could go here
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-500/20 p-3 rounded-2xl">
          <ArrowDownCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Add Income</h1>
          <p className="text-neutral-400">Record your earnings to keep your wallet updated.</p>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500 opacity-50" />
        
        {status === 'success' && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
             <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
             <p className="text-sm">Income added successfully!</p>
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
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="source">Source</label>
              <select
                id="source"
                name="source"
                required
                defaultValue=""
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              >
                <option value="" disabled>Select a source</option>
                {incomeSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300" htmlFor="time_of_day">Time of Day</label>
              <select
                id="time_of_day"
                name="time_of_day"
                required
                defaultValue=""
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              >
                <option value="" disabled>Select time</option>
                {timeClassifications.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300" htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Any details about this income..."
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold py-4 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Saving...' : 'Add Income'}
          </button>
        </form>
      </div>
    </div>
  )
}
