'use client'

import CallHistory from '@/components/calls/CallHistory'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function CallsPage() {
  return (
    <ErrorBoundary>
      <CallHistory />
    </ErrorBoundary>
  )
} 