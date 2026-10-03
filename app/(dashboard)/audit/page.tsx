/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { prisma } from '@/lib/db'
import { DataTable } from '@/components/shared/DataTable'


export default async function AuditPage() {
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { at: 'desc' },
    take: 50
  })

  const evidenceLogs = await prisma.evidence.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  const auditCols = [
    { key: 'at', title: 'Timestamp', render: (r: any) => new Date(r.at).toLocaleString('en-IN') },
    { key: 'actorId', title: 'Actor', render: (r: any) => <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{r.actorId}</span> },
    { key: 'action', title: 'Action', render: (r: any) => {
      const isDanger = r.action === 'REJECT' || r.action === 'DELETE'
      const isWarn = r.action === 'MODIFY'
      return (
        <span className={`font-semibold ${isDanger ? 'text-danger' : isWarn ? 'text-warning' : 'text-success'}`}>
          {r.action}
        </span>
      )
    }},
    { key: 'entityType', title: 'Entity' },
    { key: 'reason', title: 'Reason / Justification' }
  ]

  const evidenceCols = [
    { key: 'createdAt', title: 'Timestamp', render: (r: any) => new Date(r.createdAt).toLocaleString('en-IN') },
    { key: 'entityType', title: 'AI Derived Entity' },
    { key: 'confidence', title: 'Confidence', render: (r: any) => `${Math.round(r.confidence * 100)}%` },
    { key: 'modelVersionId', title: 'Model Version', render: (r: any) => <span className="font-mono text-xs">{r.modelVersionId}</span> }
  ]

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-bold">Evidence & Audit</h2>
        <p className="text-muted-foreground mt-1">Immutable trail of AI recommendations and human-in-the-loop decisions.</p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <h3 className="font-semibold text-lg">Human Decisions (Audit Trail)</h3>
          <p className="text-sm text-muted-foreground">Every state mutation, approval, and rejection is logged.</p>
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <DataTable columns={auditCols} data={auditLogs as any[]} />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <h3 className="font-semibold text-lg">AI Evidence (Provenance)</h3>
          <p className="text-sm text-muted-foreground">Traceability for all AI-derived values (assumptions, model versions, confidence).</p>
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <DataTable columns={evidenceCols} data={evidenceLogs as any[]} />
      </div>
    </div>
  )
}
