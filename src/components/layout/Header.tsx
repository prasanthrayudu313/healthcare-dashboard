'use client'
import { useState, useCallback } from 'react'
import { Search, RefreshCw, Activity, Bell, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'

interface HeaderProps {
  onRefresh?: () => void
}

export function Header({ onRefresh }: HeaderProps) {
  const [query, setQuery] = useState('')
  const [isIngesting, setIsIngesting] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const router = useRouter()

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/?search=${encodeURIComponent(query.trim())}`)
  }, [query, router])

  const handleRefresh = useCallback(async () => {
    if (isIngesting) return
    setIsIngesting(true)
    try {
      const res = await fetch('/api/ingest', { method: 'POST' })
      const data = await res.json()
      setLastRefresh(`+${data.added || 0} new`)
      onRefresh?.()
    } catch (err) {
      setLastRefresh('Error')
    } finally {
      setIsIngesting(false)
      setTimeout(() => setLastRefresh(null), 5000)
    }
  }, [isIngesting, onRefresh])

  return (
    <header className="glass sticky top-0 z-50 border-b border-slate-800/60">
      <div className="flex items-center gap-4 px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-950 live-dot" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 leading-tight">Centene Intelligence</div>
            <div className="text-[10px] text-slate-500 leading-tight">Real-time Healthcare Hub</div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-800 shrink-0" />

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search updates, companies, drugs, policies..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800 transition-all"
            />
          </div>
        </form>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {lastRefresh && (
            <span className="text-xs text-green-400 font-medium animate-fade-in">{lastRefresh}</span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isIngesting}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              isIngesting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            )}
          >
            {isIngesting ? <Spinner className="h-3.5 w-3.5" /> : <RefreshCw size={12} />}
            {isIngesting ? 'Fetching...' : 'Refresh Data'}
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-xs transition-all">
            <Bell size={12} />
            <span className="hidden sm:inline">Alerts</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 cursor-pointer hover:border-slate-700 transition-all">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">A</div>
            <span className="hidden sm:inline">Analyst</span>
            <ChevronDown size={10} />
          </div>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="flex items-center gap-1 px-6 pb-2 overflow-x-auto scrollbar-none">
        {[
          { label: 'Dashboard', href: '/' },
          { label: 'Analytics', href: '/analytics' },
          { label: 'Companies', href: '/companies' },
        ].map(link => (
          <a
            key={link.href}
            href={link.href}
            className="px-3 py-1 rounded-md text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all whitespace-nowrap"
          >
            {link.label}
          </a>
        ))}
        <div className="ml-auto text-xs text-slate-600 shrink-0">
          <span className="hidden sm:inline">Centene Intelligence Hub · </span>
          <span className="text-slate-700">For informational purposes only</span>
        </div>
      </div>
    </header>
  )
}
