import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  date: string
  description?: string
}

export default function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl h-full flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Transactions</h3>
        <div className="flex-1 flex items-center justify-center text-neutral-500 pb-6">
          No recent transactions found.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-6">Recent Transactions</h3>
      
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-3 md:p-4 rounded-2xl bg-neutral-950/50 border border-neutral-800/80 hover:bg-neutral-800/50 transition-colors">
            <div className="flex items-center gap-3 md:gap-4">
              <div className={`p-2 md:p-3 rounded-xl ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {tx.type === 'income' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-semibold text-neutral-200">{tx.category}</p>
                <div className="flex items-center gap-2 text-xs md:text-sm text-neutral-500 mt-0.5">
                  <span>{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  {tx.description && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-neutral-700" />
                      <span className="truncate max-w-[100px] md:max-w-[200px]">{tx.description}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className={`font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
              {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
