'use client'
import { Header } from '@/components/layout/Header'
import { Building2 } from 'lucide-react'
import { TRACKED_COMPANIES } from '@/lib/constants'

const SECTOR_COLORS: Record<string, string> = {
  payer: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  pharma: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  biotech: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  device: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  hospital: 'text-green-400 bg-green-500/10 border-green-500/20',
  digital: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  regulator: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
}

const byType = TRACKED_COMPANIES.reduce((acc, c) => {
  if (!acc[c.sector]) acc[c.sector] = []
  acc[c.sector].push(c)
  return acc
}, {} as Record<string, typeof TRACKED_COMPANIES>)

export default function CompaniesPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <div className="px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-100">Tracked Organizations</h1>
          <p className="text-sm text-slate-500 mt-1">
            {TRACKED_COMPANIES.length} companies and agencies across healthcare sectors
          </p>
        </div>

        {Object.entries(byType).map(([sector, companies]) => (
          <div key={sector} className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
              {sector.charAt(0).toUpperCase() + sector.slice(1)}s
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {companies.map(co => {
                const colorClass = SECTOR_COLORS[co.sector] || 'text-slate-400 bg-slate-800 border-slate-700'
                return (
                  <div
                    key={co.name}
                    className={`border rounded-xl p-4 hover:scale-[1.02] transition-transform cursor-default ${colorClass}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Building2 size={16} className="opacity-60 mt-0.5" />
                      {co.ticker && (
                        <span className="text-[10px] font-mono bg-black/20 px-1.5 py-0.5 rounded">
                          {co.ticker}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-sm leading-tight">{co.name}</div>
                    {co.hqState && (
                      <div className="text-[10px] opacity-60 mt-1">HQ: {co.hqState}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
