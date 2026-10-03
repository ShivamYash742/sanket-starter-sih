'use client'

import React, { useState } from 'react'
import { Check, X, Edit2, AlertCircle } from 'lucide-react'
import { KpiCard } from '@/components/shared/KpiCard'

export default function ApprovalPage() {
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'MODIFY' | 'REJECT' | null>(null)
  const [reason, setReason] = useState('')

  const handleAction = async (action: 'APPROVE' | 'MODIFY' | 'REJECT') => {
    if (action !== 'APPROVE' && !reason.trim()) {
      alert('A reason is mandatory for Modify or Reject.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/plans/demo-plan-id/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        alert(`Plan ${action.toLowerCase()} successfully.`)
        setModalOpen(false)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-bold">Plan Approval</h2>
        <p className="text-muted-foreground mt-1">Review the optimized activation plan before committing to training cycles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Workers Activated" value="1,010" />
        <KpiCard title="Residual Gap" value="790" />
        <KpiCard title="Estimated Cost" value="₹1.5Cr" />
        <KpiCard title="Confidence" value="High" />
      </div>

      <div className="bg-card border border-border p-6 rounded-lg space-y-6">
        <div className="flex items-center gap-2 text-navy border-b border-border pb-4">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Human-in-the-Loop Decision</h3>
        </div>
        
        <p className="text-muted-foreground text-sm">
          The AI MILP solver recommends this activation plan based on current capacity and workforce availability. 
          As a Planner, you are authorized to approve, modify, or reject this plan. All decisions are immutably logged for audit.
        </p>

        <div className="flex items-center gap-4 pt-4">
          <button 
            onClick={() => handleAction('APPROVE')}
            disabled={loading}
            className="px-6 py-2 bg-success text-white rounded-md font-medium hover:bg-success/90 flex items-center gap-2"
          >
            <Check className="h-4 w-4" /> Approve Plan
          </button>
          
          <button 
            onClick={() => { setActionType('MODIFY'); setModalOpen(true) }}
            className="px-6 py-2 bg-saffron text-white rounded-md font-medium hover:bg-saffron/90 flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" /> Modify...
          </button>

          <button 
            onClick={() => { setActionType('REJECT'); setModalOpen(true) }}
            className="px-6 py-2 bg-danger text-white rounded-md font-medium hover:bg-danger/90 flex items-center gap-2"
          >
            <X className="h-4 w-4" /> Reject...
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-border">
              <h3 className="font-bold text-xl">{actionType === 'MODIFY' ? 'Modify Plan' : 'Reject Plan'}</h3>
              <p className="text-muted-foreground text-sm mt-1">Provide a mandatory reason for the audit log.</p>
            </div>
            
            <div className="p-6 space-y-4">
              {actionType === 'MODIFY' && (
                <div className="p-4 bg-muted/50 rounded-md text-sm border border-border">
                  [Assignment editor placeholder for demo]
                </div>
              )}
              
              <div>
                <label className="text-sm font-semibold mb-2 block">Reason for {actionType?.toLowerCase()}</label>
                <textarea 
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full h-32 p-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-navy"
                  placeholder="e.g. Budget constraints require postponing cycle 2..."
                  required
                />
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-3">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleAction(actionType!)}
                disabled={!reason.trim() || loading}
                className="px-4 py-2 bg-navy text-white rounded-md font-medium disabled:opacity-50"
              >
                Confirm {actionType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
