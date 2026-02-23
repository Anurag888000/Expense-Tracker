'use client'

import { GoalTrendPoint } from './actions'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

export default function GoalsTrend({ data }: { data: GoalTrendPoint[] }) {
  if (!data || data.length === 0) return null

  // Check if there's any meaningful data to display
  const hasData = data.some(d => d.savingsGoal > 0 || d.actualSavings !== 0)
  if (!hasData) return null

  return (
    <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-50" />

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-500/20 p-2 rounded-xl">
          <TrendingUp className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Savings Trend (Last 6 Months)</h3>
          <p className="text-sm text-neutral-400">Goal vs actual savings over time</p>
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#555' }}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#555' }}
              tickFormatter={(value: number) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1c1c1c',
                border: '1px solid #333',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '13px',
              }}
              formatter={((value: number | string, name: string) => [
                `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                name === 'savingsGoal' ? 'Savings Goal' : 'Actual Savings',
              ]) as never}
              labelStyle={{ color: '#aaa' }}
            />
            <Legend
              formatter={(value: string) =>
                value === 'savingsGoal' ? 'Savings Goal' : 'Actual Savings'
              }
              wrapperStyle={{ color: '#ccc', fontSize: '13px' }}
            />
            <Area
              type="monotone"
              dataKey="savingsGoal"
              stroke="#a78bfa"
              strokeWidth={2}
              fill="url(#goalGradient)"
              dot={{ fill: '#a78bfa', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="actualSavings"
              stroke="#34d399"
              strokeWidth={2}
              fill="url(#actualGradient)"
              dot={{ fill: '#34d399', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {data.slice(-3).map((point, i) => {
          const met = point.actualSavings >= point.savingsGoal && point.savingsGoal > 0
          return (
            <div
              key={i}
              className={`p-3 rounded-xl border text-center ${
                met
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-neutral-800/50 border-neutral-700/50'
              }`}
            >
              <p className="text-xs text-neutral-400 mb-1">{point.month}</p>
              <p className={`text-sm font-bold ${met ? 'text-emerald-400' : 'text-white'}`}>
                ₹{point.actualSavings.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-neutral-500">
                of ₹{point.savingsGoal.toLocaleString('en-IN')} goal
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
