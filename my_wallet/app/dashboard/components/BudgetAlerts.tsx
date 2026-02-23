'use client'

import { useState } from 'react'
import { AlertTriangle, AlertCircle, X } from 'lucide-react'

export type BudgetAlert = {
  category: string
  spent: number
  limit: number
  type: 'warning' | 'danger'
}

export default function BudgetAlerts({ alerts }: { alerts: BudgetAlert[] }) {
  const [dismissed, setDismissed] = useState<string[]>([])

  if (!alerts || alerts.length === 0) return null

  const visibleAlerts = alerts.filter(a => !dismissed.includes(a.category))

  if (visibleAlerts.length === 0) return null

  return (
    <div className="space-y-4 mb-8">
      {visibleAlerts.map(alert => {
        const isDanger = alert.type === 'danger'
        const percentage = Math.round((alert.spent / alert.limit) * 100)
        
        return (
          <div 
            key={alert.category}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition-all ${
              isDanger 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            <div className={`absolute top-0 left-0 h-1 w-full opacity-50 ${isDanger ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-amber-500 to-yellow-500'}`} />
            
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${isDanger ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                {isDanger ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              
              <div className="flex-1 pr-6">
                <h4 className={`text-sm font-bold ${isDanger ? 'text-red-400' : 'text-amber-400'}`}>
                  {isDanger ? 'Budget Exceeded' : 'Approaching Budget Limit'}
                </h4>
                <p className="text-sm text-neutral-300 mt-1 leading-relaxed">
                  You have spent <span className="font-bold text-white">₹{alert.spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> on <span className="font-bold text-white">{alert.category.replace(/^[^\w\s]+\s*/, '')}</span>.
                  This is <span className="font-bold text-white">{percentage}%</span> of your ₹{alert.limit.toLocaleString('en-IN', { minimumFractionDigits: 2 })} limit for this month.
                </p>
                <div className="mt-3 w-full bg-neutral-900/50 rounded-full h-2 border border-neutral-800">
                  <div 
                    className={`h-full rounded-full ${isDanger ? 'bg-red-500' : 'bg-amber-500'}`} 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
              
              <button 
                onClick={() => setDismissed(prev => [...prev, alert.category])}
                className="absolute top-4 right-4 p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
