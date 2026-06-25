import type { RawItem } from './rss'

// SEC EDGAR full-text search — free, no key required
const BASE = 'https://efts.sec.gov/LATEST/search-index'

const QUERIES = [
  { q: '"managed care" "Medicaid"', label: 'Managed Care / Medicaid' },
  { q: '"Medicare Advantage" OR "Medicaid managed care"', label: 'MA / Medicaid MC' },
  { q: '"Centene" OR "Molina" OR "Humana" "Medicaid"', label: 'Payer Medicaid Filings' },
]

export async function fetchSecFilings(): Promise<RawItem[]> {
  const items: RawItem[] = []
  const seenUrls = new Set<string>()

  for (const { q, label } of QUERIES) {
    try {
      const start = new Date()
      start.setDate(start.getDate() - 30)
      const startStr = start.toISOString().split('T')[0]

      const params = new URLSearchParams({
        q,
        forms: '8-K',
        dateRange: 'custom',
        startdt: startStr,
      })
      const url = `${BASE}?${params.toString()}`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'HealthcareDashboard research@example.com' },
        next: { revalidate: 3600 }
      })
      if (!res.ok) continue
      const data = await res.json()

      for (const hit of (data.hits?.hits || []).slice(0, 5)) {
        const src = hit._source
        const filingUrl = `https://www.sec.gov/Archives/edgar/data/${src.entity_id}/${src.file_date.replace(/-/g, '')}/${src.period_of_report?.replace(/-/g, '') || ''}`
        const docUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${src.entity_id}&type=8-K&dateb=&owner=include&count=10`

        if (seenUrls.has(docUrl)) continue
        seenUrls.add(docUrl)

        items.push({
          title: `SEC 8-K Filing: ${src.entity_name} — ${label}`,
          content: `${src.entity_name} filed an 8-K report on ${src.file_date}. Period of report: ${src.period_of_report || 'N/A'}. Form: ${src.form_type}.`,
          url: docUrl,
          publishedAt: src.file_date ? new Date(src.file_date) : new Date(),
          sourceName: 'SEC EDGAR',
          sourceUrl: 'https://www.sec.gov',
        })
      }
    } catch (err) {
      console.error(`SEC EDGAR fetch failed for "${label}":`, err instanceof Error ? err.message : err)
    }
  }

  return items
}
