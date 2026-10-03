'use client'

import React, { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Error boundary caught:', error)
  }, [error])

  return (
    <div className="flex h-[50vh] w-full items-center justify-center text-muted-foreground animate-in fade-in">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <AlertTriangle className="h-12 w-12 text-danger opacity-80" />
        <div>
          <h2 className="text-xl font-bold text-foreground">A system error occurred</h2>
          <p className="text-sm mt-2">{error.message || 'The engine encountered an unexpected condition while processing this request.'}</p>
        </div>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-navy text-white rounded-md text-sm font-medium hover:bg-navy/90"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
