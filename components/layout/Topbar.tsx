import { User } from 'lucide-react'
import { Role } from './Sidebar'

export function Topbar({ title, role }: { title: string, role: Role }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent border border-accent/20">
          {role}
        </span>
        <button 
          className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 focus:ring-2 focus:ring-navy focus:outline-none"
          aria-label="User Profile"
        >
          <User className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
