'use client'
import useSWR from 'swr'
import { AlertTriangle, TrendingUp, Building2, ExternalLink } from 'lucide-react'
import { SEVERITY_CONFIG, CATEGORY_CONFIG, timeAgo, cn } from '@/lib/utils'
import type { UpdateWithSummary } from '@/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface FeedData { updates: UpdateWithSummary[] }

export function RightPanel() {
  // Critical alerts (severity=critical or high with high impact)
  const { data: critical } = useSWR<FeedData>(
    '/api/updates?severity=critical&limit=5',
    fetcher, { refreshInterval: 60000 }
  )
  const { data: high } = useSWR<FeedData>(
    '/api/updates?severity=high&limit=5',
    fetcher, { refreshInterval: 60000 }
  )
  const { data: competitor } = useSWR<FeedData>(
    '/api/updates?updateType=competitor_move&limit=5',
    fetcher, { refreshInterval: 90000 }
  )

  const criticalItems = critical?.updates || []
  const highItems = high?.updates || []
  const competitorItems = competitor?.updates || []
  const alerts = [...criticalItems, ...highItems].sort((a, b) => b.impactScore - a.impactScore).slice(0, 6)

  return (
    <aside className="w-64 shrink-0 border-l border-slate-800/60 overflow-y-auto h-[calc(100vh-100px)] sticky top-[100px]">
      <div className="px-3 py-3 space-y-4">

        {/* Critical Alerts */}
        <section>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
            <AlertTriangle size={11} />
            Critical Alerts
          </div>
          {alerts.length === 0 ? (
            <p className="text-xs text-slate-600 py-2">No critical alerts right now.</p>
          ) : (
            <div className="space-y-2">
              {alerts.map(u => {
                const cat = CATEGORY_CONFIG[u.category] || CATEGORY_CONFIG.news
                const sev = SEVERITY_CONFIG[u.severity] || SEVERITY_CONFIG.medium
                return (
                  <a
                    key={u.id}
                    href={u.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', sev.dot)} />
                      <span className={cn('text-[10px] font-semibold', cat.color)}>{cat.label}</span>
                      <ExternalLink size={8} className="ml-auto text-slate-700 group-hover:text-slate-500" />
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{u.title}</p>
                    <div className="text-[10px] text-slate-600 mt-1 flex items-center justify-between">
                      <span>{u.sourceName}</span>
                      <span className={cn('font-bold', u.impactScore >= 8 ? 'text-red-500' : 'text-orange-500')}>
                        {u.impactScore}/10
                      </span>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="border-t border-slate-800/60" />

        {/* Competitor Activity */}
        <section>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">
            <TrendingUp size={11} />
            Competitor Moves
          </div>
          {competitorItems.length === 0 ? (
            <p className="text-xs text-slate-600 py-2">No competitor updates detected.</p>
          ) : (
            <div className="space-y-2">
              {competitorItems.slice(0, 5).map(u => (
                <a
                  key={u.id}
                  href={u.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 hover:border-slate-700 transition-all group"
                >
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{u.title}</p>
                  <div className="text-[10px] text-slate-600 mt-1 flex items-center justify-between">
                    <span>{u.company?.name || u.sourceName}</span>
                    <span className="text-slate-700">{timeAgo(u.publishedAt)}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="border-t border-slate-800/60" />

        {/* Key trackers */}
        <section>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Building2 size={11} />
            Tracking
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {[
              { label: 'Centene', color: 'text-blue-400' },
              { label: 'UnitedHealth', color: 'text-sky-400' },
              { label: 'Humana', color: 'text-green-400' },
              { label: 'Molina', color: 'text-teal-400' },
              { label: 'Elevance', color: 'text-violet-400' },
              { label: 'Aetna/CVS', color: 'text-rose-400' },
              { label: 'CMS', color: 'text-blue-300' },
              { label: 'FDA', color: 'text-orange-300' },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-1.5 py-1">
                <span className={cn('w-1.5 h-1.5 rounded-full bg-current shrink-0', t.color)} />
                <span className="text-slate-500">{t.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="text-[9px] text-slate-700 leading-relaxed border-t border-slate-800/50 pt-3">
          For informational and business analysis purposes only. Not medical, legal, or investment advice. Data sourced from public sources.
        </div>
      </div>
    </aside>
  )
}
