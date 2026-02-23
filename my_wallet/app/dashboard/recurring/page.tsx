import { getRecurringTransactions } from './actions'
import RecurringClient from './RecurringClient'

export const metadata = {
  title: 'Recurring Transactions | MyWallet',
  description: 'Manage your recurring incomes and subscriptions.',
}

export default async function RecurringPage() {
  const { data: recurringTransactions, error } = await getRecurringTransactions()

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load recurring transactions: {error}
      </div>
    )
  }

  return <RecurringClient initialData={recurringTransactions || []} />
}
