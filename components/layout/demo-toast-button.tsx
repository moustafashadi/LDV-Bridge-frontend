"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/notifications/toast-provider"

export function DemoToastButton() {
  const { addToast } = useToast()

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        size="sm"
        variant="outline"
        className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
        onClick={() => addToast({ type: "success", title: "Success!", message: "Changes approved successfully" })}
      >
        Success Toast
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
        onClick={() => addToast({ type: "error", title: "Error", message: "Failed to sync with PowerApps" })}
      >
        Error Toast
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
        onClick={() => addToast({ type: "info", title: "Info", message: "Security scan running..." })}
      >
        Info Toast
      </Button>
    </div>
  )
}
