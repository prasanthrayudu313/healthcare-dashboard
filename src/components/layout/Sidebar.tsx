'use client'
import { useState } from 'react'
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { FilterState } from '@/types'

interface SidebarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

interface FilterGroupProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function FilterGroup({ title, children, defaultOpen = true }: FilterGroupProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-800/60 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors mb-2"
      >
        {title}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  )
}

function Option({ label, value, current, onClick }: { label: string; value: string; current: string; onClick: (v: string) => void }) {
  const active = current === value
  return (
    <button
      onClick={() => onClick(active ? '' : value)}
      className={cn(
        'w-full text-left px-2 py-1 rounded text-xs transition-all',
        active
          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
      )}
    >
      {label}
    </button>
  )
}

const SEVERITIES = ['critical', 'high', 'medium', 'low']
const CATEGORIES = Object.entries(CATEGORY_LABELS)
const LOBS = ['Medicaid', 'Medicare', 'Marketplace', 'Commercial', 'Pharmacy', 'Dual-Eligible']
const DATE_RANGES = [{ label: 'Last 24h', value: '24h' }, { label: 'Last 7 days', value: '7d' }, { label: 'Last 30 days', value: '30d' }]
const UPDATE_TYPES = [
  { label: 'Risk', value: 'risk' },
  { label: 'Opportunity', value: 'opportunity' },
  { label: 'Competitor Move', value: 'competitor_move' },
  { label: 'Policy Change', value: 'policy_change' },
  { label: 'Operational Signal', value: 'operational_signal' },
]
const SECTORS = ['payer', 'pharma', 'biotech', 'device', 'hospital', 'digital', 'regulator']

export function Sidebar({ filters, onChange }: SidebarProps) {
  const set = (key: keyof FilterState) => (val: string) => onChange({ ...filters, [key]: val })
  const hasFilters = Object.values(filters).some(v => v !== '')

  return (
    <aside className="w-52 shrink-0 border-r border-slate-800/60 overflow-y-auto h-[calc(100vh-100px)] sticky top-[100px]">
      <div className="px-3 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Filter size={12} />
            Filters
          </div>
          {hasFilters && (
            <button
              onClick={() => onChange({ search: '', category: '', severity: '', lineOfBusiness: '', state: '', company: '', dateRange: '', updateType: '', sector: '' })}
              className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-400 transition-colors"
            >
              <X size={10} /> Clear all
            </button>
          )}
        </div>

        <FilterGroup title="Severity">
          {SEVERITIES.map(s => (
            <Option key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} value={s} current={filters.severity} onClick={set('severity')} />
          ))}
        </FilterGroup>

        <FilterGroup title="Update Type">
          {UPDATE_TYPES.map(t => (
            <Option key={t.value} label={t.label} value={t.value} current={filters.updateType} onClick={set('updateType')} />
          ))}
        </FilterGroup>

        <FilterGroup title="Line of Business">
          {LOBS.map(l => (
            <Option key={l} label={l} value={l} current={filters.lineOfBusiness} onClick={set('lineOfBusiness')} />
          ))}
        </FilterGroup>

        <FilterGroup title="Category" defaultOpen={false}>
          {CATEGORIES.map(([k, v]) => (
            <Option key={k} label={v} value={k} current={filters.category} onClick={set('category')} />
          ))}
        </FilterGroup>

        <FilterGroup title="Date Range" defaultOpen={false}>
          {DATE_RANGES.map(r => (
            <Option key={r.value} label={r.label} value={r.value} current={filters.dateRange} onClick={set('dateRange')} />
          ))}
        </FilterGroup>

        <FilterGroup title="Sector" defaultOpen={false}>
          {SECTORS.map(s => (
            <Option key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} value={s} current={filters.sector} onClick={set('sector')} />
          ))}
        </FilterGroup>
      </div>
    </aside>
  )
}
