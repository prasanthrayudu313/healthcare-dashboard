import type { RawItem } from './rss'

const BASE = 'https://api.fda.gov'
const KEY = process.env.OPENFDA_API_KEY ? `&api_key=${process.env.OPENFDA_API_KEY}` : ''

export async function fetchFdaApprovals(): Promise<RawItem[]> {
  try {
    const url = `${BASE}/drug/drugsfda.json?search=submissions.submission_type:ORIG+AND+submissions.submission_status:AP&sort=submissions.submission_status_date:desc&limit=10${KEY}`
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json()
    const items: RawItem[] = []

    for (const drug of (data.results || [])) {
      const sub = drug.submissions?.find((s: any) => s.submission_status === 'AP')
      if (!drug.products?.[0]?.brand_name) continue
      const brandName = drug.products[0].brand_name
      const genericName = drug.products[0].active_ingredients?.[0]?.name || ''
      const sponsor = drug.sponsor_name || ''

      items.push({
        title: `FDA Approves ${brandName} (${genericName}) — ${sponsor}`,
        content: `The FDA has approved ${brandName} (${genericName}) submitted by ${sponsor}. Application number: ${drug.application_number}. Submission type: ${sub?.submission_type || 'ORIG'}.`,
        url: `https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${drug.application_number}`,
        publishedAt: sub?.submission_status_date ? new Date(sub.submission_status_date) : new Date(),
        sourceName: 'FDA (OpenFDA)',
        sourceUrl: 'https://api.fda.gov',
      })
    }
    return items
  } catch (err) {
    console.error('FDA approvals fetch failed:', err instanceof Error ? err.message : err)
    return []
  }
}

export async function fetchFdaRecalls(): Promise<RawItem[]> {
  try {
    const url = `${BASE}/drug/enforcement.json?search=status:Ongoing&sort=report_date:desc&limit=10${KEY}`
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json()
    const items: RawItem[] = []

    for (const recall of (data.results || [])) {
      items.push({
        title: `FDA Recall: ${recall.product_description?.slice(0, 80) || 'Drug Product'} — ${recall.recalling_firm}`,
        content: `${recall.reason_for_recall} | Classification: ${recall.classification} | Distribution: ${recall.distribution_pattern?.slice(0, 200)}`,
        url: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts',
        publishedAt: recall.report_date ? new Date(recall.report_date) : new Date(),
        sourceName: 'FDA Enforcement (OpenFDA)',
        sourceUrl: 'https://api.fda.gov',
      })
    }
    return items
  } catch (err) {
    console.error('FDA recalls fetch failed:', err instanceof Error ? err.message : err)
    return []
  }
}
