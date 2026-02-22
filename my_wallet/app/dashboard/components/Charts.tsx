'use client'

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'

interface CategoryData {
  name: string
  value: number
}

interface IncomeExpenseData {
  name: string
  Income: number
  Expense: number
}

const COLORS = ['#10b981', '#ef4444', '#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899', '#06b6d4']

export function ExpensePieChart({ data }: { data: CategoryData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        No expense data for this month.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Amount']}
          contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', color: '#fff' }}
          itemStyle={{ color: '#fff' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function IncomeExpenseBarChart({ data }: { data: IncomeExpenseData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        barSize={60}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
        <XAxis dataKey="name" stroke="#737373" tick={{fill: '#a3a3a3'}} axisLine={false} tickLine={false} />
        <YAxis stroke="#737373" tick={{fill: '#a3a3a3'}} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
        <Tooltip 
          cursor={{ fill: 'transparent' }}
          contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', color: '#fff' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar dataKey="Income" fill="#10b981" radius={[8, 8, 8, 8]} />
        <Bar dataKey="Expense" fill="#ef4444" radius={[8, 8, 8, 8]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
