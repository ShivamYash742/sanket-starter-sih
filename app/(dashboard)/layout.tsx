import { Sidebar, Role } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { requireRole } from '@/lib/rbac'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role } = requireRole()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={role as Role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title="SANKET Workspace" role={role as Role} />
        <main className="flex-1 overflow-y-auto p-6 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
