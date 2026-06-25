'use client'
import useSWR from 'swr'
import type { Metrics } from '@/types'
import { Activity, AlertTriangle, TrendingUp, FileText, Building2, Shield, Pill, Landmark, MapPin, DollarSign, Zap, Users } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const CARDS = [
  { key: 'total', label: 'Updates Today', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { key: 'highImpact', label: 'High Impact', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { key: 'medicaid', label: 'Medicaid', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { key: 'medicare', label: 'Medicare Adv.', icon: Shield, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  { key: 'marketplace', label: 'Marketplace', icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { key: 'competitor', label: 'Competitor Moves', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { key: 'regulatory', label: 'Regulatory', icon: Landmark, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { key: 'fda', label: 'FDA Alerts', icon: Pill, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { key: 'cmsPolicy', label: 'CMS Policy', icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { key: 'stateMedicaid', label: 'State Contracts', icon: MapPin, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  { key: 'earnings', label: 'Earnings', icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { key: 'ma', label: 'M&A Activity', icon: Building2, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
] as const

export function KpiCards() {
  const { data, isLoading } = useSWR<Metrics>('/api/metrics', fetcher, { refreshInterval: 60000 })

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 px-6 py-4">
      {CARDS.map(card => {
        const Icon = card.icon
        const value = data ? (data[card.key as keyof Metrics] as number) : null
        return (
          <div
            key={card.key}
            className={`rounded-xl border ${card.border} ${card.bg} px-4 py-3 flex items-start gap-3 transition-all duration-200 hover:scale-[1.02]`}
          >
            <div className={`mt-0.5 ${card.color}`}>
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <div className={`text-2xl font-bold tabular-nums ${card.color}`}>
                {isLoading ? (
                  <span className="inline-block h-7 w-10 bg-slate-800 rounded animate-pulse" />
                ) : (
                  value ?? '—'
                )}
              </div>
              <div className="text-xs text-slate-500 leading-tight mt-0.5 truncate">{card.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
