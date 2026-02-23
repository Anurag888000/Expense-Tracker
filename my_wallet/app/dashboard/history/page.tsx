import { getTransactions } from './actions'
import HistoryClient from './HistoryClient'

export const metadata = {
  title: 'Transaction History | MyWallet',
  description: 'View, search, and manage your past incomes and expenses.',
}

export default async function HistoryPage() {
  const { data: initialTransactions, error } = await getTransactions(200)

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load transactions: {error}
      </div>
    )
  }

  return <HistoryClient initialTransactions={initialTransactions || []} />
}
