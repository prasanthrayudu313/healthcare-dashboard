'use client'
import { useState } from 'react'
import { ExternalLink, ChevronDown, ChevronUp, Building2, Clock, TrendingUp } from 'lucide-react'
import { cn, SEVERITY_CONFIG, CATEGORY_CONFIG, UPDATE_TYPE_CONFIG, timeAgo } from '@/lib/utils'
import type { UpdateWithSummary } from '@/types'

interface UpdateCardProps {
  update: UpdateWithSummary
  style?: React.CSSProperties
}

export function UpdateCard({ update, style }: UpdateCardProps) {
  const [expanded, setExpanded] = useState(false)

  const sev = SEVERITY_CONFIG[update.severity] || SEVERITY_CONFIG.medium
  const cat = CATEGORY_CONFIG[update.category] || CATEGORY_CONFIG.news
  const ut = update.updateType ? UPDATE_TYPE_CONFIG[update.updateType] : null

  const summary = update.aiSummary?.summary || update.rawContent?.slice(0, 200) || ''
  const hasCentene = !!update.aiSummary?.centeneRelevance

  return (
    <article
      style={style}
      className={cn(
        'group bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 card-hover fade-in-up',
        update.severity === 'critical' && 'border-l-2 border-l-red-500',
        update.severity === 'high' && 'border-l-2 border-l-orange-500',
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category badge */}
          <span className={cn('px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide', cat.color, cat.bg)}>
            {cat.label}
          </span>

          {/* Severity dot */}
          <span className={cn('flex items-center gap-1 text-[10px]', sev.color)}>
            <span className={cn('w-1.5 h-1.5 rounded-full inline-block', sev.dot)} />
            {sev.label}
          </span>

          {/* Update type */}
          {ut && (
            <span className={cn('text-[10px] font-medium', ut.color)}>
              {ut.icon} {ut.label}
            </span>
          )}
        </div>

        {/* Impact score */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="text-[10px] text-slate-600">Impact</div>
          <div className="flex gap-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'w-1.5 h-3 rounded-sm',
                  i < update.impactScore
                    ? update.impactScore >= 8 ? 'bg-red-500' : update.impactScore >= 6 ? 'bg-orange-500' : update.impactScore >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                    : 'bg-slate-800'
                )}
              />
            ))}
          </div>
          <span className={cn(
            'text-xs font-bold tabular-nums',
            update.impactScore >= 8 ? 'text-red-400' : update.impactScore >= 6 ? 'text-orange-400' : update.impactScore >= 4 ? 'text-yellow-400' : 'text-green-400'
          )}>
            {update.impactScore}/10
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-slate-100 text-sm leading-snug mb-2 group-hover:text-white transition-colors">
        {update.title}
      </h3>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
        {update.company && (
          <span className="flex items-center gap-1">
            <Building2 size={10} />
            <span className="text-slate-400 font-medium">{update.company.name}</span>
            {update.company.ticker && <span className="text-slate-600">({update.company.ticker})</span>}
          </span>
        )}
        {!update.company && update.sourceName && (
          <span className="text-slate-500">{update.sourceName}</span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {timeAgo(update.publishedAt)}
        </span>
        {update.linesOfBusiness && update.linesOfBusiness.length > 0 && (
          <span className="flex gap-1">
            {update.linesOfBusiness.slice(0, 2).map(lob => (
              <span key={lob} className="px-1.5 py-0 rounded bg-slate-800 text-slate-400 text-[10px]">{lob}</span>
            ))}
          </span>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-3">
          {summary}
        </p>
      )}

      {/* Centene relevance preview */}
      {hasCentene && !expanded && (
        <div className="bg-blue-950/40 border border-blue-800/30 rounded-lg px-3 py-2 mb-3">
          <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-semibold mb-1">
            <TrendingUp size={10} />
            WHY THIS MATTERS TO CENTENE
          </div>
          <p className="text-xs text-blue-300/80 line-clamp-2">
            {update.aiSummary!.centeneRelevance}
          </p>
        </div>
      )}

      {/* Expanded AI Analysis */}
      {expanded && update.aiSummary && (
        <div className="space-y-3 mb-3 animate-fade-in">
          {/* Key Facts */}
          {update.aiSummary.keyFacts && update.aiSummary.keyFacts.length > 0 && (
            <div className="bg-slate-800/60 rounded-lg px-3 py-2">
              <div className="text-[10px] text-slate-500 font-semibold uppercase mb-1.5">Key Facts</div>
              <ul className="space-y-1">
                {update.aiSummary.keyFacts.map((f, i) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-2">
                    <span className="text-blue-500 shrink-0 mt-0.5">→</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Impact grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Operational', value: update.aiSummary.operationalImpact, color: 'text-blue-300' },
              { label: 'Financial', value: update.aiSummary.financialImpact, color: 'text-amber-300' },
              { label: 'Regulatory', value: update.aiSummary.regulatoryImpact, color: 'text-indigo-300' },
              { label: 'Competitive', value: update.aiSummary.competitiveImpact, color: 'text-orange-300' },
            ].filter(item => item.value).map(item => (
              <div key={item.label} className="bg-slate-800/60 rounded-lg px-3 py-2">
                <div className={cn('text-[10px] font-semibold uppercase mb-1', item.color)}>{item.label}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Centene relevance (full) */}
          {update.aiSummary.centeneRelevance && (
            <div className="bg-blue-950/50 border border-blue-800/40 rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-semibold mb-1.5">
                <TrendingUp size={10} />
                WHY THIS MATTERS TO CENTENE
              </div>
              <p className="text-xs text-blue-200/90 leading-relaxed">{update.aiSummary.centeneRelevance}</p>
            </div>
          )}

          {/* Recommended action */}
          {update.aiSummary.recommendedAction && (
            <div className="bg-green-950/30 border border-green-800/30 rounded-lg px-3 py-2">
              <div className="text-[10px] text-green-400 font-semibold uppercase mb-1">Recommended Action</div>
              <p className="text-xs text-green-300/80">{update.aiSummary.recommendedAction}</p>
            </div>
          )}

          {/* Tags */}
          {update.aiSummary.tags && update.aiSummary.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {update.aiSummary.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-400 transition-colors"
        >
          {expanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> {update.aiSummary ? 'Full AI Analysis' : 'Details'}</>}
        </button>
        <a
          href={update.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-400 transition-colors"
          onClick={e => e.stopPropagation()}
        >
          Source <ExternalLink size={10} />
        </a>
      </div>
    </article>
  )
}
