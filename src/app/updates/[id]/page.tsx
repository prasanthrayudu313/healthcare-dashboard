'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ArrowLeft, ExternalLink, TrendingUp, AlertTriangle, DollarSign, Landmark, Zap, CheckCircle2 } from 'lucide-react'
import { SEVERITY_CONFIG, CATEGORY_CONFIG, cn, formatDate, timeAgo } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'
import type { UpdateWithSummary } from '@/types'

export default function UpdateDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [update, setUpdate] = useState<UpdateWithSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/updates/${id}`)
      .then(r => r.json())
      .then(setUpdate)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  )

  if (!update) return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <div className="flex items-center justify-center py-24 text-slate-500">Update not found</div>
    </div>
  )

  const sev = SEVERITY_CONFIG[update.severity] || SEVERITY_CONFIG.medium
  const cat = CATEGORY_CONFIG[update.category] || CATEGORY_CONFIG.news
  const ai = update.aiSummary

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to feed
        </button>

        {/* Header */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={cn('px-2 py-0.5 rounded text-[10px] font-semibold uppercase', cat.color, cat.bg)}>{cat.label}</span>
            <span className={cn('flex items-center gap-1 text-xs', sev.color)}>
              <span className={cn('w-2 h-2 rounded-full', sev.dot)} />{sev.label}
            </span>
            <span className="ml-auto text-sm font-bold text-slate-400">Impact: <span className={
              update.impactScore >= 8 ? 'text-red-400' : update.impactScore >= 6 ? 'text-orange-400' : 'text-yellow-400'
            }>{update.impactScore}/10</span></span>
          </div>

          <h1 className="text-xl font-bold text-slate-100 leading-snug mb-4">{update.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {update.company && <span className="text-slate-300 font-medium">{update.company.name}</span>}
            <span>{update.sourceName}</span>
            <span>{formatDate(update.publishedAt)}</span>
            <span>({timeAgo(update.publishedAt)})</span>
            {update.linesOfBusiness?.length > 0 && (
              <div className="flex gap-1">
                {update.linesOfBusiness.map(l => (
                  <span key={l} className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs">{l}</span>
                ))}
              </div>
            )}
          </div>

          <a
            href={update.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
          >
            View Original Source <ExternalLink size={13} />
          </a>
        </div>

        {/* AI Analysis */}
        {ai ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3">Summary</h2>
              <p className="text-slate-200 leading-relaxed">{ai.summary}</p>
              {ai.keyFacts && ai.keyFacts.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {ai.keyFacts.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-400">
                      <span className="text-blue-500 shrink-0 font-bold">→</span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Centene Relevance */}
            {ai.centeneRelevance && (
              <div className="bg-blue-950/50 border border-blue-700/40 rounded-xl p-5">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-3">
                  <TrendingUp size={14} />
                  Why This Matters to Centene
                </div>
                <p className="text-blue-200/90 leading-relaxed">{ai.centeneRelevance}</p>
                {ai.affectedPopulation && (
                  <p className="mt-2 text-xs text-blue-400/70">Affected population: {ai.affectedPopulation}</p>
                )}
              </div>
            )}

            {/* Impact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: AlertTriangle, label: 'Operational Impact', value: ai.operationalImpact, color: 'text-blue-400', border: 'border-blue-800/30' },
                { icon: DollarSign, label: 'Financial Impact', value: ai.financialImpact, color: 'text-amber-400', border: 'border-amber-800/30' },
                { icon: Landmark, label: 'Regulatory Impact', value: ai.regulatoryImpact, color: 'text-indigo-400', border: 'border-indigo-800/30' },
                { icon: Zap, label: 'Competitive Impact', value: ai.competitiveImpact, color: 'text-orange-400', border: 'border-orange-800/30' },
              ].filter(item => item.value).map(item => (
                <div key={item.label} className={`bg-slate-900/60 border ${item.border} rounded-xl p-4`}>
                  <div className={cn('flex items-center gap-2 font-semibold text-sm mb-2', item.color)}>
                    <item.icon size={13} />
                    {item.label}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Recommended Action */}
            {ai.recommendedAction && (
              <div className="bg-green-950/40 border border-green-800/40 rounded-xl p-5">
                <div className="flex items-center gap-2 text-green-400 font-bold text-sm mb-2">
                  <CheckCircle2 size={14} />
                  Recommended Analyst Action
                </div>
                <p className="text-green-200/80 leading-relaxed">{ai.recommendedAction}</p>
              </div>
            )}

            {/* Tags */}
            {ai.tags && ai.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ai.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-700 text-right">
              AI analysis by {ai.modelVersion || 'Groq'} · Generated {timeAgo(ai.generatedAt)}
              <br />
              <span className="italic">AI-generated analysis. Always verify with primary sources before business decisions.</span>
            </p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
            <Spinner className="mx-auto mb-3" />
            <p className="text-slate-400 text-sm">AI analysis is being generated...</p>
            <p className="text-slate-600 text-xs mt-1">Refresh the page in a moment</p>
          </div>
        )}
      </div>
    </div>
  )
}
