import { Repeat } from 'lucide-react'

export interface UpcomingTransaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  next_date: string
  frequency: string
}

export default function UpcomingRecurring({ upcoming }: { upcoming: UpcomingTransaction[] }) {
  if (!upcoming || upcoming.length === 0) {
    return (
      <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl h-full flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-6">Upcoming (Next 7 Days)</h3>
        <div className="flex-1 flex items-center justify-center text-neutral-500 pb-6 text-center text-sm px-4">
          No impending recurring transactions in the next 7 days.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl flex flex-col h-full">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Repeat className="w-5 h-5 text-indigo-400" />
        Upcoming (Next 7 Days)
      </h3>
      
      <div className="space-y-3">
        {upcoming.map((tx) => {
          const isExpense = tx.type === 'expense'
          
          return (
            <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
              <div>
                <p className="font-medium text-sm text-neutral-300">{tx.category}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Due: {new Date(tx.next_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {tx.frequency}
                </p>
              </div>
              <p className={`text-sm font-semibold ${isExpense ? 'text-red-400' : 'text-emerald-400'}`}>
                {isExpense ? '-' : '+'}₹{Number(tx.amount).toFixed(2)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
