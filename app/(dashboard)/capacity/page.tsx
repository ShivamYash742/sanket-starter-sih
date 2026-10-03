/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { prisma } from '@/lib/db'
import { KpiCard } from '@/components/shared/KpiCard'
import { DataTable } from '@/components/shared/DataTable'
import dynamic from 'next/dynamic'

const IndiaMap = dynamic(() => import('@/components/maps/IndiaMap'), { ssr: false })

export default async function CapacityPage() {
  const centres = await prisma.trainingCentre.findMany({
    take: 10, // Limit for demo viewing
  })

  // Simulated metrics from M3 golden rules
  const metrics = {
    networkSeats: 12500,
    utilization: '85%',
    convertible: 3500,
    activeCentres: 126
  }

  const tableCols = [
    { key: 'name', title: 'Centre Name' },
    { key: 'district', title: 'District' },
    { key: 'state', title: 'State' },
    { key: 'courses', title: 'Courses', render: () => 'Auto Tech, EV' },
    { key: 'seats', title: 'Seats / Cycle', render: () => '300' },
    { key: 'utilization', title: 'Current Util.', render: () => (
      <div className="w-full bg-muted rounded-full h-2 mt-2">
        <div className="bg-saffron h-2 rounded-full" style={{ width: '85%' }}></div>
      </div>
    )}
  ]

  // Mock markers
  const districtMarkers = centres.map(c => ({
    id: c.id,
    name: c.name,
    lat: c.lat,
    lng: c.lng,
    demand: 0,
    capability: 0,
    gap: 0
  }))

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Training Capacity</h2>
          <p className="text-muted-foreground mt-1">Network capacity and convertible seats across 126 centres.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Active Centres" value={metrics.activeCentres.toLocaleString('en-IN')} />
        <KpiCard title="Network Seats / Cycle" value={metrics.networkSeats.toLocaleString('en-IN')} />
        <KpiCard title="Avg Utilization" value={metrics.utilization} />
        <KpiCard title="Convertible Capacity" value={metrics.convertible.toLocaleString('en-IN')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card border border-border p-4 rounded-lg">
            <h3 className="font-semibold mb-4">Centre Network</h3>
            <IndiaMap 
              geoJsonData={{ type: 'FeatureCollection', features: [] } as unknown as any} 
              stateData={[]} 
              districtMarkers={districtMarkers} 
            />
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg overflow-hidden h-full">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Capacity Details</h3>
            </div>
            <DataTable columns={tableCols} data={centres} />
          </div>
        </div>
      </div>
    </div>
  )
}
