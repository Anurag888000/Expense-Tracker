'use client'

import { useState } from 'react'
import { RecurringTransaction, cancelRecurringTransaction } from './actions'
import { 
  Repeat, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Loader2,
  CalendarDays,
  Clock
} from 'lucide-react'

export default function RecurringClient({ initialData }: { initialData: RecurringTransaction[] }) {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>(initialData)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleCancel(id: string) {
    if (!confirm('Are you sure you want to cancel this recurring transaction?')) return

    setCancellingId(id)
    setErrorMsg('')
    
    const result = await cancelRecurringTransaction(id)
    
    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id))
    }
    setCancellingId(null)
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-500/20 p-3 rounded-2xl">
          <Repeat className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Recurring Transactions</h1>
          <p className="text-neutral-400">Manage your automated incomes and subscriptions.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
          {errorMsg}
        </div>
      )}

      <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-3xl overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            <Repeat className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-neutral-400">No active recurring transactions</p>
            <p className="text-sm">When you add a repeating income or expense, it will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/50">
            {transactions.map(tx => (
              <div key={tx.id} className="p-5 hover:bg-neutral-800/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {tx.type === 'income' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white capitalize text-base">
                        {tx.type === 'expense' ? tx.category.split(' ')[0] : ''} {tx.sub_category || tx.category}
                      </h4>
                      <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-medium capitalize flex items-center gap-1">
                         <Clock className="w-3 h-3" />
                         {tx.frequency}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-neutral-400 font-medium">
                      <CalendarDays className="w-4 h-4 text-neutral-500" />
                      Next due: <span className="text-white">{new Date(tx.next_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-48 flex-shrink-0 pl-14 sm:pl-0">
                  <span className={`text-lg font-bold font-mono ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  
                  <button
                    disabled={cancellingId === tx.id}
                    onClick={() => handleCancel(tx.id)}
                    className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="Cancel Recurring"
                  >
                    {cancellingId === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
