'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import type { IndiaMapProps } from './IndiaMapInner'

const IndiaMapInner = dynamic(() => import('./IndiaMapInner'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg border border-border" />
})

export default function IndiaMap(props: IndiaMapProps) {
  return <IndiaMapInner {...props} />
}
