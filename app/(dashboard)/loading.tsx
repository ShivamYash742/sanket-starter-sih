import React from 'react'
import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center text-muted-foreground animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-saffron" />
        <p className="text-sm font-medium">Loading SANKET intelligence...</p>
      </div>
    </div>
  )
}
