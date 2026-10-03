import { requireRole } from '@/lib/rbac'

export default function AdminPage() {
  const { role } = requireRole()
  
  if (role !== 'ADMIN') {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive font-semibold">403 - Forbidden. ADMIN role required.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Administration</h2>
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-muted-foreground">Admin functions will be implemented in future milestones.</p>
      </div>
    </div>
  )
}
