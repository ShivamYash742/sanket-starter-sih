'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, CircleDashed } from 'lucide-react'

interface Skill {
  name: string
  status: 'VERIFIED' | 'INFERRED'
  profLow: number
  profHigh: number
  confidence: number
}

interface WorkerProfileProps {
  workerId: string
  occupation: string
  location: string
  experience: number
  skills: Skill[]
}

export function WorkerProfileDrawer({ workerId, occupation, location, experience, skills }: WorkerProfileProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')

  const handleOpen = async () => {
    // Check permission via an API route in a real app, 
    // but here we can assume the server component filtered the button, 
    // or we hit a simple endpoint to verify role.
    setIsOpen(true)
  }

  return (
    <>
      <button 
        onClick={handleOpen}
        className="text-sm font-medium text-navy hover:underline"
      >
        {workerId}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in">
          <div className="w-[400px] h-full bg-white shadow-xl border-l border-border animate-in slide-in-from-right flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-lg">Worker Profile</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-md text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {error ? (
                <div className="text-danger bg-danger/10 p-3 rounded-md text-sm">{error}</div>
              ) : (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground">ID</div>
                    <div className="font-medium">{workerId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Current Occupation</div>
                    <div className="font-medium">{occupation}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="font-medium">{location}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Experience</div>
                      <div className="font-medium">{experience} years</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm border-b pb-2">Skills Profile</h4>
                    <div className="space-y-2">
                      {skills.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {s.status === 'VERIFIED' ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <CircleDashed className="h-4 w-4 text-warning" />
                            )}
                            <span>{s.name}</span>
                          </div>
                          <div className="text-muted-foreground">
                            {(s.profLow * 100).toFixed(0)}% - {(s.profHigh * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
