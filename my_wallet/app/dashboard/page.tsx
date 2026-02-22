import { createClient } from '@/utils/supabase/server'
import { ExpensePieChart, IncomeExpenseBarChart } from './components/Charts'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch data for the current month
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: incomes } = await supabase
    .from('incomes')
    .select('amount, source')
    .eq('user_id', user.id)
    .gte('date', firstDay)
    .lte('date', lastDay)

  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, category')
    .eq('user_id', user.id)
    .gte('date', firstDay)
    .lte('date', lastDay)

  // Calculations
  const totalIncome = incomes?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const totalExpense = expenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const balance = totalIncome - totalExpense

  // Prepare data for Pie Chart
  const categoryMap: Record<string, number> = {}
  expenses?.forEach(exp => {
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + Number(exp.amount)
  })
  const pieData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key]
  }))

  // Prepare data for Bar Chart
  const barData = [
    {
      name: 'This Month',
      Income: totalIncome,
      Expense: totalExpense,
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-neutral-400 font-medium mb-2 relative z-10">Total Balance</h3>
          <p className="text-2xl md:text-4xl font-bold text-white relative z-10">₹{balance.toFixed(2)}</p>
        </div>
        
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500 opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-neutral-400 font-medium mb-2 relative z-10">Total Income</h3>
          <p className="text-2xl md:text-4xl font-bold text-emerald-400 relative z-10">₹{totalIncome.toFixed(2)}</p>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-neutral-400 font-medium mb-2 relative z-10">Total Expense</h3>
          <p className="text-2xl md:text-4xl font-bold text-red-400 relative z-10">₹{totalExpense.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-4 md:p-6 rounded-3xl h-[350px] md:h-[450px] relative overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Income vs Expense</h3>
          <div className="flex-1 w-full relative z-10">
             <IncomeExpenseBarChart data={barData} />
          </div>
        </div>
        
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-4 md:p-6 rounded-3xl h-[350px] md:h-[450px] relative overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Expense Categories</h3>
          <div className="flex-1 w-full relative z-10">
             <ExpensePieChart data={pieData} />
          </div>
        </div>
      </div>
    </div>
  )
}
