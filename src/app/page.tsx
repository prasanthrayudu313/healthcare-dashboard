'use client'
import { useState, useCallback, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { UpdateFeed } from '@/components/feed/UpdateFeed'
import { RightPanel } from '@/components/layout/RightPanel'
import { KpiCards } from '@/components/kpi/KpiCards'
import type { FilterState } from '@/types'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: '',
  severity: '',
  lineOfBusiness: '',
  state: '',
  company: '',
  dateRange: '',
  updateType: '',
  sector: '',
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    search: searchParams.get('search') || '',
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const [hasAutoIngestRun, setHasAutoIngestRun] = useState(false)

  // Auto-trigger ingestion on first load if DB is empty
  useEffect(() => {
    if (hasAutoIngestRun) return
    setHasAutoIngestRun(true)
    fetch('/api/updates?limit=1')
      .then(r => r.json())
      .then(data => {
        if (!data.total || data.total === 0) {
          // Kick off initial ingest
          fetch('/api/ingest', { method: 'POST' })
            .then(() => setRefreshKey(k => k + 1))
            .catch(console.error)
        }
      })
      .catch(console.error)
  }, [])

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950">
      <Header onRefresh={handleRefresh} />
      <KpiCards />

      {/* Active filter chips */}
      {Object.values(filters).some(v => v) && (
        <div className="flex items-center gap-2 px-6 py-2 overflow-x-auto border-b border-slate-800/40">
          <span className="text-xs text-slate-600 shrink-0">Active filters:</span>
          {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setFilters(f => ({ ...f, [k]: '' }))}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-xs text-blue-300 hover:bg-red-600/20 hover:border-red-500/30 hover:text-red-300 transition-all whitespace-nowrap"
            >
              {v} ×
            </button>
          ))}
        </div>
      )}

      <div className="flex">
        <Sidebar filters={filters} onChange={setFilters} />
        <UpdateFeed filters={filters} refreshTrigger={refreshKey} />
        <RightPanel />
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
