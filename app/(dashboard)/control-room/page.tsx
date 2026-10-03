import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/db'
import { KpiCard } from '@/components/shared/KpiCard'
import { DataTable } from '@/components/shared/DataTable'
import { AlertTriangle } from 'lucide-react'
import IndiaMap from '@/components/maps/IndiaMap'

export default async function ControlRoomPage() {
  // Fetch National Aggregate Data (OVERVIEW key)
  const overviewRow = await prisma.nationalAggregate.findFirst({
    where: { key: 'OVERVIEW', scope: 'NATIONAL' }
  })
  
  let metrics: Record<string, number> = {}
  if (overviewRow && overviewRow.metrics) {
    metrics = JSON.parse(overviewRow.metrics)
  }

  // Fetch Alerts
  const alerts = await prisma.alert.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  // Read GeoJSON
  const geoJsonPath = path.join(process.cwd(), 'public', 'geo', 'india-states.geojson')
  const geoJsonData = JSON.parse(fs.readFileSync(geoJsonPath, 'utf8'))

  // Mock State Data for Choropleth
  const stateData = [
    { name: 'Gujarat', gap: metrics.residual || 480000 },
    { name: 'Maharashtra', gap: 120000 }
  ]

  // Mock District Markers - realistically fetched from DB
  const districtMarkers = [
    { id: '1', name: 'Sanand, Gujarat', lat: 22.98, lng: 72.38, demand: 2500, capability: 1500, gap: 1000 },
    { id: '2', name: 'Pune, Maharashtra', lat: 18.52, lng: 73.85, demand: 1500, capability: 1200, gap: 300 }
  ]

  // Mock Tables Data
  const emergingDemandData = [
    { id: 1, sector: 'SEMICONDUCTOR', occupation: 'Automation Tech', geography: 'Gujarat', growth: '+18%', timeline: '18 mo', confidence: '78%' }
  ]
  const emergingDemandCols = [
    { key: 'sector', title: 'Sector' },
    { key: 'occupation', title: 'Occupation' },
    { key: 'geography', title: 'Geography' },
    { key: 'growth', title: 'Growth' },
    { key: 'timeline', title: 'Timeline' },
    { key: 'confidence', title: 'Confidence' }
  ]

  const activePlansData = [
    { id: 1, plan: 'Semiconductor Ramp-up', location: 'Sanand', demand: 2500, gap: 1000, training: 1000, status: 'APPROVED' }
  ]
  const activePlansCols = [
    { key: 'plan', title: 'Plan Name' },
    { key: 'location', title: 'Location' },
    { key: 'demand', title: 'Total Demand' },
    { key: 'gap', title: 'Residual Gap' },
    { key: 'training', title: 'In Training' },
    { key: 'status', title: 'Status', render: (r: { status: string }) => (
      <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success border border-success/20">
        {r.status}
      </span>
    )}
  ]

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Control Room</h2>
        {/* Filters (UI only for now) */}
        <div className="flex gap-2">
          <select className="h-9 rounded-md border border-border bg-transparent px-3 text-sm">
            <option>All States</option>
            <option>Gujarat</option>
          </select>
          <select className="h-9 rounded-md border border-border bg-transparent px-3 text-sm">
            <option>All Sectors</option>
            <option>SEMICONDUCTOR</option>
          </select>
          <select className="h-9 rounded-md border border-border bg-transparent px-3 text-sm">
            <option>Horizon: 18 months</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Emerging Demand" value={`+${metrics.emergingDemand || 0}%`} trend={{ value: 'vs last yr', positive: true }} />
        <KpiCard title="Workforce Required" value={(metrics.workforceRequired || 0).toLocaleString('en-IN')} />
        <KpiCard title="Deployable Capability" value={(metrics.deployable || 0).toLocaleString('en-IN')} />
        <KpiCard title="Transformable Capability" value={(metrics.transformable || 0).toLocaleString('en-IN')} />
        
        <KpiCard title="Residual Gap" value={(metrics.residual || 0).toLocaleString('en-IN')} trend={{ value: 'Critical', positive: false }} />
        <KpiCard title="Training Capacity" value={(metrics.trainingCapacity || 0).toLocaleString('en-IN')} />
        <KpiCard title="Active Plans" value={metrics.activePlans || 0} />
        <KpiCard title="Forecast Confidence" value={`${metrics.forecastConfidence || 0}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <IndiaMap geoJsonData={geoJsonData} stateData={stateData} districtMarkers={districtMarkers} />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Emerging Demand</h3>
            <DataTable columns={emergingDemandCols} data={emergingDemandData} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Activation Plans</h3>
            <DataTable columns={activePlansCols} data={activePlansData} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Critical Alerts</h3>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No alerts active.</p>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className="rounded-md border border-border p-4 bg-card">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${alert.severity === 'HIGH' ? 'text-danger' : 'text-warning'}`} />
                    <div>
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.district}, {alert.state}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
