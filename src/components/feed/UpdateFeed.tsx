'use client'
import { useState, useCallback, useEffect } from 'react'
import useSWR from 'swr'
import { SortAsc, SortDesc, Loader2 } from 'lucide-react'
import { UpdateCard } from './UpdateCard'
import { Spinner } from '@/components/ui/Spinner'
import type { UpdateWithSummary, FilterState } from '@/types'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface FeedData {
  updates: UpdateWithSummary[]
  total: number
  page: number
  totalPages: number
}

interface UpdateFeedProps {
  filters: FilterState
  refreshTrigger?: number
}

type SortKey = 'newest' | 'impact' | 'centene'

const SORT_LABELS: Record<SortKey, string> = {
  newest: 'Newest First',
  impact: 'Highest Impact',
  centene: 'Centene Relevant',
}

export function UpdateFeed({ filters, refreshTrigger }: UpdateFeedProps) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortKey>('newest')
  const [allUpdates, setAllUpdates] = useState<UpdateWithSummary[]>([])

  // Build query string
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', '20')
  if (filters.search) params.set('search', filters.search)
  if (filters.category) params.set('category', filters.category)
  if (filters.severity) params.set('severity', filters.severity)
  if (filters.lineOfBusiness) params.set('lob', filters.lineOfBusiness)
  if (filters.dateRange) params.set('dateRange', filters.dateRange)
  if (filters.updateType) params.set('updateType', filters.updateType)
  if (filters.sector) params.set('sector', filters.sector)
  if (filters.company) params.set('company', filters.company)
  if (filters.state) params.set('state', filters.state)

  const { data, isLoading, mutate } = useSWR<FeedData>(
    `/api/updates?${params.toString()}`,
    fetcher,
    { refreshInterval: 120000 }
  )

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); setAllUpdates([]) }, [
    filters.search, filters.category, filters.severity, filters.lineOfBusiness,
    filters.dateRange, filters.updateType, filters.sector, sort
  ])

  // Refresh when triggered externally
  useEffect(() => { if (refreshTrigger) mutate() }, [refreshTrigger])

  // Accumulate updates for infinite scroll
  useEffect(() => {
    if (!data?.updates) return
    if (page === 1) {
      setAllUpdates(data.updates)
    } else {
      setAllUpdates(prev => {
        const ids = new Set(prev.map(u => u.id))
        return [...prev, ...data.updates.filter(u => !ids.has(u.id))]
      })
    }
  }, [data])

  // Sort client-side
  const sorted = [...allUpdates].sort((a, b) => {
    if (sort === 'impact') return b.impactScore - a.impactScore
    if (sort === 'centene') {
      const aHas = a.aiSummary?.centeneRelevance ? 1 : 0
      const bHas = b.aiSummary?.centeneRelevance ? 1 : 0
      return bHas - aHas || b.impactScore - a.impactScore
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  const hasMore = data ? page < data.totalPages : false

  if (isLoading && allUpdates.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <Spinner className="mx-auto h-8 w-8" />
          <p className="text-sm text-slate-500">Loading intelligence feed...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 min-w-0 px-4 py-4">
      {/* Feed header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-300">
            Live Intelligence Feed
          </h2>
          {typeof data?.total === 'number' && (
            <span className="text-xs text-slate-600 bg-slate-900 px-2 py-0.5 rounded-full">
              {data.total.toLocaleString()} total
            </span>
          )}
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-1">
          {(Object.keys(SORT_LABELS) as SortKey[]).map(key => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all',
                sort === key
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              )}
            >
              {SORT_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {sorted.length === 0 && !isLoading && (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-slate-400 font-medium mb-2">No updates found</p>
          <p className="text-sm text-slate-600">
            {Object.values(filters).some(v => v) ? 'Try adjusting your filters' : 'Click "Refresh Data" to fetch the latest healthcare news'}
          </p>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-3">
        {sorted.map((update, i) => (
          <UpdateCard
            key={update.id}
            update={update}
            style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
            Load more updates
          </button>
        </div>
      )}

      {!hasMore && sorted.length > 0 && (
        <p className="text-center text-xs text-slate-700 mt-6 py-4 border-t border-slate-800/50">
          All {data?.total || sorted.length} updates loaded
        </p>
      )}
    </main>
  )
}
