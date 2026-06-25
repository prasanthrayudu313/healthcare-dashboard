'use client'
import useSWR from 'swr'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, CartesianGrid
} from 'recharts'
import { CATEGORY_LABELS } from '@/lib/constants'
import { Spinner } from '@/components/ui/Spinner'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const COLORS = {
  fda_approval: '#10b981',
  fda_recall: '#ef4444',
  cms_policy: '#3b82f6',
  earnings: '#f59e0b',
  trial_update: '#8b5cf6',
  drug_launch: '#14b8a6',
  ma_activity: '#ec4899',
  partnership: '#06b6d4',
  regulatory: '#6366f1',
  research: '#a855f7',
  news: '#64748b',
  leadership: '#94a3b8',
  state_contract: '#818cf8',
  vbc: '#22c55e',
  digital_health: '#38bdf8',
  safety_alert: '#f97316',
}

const SEV_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

const LOB_COLORS: Record<string, string> = {
  Medicaid: '#3b82f6',
  Medicare: '#8b5cf6',
  Marketplace: '#10b981',
  Pharmacy: '#f59e0b',
  'Dual-Eligible': '#ec4899',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name || 'Count'}: {p.value}</p>
      ))}
    </div>
  )
}

export function DashboardCharts() {
  const { data, isLoading } = useSWR('/api/analytics', fetcher, { refreshInterval: 300000 })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-64 flex items-center justify-center">
            <Spinner />
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  const categoryData = (data.byCategory || []).map((d: any) => ({
    name: CATEGORY_LABELS[d.category] || d.category,
    count: d.count,
    color: COLORS[d.category as keyof typeof COLORS] || '#64748b',
  })).slice(0, 10)

  const lobData = (data.byLob || []).filter((d: any) => d.count > 0)
  const sevData = (data.bySeverity || []).map((d: any) => ({ name: d.severity, value: d.count, color: SEV_COLORS[d.severity] || '#64748b' }))
  const timeline = data.timeline || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Updates by Category */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Updates by Category (30 days)</h3>
        {categoryData.length === 0 ? (
          <p className="text-xs text-slate-600 py-8 text-center">No data yet — refresh to fetch updates</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} margin={{ top: 0, right: 0, bottom: 40, left: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: '#64748b' }}
                angle={-40}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={25} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {categoryData.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Line of Business Breakdown */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">By Line of Business</h3>
        {lobData.length === 0 ? (
          <p className="text-xs text-slate-600 py-8 text-center">No LOB data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={lobData}
                dataKey="count"
                nameKey="lob"
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={false}
                label={({ lob, percent }) => percent > 0.05 ? `${lob} ${(percent * 100).toFixed(0)}%` : ''}
              >
                {lobData.map((entry: any, i: number) => (
                  <Cell key={i} fill={LOB_COLORS[entry.lob] || '#64748b'} fillOpacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} formatter={(v: any, n: any, p: any) => [v, p?.payload?.lob || n]} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Daily Activity (7 days)</h3>
        {timeline.length === 0 ? (
          <p className="text-xs text-slate-600 py-8 text-center">No timeline data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={25} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total" />
              <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} dot={false} name="High Impact" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Severity Breakdown */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">By Severity</h3>
        {sevData.length === 0 ? (
          <p className="text-xs text-slate-600 py-8 text-center">No severity data yet</p>
        ) : (
          <div className="space-y-3 py-4">
            {sevData.map((d: any) => (
              <div key={d.name} className="flex items-center gap-3">
                <div className="w-16 text-[11px] text-slate-400 capitalize text-right">{d.name}</div>
                <div className="flex-1 h-5 bg-slate-800 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-700"
                    style={{
                      width: `${Math.max(4, (d.value / Math.max(...sevData.map((x: any) => x.value), 1)) * 100)}%`,
                      backgroundColor: d.color,
                      opacity: 0.85,
                    }}
                  />
                </div>
                <div className="w-8 text-[11px] text-slate-400 tabular-nums">{d.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
