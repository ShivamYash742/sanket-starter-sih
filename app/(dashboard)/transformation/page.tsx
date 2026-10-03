import React from 'react'
import { prisma } from '@/lib/db'
import { CheckCircle2, CircleDashed, Clock, IndianRupee, Activity, TrendingUp } from 'lucide-react'

export default async function TransformationPage() {
  const sourceOcc = await prisma.occupation.findFirst({ where: { name: 'Industrial Electrician' } })
  
  // Mock paths from M3 specs
  const paths = [
    {
      id: 'path-1',
      title: 'Accelerated Bridge',
      durationWeeks: 6,
      costPerWorker: 12000,
      confidence: 'High',
      historicalSuccess: '82%',
      employerDemand: 'Very High',
      hasSkills: ['Electrical Systems', 'Industrial Safety', 'Troubleshooting'],
      missingSkills: ['PLC', 'Automation', 'Process Operations'],
      bridgeModules: ['PLC Fundamentals', 'Industrial Automation', 'Control Systems']
    },
    {
      id: 'path-2',
      title: 'Comprehensive Transition',
      durationWeeks: 10,
      costPerWorker: 22000,
      confidence: 'Medium',
      historicalSuccess: '91%',
      employerDemand: 'Very High',
      hasSkills: ['Electrical Systems', 'Industrial Safety', 'Troubleshooting'],
      missingSkills: ['PLC', 'Automation', 'Process Operations'],
      bridgeModules: ['PLC Fundamentals', 'Industrial Automation', 'Control Systems', 'Advanced Sensors', 'Quality Assurance']
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transformation Lab</h2>
          <p className="text-muted-foreground mt-1">Design and compare workforce upskilling pathways.</p>
        </div>
        <button className="px-4 py-2 bg-saffron text-white rounded-md text-sm font-medium hover:bg-saffron/90">
          Save Selection
        </button>
      </div>

      <div className="bg-card border border-border p-4 rounded-lg flex items-center gap-4">
        <div className="flex-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Source Occupation</label>
          <div className="font-medium text-lg">{sourceOcc?.name || 'Industrial Electrician'}</div>
        </div>
        <div className="text-muted-foreground">→</div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Target Occupation</label>
          <div className="font-medium text-lg">Automation Technician</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paths.map(path => (
          <div key={path.id} className="bg-card border border-border rounded-lg overflow-hidden flex flex-col relative">
            {path.confidence === 'High' && (
              <div className="absolute top-0 right-0 bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-bl-lg border-b border-l border-success/20">
                RECOMMENDED
              </div>
            )}
            
            <div className="p-6 border-b border-border bg-[#f8fafc]">
              <h3 className="text-xl font-bold">{path.title}</h3>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-sm font-medium"><Clock className="h-4 w-4 text-muted-foreground"/> {path.durationWeeks} Weeks</div>
                <div className="flex items-center gap-1.5 text-sm font-medium"><IndianRupee className="h-4 w-4 text-muted-foreground"/> {path.costPerWorker.toLocaleString('en-IN')} / worker</div>
              </div>
            </div>
            
            <div className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4 border-b border-border pb-6">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Historical Success</div>
                  <div className="flex items-center gap-2 font-medium">
                    <Activity className="h-4 w-4 text-saffron" />
                    {path.historicalSuccess}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Employer Demand</div>
                  <div className="flex items-center gap-2 font-medium">
                    <TrendingUp className="h-4 w-4 text-navy" />
                    {path.employerDemand}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-3">Skill Gap Analysis</h4>
                <div className="space-y-2">
                  {path.hasSkills.map(s => (
                    <div key={s} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-muted-foreground">{s} (Existing)</span>
                    </div>
                  ))}
                  {path.missingSkills.map(s => (
                    <div key={s} className="flex items-center gap-2 text-sm">
                      <CircleDashed className="h-4 w-4 text-warning" />
                      <span className="font-medium">{s} (Missing)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-3">Required Bridge Modules</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  {path.bridgeModules.map(m => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-[#f8fafc]">
              <button className="w-full px-4 py-2 bg-navy text-white rounded-md text-sm font-medium hover:bg-navy/90">
                Add to Activation Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
