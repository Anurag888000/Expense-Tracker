'use client'

import { addExpense, getRecentExpenses, deleteExpense } from './actions'
import { useState, useMemo, useRef, useEffect } from 'react'
import { ArrowUpCircle, CheckCircle2, AlertCircle, RotateCcw, Trash2, Loader2 } from 'lucide-react'

const categoriesAndSub = {
  '🍔 Food': ['Buy grocery', 'Eat fast food', 'Eat healthy food', 'Breakfast', 'Lunch', 'Dinner'],
  '🏢 Office Travel': ['Metro ticket', 'Auto / Bike', 'Cab (Ola, Uber)', 'Other'],
  '🌍 Outside Travel': ['Metro card recharge', 'Metro ticket', 'Auto / Bike', 'Cab (Ola, Uber)', 'Bus ticket', 'Train ticket', 'Other'],
  '🎬 Entertainment': ['Movie', 'Events'],
  '🛒 Shopping': ['Online shopping', 'Offline shopping'],
  '💡 Utilities': ['Electricity', 'Rent', 'Wifi', 'Mobile recharge'],
  '🏥 Health': ['Medicine', 'Doctor visit'],
  '📚 Education': ['Books', 'Courses']
}

// Auto-map food sub-categories to time of day
const subCategoryTimeMap: Record<string, string> = {
  'Breakfast': 'Morning',
  'Morning snack': 'Morning',
  'Lunch': 'Afternoon',
  'Day snack': 'Afternoon',
  'Dinner': 'Night',
  'Night snack': 'Night',
  'Late night snack': 'Late Night',
}

const paymentMethods = ['UPI', 'Card', 'Cash', 'Net Banking']
const timeClassifications = ['Morning', 'Afternoon', 'Evening', 'Night', 'Late Night']
const places = ['Home', 'Office', 'Outside']

interface RecentExpense {
  id: string
  amount: number
  category: string
  sub_category: string | null
  date: string
}

export default function AddExpensePage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [selectedPlace, setSelectedPlace] = useState('Outside')
  const [notes, setNotes] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [recentExpenses, setRecentExpenses] = useState<RecentExpense[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Auto-detect current time period
  const getDefaultTime = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Morning'
    if (hour >= 12 && hour < 17) return 'Afternoon'
    if (hour >= 17 && hour < 21) return 'Evening'
    if (hour >= 21 && hour < 24) return 'Night'
    return 'Late Night'
  }
  const [timeOfDay, setTimeOfDay] = useState(getDefaultTime)

  const quickAmounts = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]

  const subCategories = useMemo(() => {
    if (!selectedCategory) return []
    return categoriesAndSub[selectedCategory as keyof typeof categoriesAndSub] || []
  }, [selectedCategory])

  // Fetch recent expenses from DB
  async function loadRecent() {
    const result = await getRecentExpenses()
    setRecentExpenses(result.data)
  }

  useEffect(() => {
    loadRecent()
  }, [])

  function handleCategoryChange(cat: string) {
    setSelectedCategory(cat)
    setSelectedSubCategory('')
  }

  function handleSubCategoryChange(sub: string) {
    setSelectedSubCategory(sub)
    // Auto-set time of day for food items
    if (selectedCategory === '🍔 Food' && subCategoryTimeMap[sub]) {
      setTimeOfDay(subCategoryTimeMap[sub])
    }
  }

  function resetForm() {
    setAmount('')
    setSelectedCategory('')
    setSelectedSubCategory('')
    setPaymentMethod('UPI')
    setTimeOfDay(getDefaultTime())
    setSelectedPlace('Outside')
    setNotes('')
    setStatus('idle')
    setShowResetConfirm(false)
  }

  async function handleSubmit(formData: FormData) {
    setStatus('loading')
    const result = await addExpense(formData)
    
    if (result?.error) {
      setErrorMessage(result.error)
      setStatus('error')
    } else {
      setStatus('success')
      await loadRecent()
      setTimeout(() => {
        resetForm()
      }, 1500)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deleteExpense(id)
    if (!result.error) {
      await loadRecent()
    }
    setDeletingId(null)
  }

  // Format amount for display
  const displayAmount = parseFloat(amount) || 0

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/20 p-3 rounded-2xl">
            <ArrowUpCircle className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Add Expense</h1>
            <p className="text-neutral-400">Track where your money is going.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (amount || selectedCategory || notes) {
              setShowResetConfirm(true)
            } else {
              resetForm()
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-400 text-sm font-medium hover:bg-neutral-700 hover:text-neutral-300 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Reset Form?</h3>
            <p className="text-sm text-neutral-400 mb-6">This will clear all fields. Are you sure?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 text-sm font-medium hover:bg-neutral-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={resetForm}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-50" />
        
        {status === 'success' && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
             <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
             <p className="text-sm">Expense added successfully! Resetting form...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
             <AlertCircle className="w-5 h-5 flex-shrink-0" />
             <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Big Amount Display */}
        <div className="text-center mb-8 py-6 bg-neutral-950/50 rounded-2xl border border-neutral-800">
          <p className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-2">Total Amount</p>
          <p className={`text-5xl font-bold font-mono transition-colors ${displayAmount > 0 ? 'text-red-400' : 'text-neutral-600'}`}>
            ₹{displayAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <form ref={formRef} action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-neutral-300">Quick Add Amount</label>
              {/* Quick-add preset buttons */}
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(prev => String((parseFloat(prev) || 0) + preset))}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all active:scale-95"
                  >
                    +₹{preset.toLocaleString('en-IN')}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs font-semibold hover:bg-neutral-700 transition-all active:scale-95"
                >
                  Clear
                </button>
              </div>
              {/* Manual input */}
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-red-400 font-bold text-xl pointer-events-none">₹</span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Or type amount manually..."
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 pl-9 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-mono text-lg"
                />
              </div>
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

            {/* Spacer on desktop */}
            <div className="hidden md:block" />

            {/* Hidden inputs for form submission */}
            <input type="hidden" name="category" value={selectedCategory} />
            <input type="hidden" name="sub_category" value={selectedSubCategory} />
            <input type="hidden" name="payment_method" value={paymentMethod} />
            <input type="hidden" name="time_of_day" value={timeOfDay} />
            <input type="hidden" name="place" value={selectedPlace} />

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-medium text-neutral-300">Category</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(categoriesAndSub).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all active:scale-95 ${
                      selectedCategory === cat
                        ? 'bg-red-500/20 border-red-500/50 text-red-400'
                        : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {selectedCategory && (
              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-medium text-neutral-300">Sub-category</label>
                <div className="flex flex-wrap gap-2">
                  {subCategories.map(sub => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSubCategoryChange(sub)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all active:scale-95 ${
                        selectedSubCategory === sub
                          ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                          : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-medium text-neutral-300">Payment Method</label>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all active:scale-95 ${
                      paymentMethod === method
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
                    }`}
                  >
                    {method === 'UPI' ? '📱 UPI' : method === 'Card' ? '💳 Card' : method === 'Cash' ? '💵 Cash' : '🏦 Net Banking'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-medium text-neutral-300">Time of Day</label>
              <div className="flex flex-wrap gap-2">
                {timeClassifications.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setTimeOfDay(time)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all active:scale-95 ${
                      timeOfDay === time
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
                    }`}
                  >
                    {time === 'Morning' ? '🌅 Morning' : time === 'Afternoon' ? '☀️ Afternoon' : time === 'Evening' ? '🌆 Evening' : time === 'Night' ? '🌙 Night' : '🌃 Late Night'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 md:col-span-2">
               <label className="text-sm font-medium text-neutral-300">Place</label>
               <div className="flex gap-3">
                 {places.map(place => (
                    <button
                      key={place}
                      type="button"
                      onClick={() => setSelectedPlace(place)}
                      className={`flex-1 text-center py-3 px-4 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                        selectedPlace === place
                          ? 'bg-red-500/10 border-red-500/50 text-red-400'
                          : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
                      }`}
                    >
                      {place === 'Home' ? '🏠 Home' : place === 'Office' ? '🏢 Office' : '🌍 Outside'}
                    </button>
                 ))}
               </div>
            </div>

            <div className="space-y-2 md:col-span-2 border-t border-neutral-800 pt-6 mt-2">
              <label className="text-sm font-medium text-neutral-300">Make Recurring?</label>
              <select
                name="frequency"
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-medium"
              >
                <option value="None">None (One-time)</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
              <p className="text-xs text-neutral-500 mt-1">If selected, this expense will automatically repeat on your dashboard.</p>
            </div>
            
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300" htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details about this expense..."
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none"
            />
          </div>

          <div className="hidden">
            <button type="submit" id="hidden-submit">Submit</button>
          </div>
        </form>
      </div>

      {/* Recent Expenses from DB */}
      {recentExpenses.length > 0 && (
        <div className="mt-6 backdrop-blur-xl bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Recent Expenses</h3>
          <div className="space-y-3">
            {recentExpenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-neutral-950/50 border border-neutral-800 group">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{exp.category.split(' ')[0]}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{exp.sub_category || exp.category}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(exp.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-red-400 font-mono font-semibold">-₹{Number(exp.amount).toLocaleString('en-IN')}</p>
                  <button
                    type="button"
                    disabled={deletingId === exp.id}
                    onClick={() => handleDelete(exp.id)}
                    className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === exp.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-transparent z-50 md:pl-72">
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            disabled={status === 'loading'}
            onClick={() => {
              const form = formRef.current
              if (form) form.requestSubmit()
            }}
            className="w-full bg-red-500 hover:bg-red-400 text-neutral-950 font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {status === 'loading' ? 'Saving...' : `Add Expense${displayAmount > 0 ? ` — ₹${displayAmount.toLocaleString('en-IN')}` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
