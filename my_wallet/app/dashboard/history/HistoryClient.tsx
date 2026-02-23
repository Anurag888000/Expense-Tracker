'use client'

import { useState, useMemo } from 'react'
import { Transaction, deleteTransaction, updateTransaction } from './actions'
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  ArrowUpCircle, 
  ArrowDownCircle,
  X,
  Loader2,
  Calendar
} from 'lucide-react'

// Same categories from expense page for the edit modal
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

const incomeSources = ['Salary', 'Home', 'Freelance', 'Other']
const paymentMethods = ['UPI', 'Card', 'Cash', 'Net Banking']
const timeClassifications = ['Morning', 'Afternoon', 'Evening', 'Night', 'Late Night']
const places = ['Home', 'Office', 'Outside']

export default function HistoryClient({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  
  // Modals state
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  
  // Loading states
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Derived state for filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Type filter
      if (filterType !== 'all' && tx.type !== filterType) return false
      
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchCategory = tx.category.toLowerCase().includes(term)
        const matchSub = tx.sub_category?.toLowerCase().includes(term)
        const matchNotes = tx.notes?.toLowerCase().includes(term)
        const matchPlace = tx.place?.toLowerCase().includes(term)
        
        if (!matchCategory && !matchSub && !matchNotes && !matchPlace) return false
      }
      
      return true
    })
  }, [transactions, searchTerm, filterType])

  // Handlers
  async function handleDeleteConfirm() {
    if (!deletingId) return
    setIsDeleting(true)
    setErrorMsg('')
    
    const txToDelete = transactions.find(t => t.id === deletingId)
    if (!txToDelete) return

    const result = await deleteTransaction(txToDelete.type, deletingId)
    
    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setTransactions(prev => prev.filter(t => t.id !== deletingId))
      setDeletingId(null)
    }
    setIsDeleting(false)
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingTx) return
    
    setIsSaving(true)
    setErrorMsg('')
    
    const formData = new FormData(e.currentTarget)
    
    const updates: Partial<Transaction> = {
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date') as string,
      time_of_day: formData.get('time_of_day') as string,
      notes: formData.get('notes') as string,
      category: formData.get('category') as string,
    }

    if (editingTx.type === 'expense') {
      updates.sub_category = formData.get('sub_category') as string
      updates.payment_method = formData.get('payment_method') as string
      updates.place = formData.get('place') as string
    }

    const result = await updateTransaction(editingTx.type, editingTx.id, updates)
    
    if (result.error) {
      setErrorMsg(result.error)
    } else {
      // Optimistically update local state instead of doing a full refetch
      setTransactions(prev => prev.map(t => {
        if (t.id === editingTx.id) {
          return { ...t, ...updates }
        }
        return t
      }))
      setEditingTx(null)
    }
    setIsSaving(false)
  }

  // Edit Modal form dynamic fields
  const editSubCategories = editingTx?.type === 'expense' && editingTx.category 
    ? categoriesAndSub[editingTx.category as keyof typeof categoriesAndSub] || []
    : []

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Transaction History</h1>
          <p className="text-neutral-400">View and manage all your past activities.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-4 rounded-3xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search category, notes, place..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
          />
        </div>
        
        <div className="flex bg-neutral-950/50 rounded-xl border border-neutral-800 p-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-300'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'text-neutral-400 hover:text-neutral-300'}`}
          >
            Income
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'expense' ? 'bg-red-500/20 text-red-400' : 'text-neutral-400 hover:text-neutral-300'}`}
          >
            Expense
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-3xl overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-neutral-400">No transactions found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/50">
            {filteredTransactions.map(tx => (
              <div key={tx.id} className="p-4 sm:p-5 hover:bg-neutral-800/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {tx.type === 'income' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white truncate text-base">
                        {tx.type === 'expense' ? tx.category.split(' ')[0] : ''} {tx.sub_category || tx.category}
                      </h4>
                      {tx.type === 'expense' && tx.category && (
                        <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-md hidden sm:inline-block">
                          {tx.category.replace(/^[^\w\s]+\s*/, '')}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <span className="w-1 h-1 rounded-full bg-neutral-700 hidden sm:block"></span>
                      <span>{tx.time_of_day}</span>
                      
                      {tx.payment_method && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-neutral-700 hidden sm:block"></span>
                          <span>{tx.payment_method}</span>
                        </>
                      )}
                      
                      {tx.place && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-neutral-700 hidden sm:block"></span>
                          <span>{tx.place}</span>
                        </>
                      )}
                    </div>
                    
                    {tx.notes && (
                      <p className="text-sm text-neutral-400 mt-2 italic truncate pr-4">"{tx.notes}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-48 flex-shrink-0 pl-14 sm:pl-0">
                  <span className={`text-lg font-bold font-mono ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingTx(tx)}
                      className="p-2 text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(tx.id)}
                      className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isDeleting && setDeletingId(null)} />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Delete Transaction?</h3>
            <p className="text-neutral-400 mb-6">This action cannot be undone. Are you sure you want to remove this record?</p>
            
            {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}
            
            <div className="flex gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSaving && setEditingTx(null)} />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                Edit {editingTx.type === 'income' ? 'Income' : 'Expense'}
              </h3>
              <button 
                onClick={() => !isSaving && setEditingTx(null)}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                disabled={isSaving}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                    <input 
                      type="number" 
                      name="amount" 
                      step="0.01" 
                      required 
                      defaultValue={editingTx.amount} 
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-8 pr-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    required 
                    defaultValue={editingTx.date} 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    {editingTx.type === 'income' ? 'Source' : 'Category'}
                  </label>
                  <select 
                    name="category" 
                    defaultValue={editingTx.category} 
                    onChange={(e) => {
                      // Workaround to force re-render for sub-categories when category changes
                      setEditingTx({...editingTx, category: e.target.value, sub_category: ''})
                    }}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    {editingTx.type === 'income' 
                      ? incomeSources.map(s => <option key={s} value={s}>{s}</option>)
                      : Object.keys(categoriesAndSub).map(c => <option key={c} value={c}>{c}</option>)
                    }
                  </select>
                </div>

                {editingTx.type === 'expense' && (
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Sub Category</label>
                    <select 
                      name="sub_category" 
                      key={editingTx.category}
                      defaultValue={editingTx.sub_category || ''} 
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">None</option>
                      {editSubCategories.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Time of Day</label>
                  <select 
                    name="time_of_day" 
                    defaultValue={editingTx.time_of_day} 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="N/A">N/A</option>
                    {timeClassifications.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {editingTx.type === 'expense' && (
                  <>
                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Payment Method</label>
                      <select 
                        name="payment_method" 
                        defaultValue={editingTx.payment_method || ''} 
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                      >
                        {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Place</label>
                      <select 
                        name="place" 
                        defaultValue={editingTx.place || ''} 
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                      >
                        {places.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </>
                )}

                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Notes</label>
                  <textarea 
                    name="notes" 
                    rows={2}
                    defaultValue={editingTx.notes || ''} 
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setEditingTx(null)}
                  className="flex-1 py-3 rounded-xl border border-neutral-700 text-neutral-300 font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
