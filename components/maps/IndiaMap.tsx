'use client'

import React from 'react'
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import type { GeoJsonObject, Feature } from 'geojson'

interface DistrictMarker {
  id: string
  name: string
  lat: number
  lng: number
  demand: number
  capability: number
  gap: number
}

interface StateChoropleth {
  name: string
  gap: number
}

interface IndiaMapProps {
  geoJsonData: GeoJsonObject
  stateData: StateChoropleth[]
  districtMarkers: DistrictMarker[]
}

export default function IndiaMap({ geoJsonData, stateData, districtMarkers }: IndiaMapProps) {
  // Map state name to gap
  const stateGapMap = React.useMemo(() => {
    const map: Record<string, number> = {}
    stateData.forEach(d => {
      map[d.name] = d.gap
    })
    return map
  }, [stateData])

  const getColor = (gap: number) => {
    return gap > 10000 ? '#800026' :
           gap > 5000  ? '#BD0026' :
           gap > 2000  ? '#E31A1C' :
           gap > 1000  ? '#FC4E2A' :
           gap > 500   ? '#FD8D3C' :
           gap > 100   ? '#FEB24C' :
           gap > 10    ? '#FED976' :
                         '#FFEDA0';
  }

  const style = (feature?: Feature) => {
    const stateName = feature?.properties?.name
    const gap = stateGapMap[stateName] || 0
    return {
      fillColor: getColor(gap),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    }
  }

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border relative z-0">
      <MapContainer
        center={[22.0, 79.0]} // Center of India approximately
        zoom={4}
        className="h-full w-full bg-[#f8fafc]"
        zoomControl={false}
      >
        <GeoJSON 
          data={geoJsonData} 
          style={style} 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onEachFeature={(feature: any, layer: any) => {
            const stateName = feature.properties.name
            const gap = stateGapMap[stateName] || 0
            layer.bindTooltip(`${stateName}: Gap ${gap}`)
          }}
        />
        
        {districtMarkers.map(marker => (
          <CircleMarker
            key={marker.id}
            center={[marker.lat, marker.lng]}
            radius={6}
            pathOptions={{ color: '#0B2A4A', fillColor: '#E8761A', fillOpacity: 0.8 }}
          >
            <Tooltip>
              <div className="text-sm">
                <strong>{marker.name}</strong><br/>
                Demand: {marker.demand}<br/>
                Capability: {marker.capability}<br/>
                Gap: {marker.gap}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      
      {/* Attribution overlay */}
      <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 text-[10px] text-muted-foreground z-[1000] rounded">
        Map data: DataMeet, CC BY 4.0
      </div>
    </div>
  )
}
