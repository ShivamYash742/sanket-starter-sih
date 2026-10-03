import React from 'react'
import { cn } from '@/lib/utils'

interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  trend?: {
    value: string
    positive?: boolean
  }
}

export function KpiCard({ title, value, trend, className, ...props }: KpiCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-6", className)} {...props}>
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[28px] font-semibold text-foreground">{value}</span>
        {trend && (
          <span className={cn("text-sm font-medium", trend.positive ? "text-success" : "text-danger")}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  )
}
