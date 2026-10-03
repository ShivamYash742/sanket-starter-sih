'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Signal,
  TrendingUp,
  Map,
  Wrench,
  GraduationCap,
  ClipboardList,
  FlaskConical,
  LineChart,
  ShieldCheck,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type Role = 'PLANNER' | 'TRAINING_AUTHORITY' | 'EMPLOYER' | 'ADMIN'

const NAV_ITEMS = [
  { name: 'Control Room', href: '/control-room', icon: LayoutDashboard, roles: ['PLANNER', 'ADMIN'] },
  { name: 'Economic Signals', href: '/economic-signals', icon: Signal, roles: ['PLANNER', 'ADMIN', 'EMPLOYER'] },
  { name: 'Workforce Demand', href: '/demand', icon: TrendingUp, roles: ['PLANNER', 'ADMIN'] },
  { name: 'Capability Map', href: '/capability', icon: Map, roles: ['PLANNER', 'ADMIN', 'EMPLOYER'] },
  { name: 'Transformation Lab', href: '/transformation', icon: Wrench, roles: ['PLANNER', 'ADMIN'] },
  { name: 'Training Capacity', href: '/capacity', icon: GraduationCap, roles: ['PLANNER', 'ADMIN', 'TRAINING_AUTHORITY'] },
  { name: 'Activation Plans', href: '/plans', icon: ClipboardList, roles: ['PLANNER', 'ADMIN', 'TRAINING_AUTHORITY'] },
  { name: 'Scenario Lab', href: '/scenarios', icon: FlaskConical, roles: ['PLANNER', 'ADMIN'] },
  { name: 'Outcomes', href: '/outcomes', icon: LineChart, roles: ['PLANNER', 'ADMIN'] },
  { name: 'Evidence & Audit', href: '/evidence', icon: ShieldCheck, roles: ['PLANNER', 'ADMIN'] },
  { name: 'Administration', href: '/admin', icon: Settings, roles: ['ADMIN'] },
]

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname()
  
  const allowedItems = NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <div className="flex h-screen w-[240px] flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-14 items-center px-4 font-semibold text-lg border-b border-sidebar-border/20 text-white">
        SANKET
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2 text-white">
          {allowedItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                      : 'hover:bg-sidebar-primary/50 text-white/80'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
