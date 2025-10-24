interface RiskIndicatorProps {
  level: "low" | "medium" | "high"
  label?: string
}

export function RiskIndicator({ level, label }: RiskIndicatorProps) {
  const config = {
    low: { icon: "✓", color: "text-green-400", bg: "bg-green-900/20" },
    medium: { icon: "⚠️", color: "text-yellow-400", bg: "bg-yellow-900/20" },
    high: { icon: "🚨", color: "text-red-400", bg: "bg-red-900/20" },
  }

  const c = config[level]

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded ${c.bg}`}>
      <span className={`text-sm font-semibold ${c.color}`}>{c.icon}</span>
      <span className={`text-sm ${c.color}`}>{label || level.charAt(0).toUpperCase() + level.slice(1)} Risk</span>
    </div>
  )
}
