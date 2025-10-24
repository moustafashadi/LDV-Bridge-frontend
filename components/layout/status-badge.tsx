import type { ReactNode } from "react"

interface StatusBadgeProps {
  status: "live" | "pending" | "rejected" | "draft" | "approved" | "failed"
  label: string
  icon?: ReactNode
}

export function StatusBadge({ status, label, icon }: StatusBadgeProps) {
  const statusConfig = {
    live: { bg: "bg-green-900/30", text: "text-green-400", border: "border-green-700" },
    pending: { bg: "bg-yellow-900/30", text: "text-yellow-400", border: "border-yellow-700" },
    rejected: { bg: "bg-red-900/30", text: "text-red-400", border: "border-red-700" },
    draft: { bg: "bg-slate-700/50", text: "text-slate-300", border: "border-slate-600" },
    approved: { bg: "bg-green-900/30", text: "text-green-400", border: "border-green-700" },
    failed: { bg: "bg-red-900/30", text: "text-red-400", border: "border-red-700" },
  }

  const config = statusConfig[status]

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bg} ${config.border}`}>
      {icon && <span className="text-lg">{icon}</span>}
      <span className={`text-sm font-medium ${config.text}`}>{label}</span>
    </div>
  )
}
