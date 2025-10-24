"use client"

import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import type { ToastMessage } from "./toast-provider"

interface ToastProps {
  toast: ToastMessage
  onClose: () => void
}

export function Toast({ toast, onClose }: ToastProps) {
  const config = {
    success: {
      bg: "bg-green-900/20",
      border: "border-green-700/50",
      icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
      title: "text-green-400",
    },
    error: {
      bg: "bg-red-900/20",
      border: "border-red-700/50",
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
      title: "text-red-400",
    },
    info: {
      bg: "bg-blue-900/20",
      border: "border-blue-700/50",
      icon: <Info className="w-5 h-5 text-blue-400" />,
      title: "text-blue-400",
    },
    warning: {
      bg: "bg-yellow-900/20",
      border: "border-yellow-700/50",
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      title: "text-yellow-400",
    },
  }

  const c = config[toast.type]

  return (
    <div
      className={`${c.bg} border ${c.border} rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-right`}
    >
      {c.icon}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${c.title}`}>{toast.title}</p>
        {toast.message && <p className="text-sm text-slate-300 mt-1">{toast.message}</p>}
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-200 flex-shrink-0 mt-0.5"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
