export interface TopCategory {
  name: string
  value: number
  percentage: number
}

export default function TopCategories({ categories }: { categories: TopCategory[] }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl h-full flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-6">Top Spending Categories</h3>
        <div className="flex-1 flex items-center justify-center text-neutral-500 pb-6 text-sm">
          No expenses recorded this month.
        </div>
      </div>
    )
  }

  // Define colors for the top 3
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500']

  return (
    <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl flex flex-col h-full">
      <h3 className="text-lg font-semibold text-white mb-6">Top Spending Categories</h3>
      
      <div className="space-y-5">
        {categories.map((cat, index) => {
          const colorClass = colors[index] || 'bg-neutral-500'
          return (
            <div key={cat.name} className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-neutral-200">{cat.name}</span>
                <span className="text-neutral-400 font-semibold">
                  ₹{Number(cat.value).toFixed(2)} <span className="text-neutral-500 text-xs font-normal">({cat.percentage}%)</span>
                </span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${colorClass} rounded-full`} 
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
