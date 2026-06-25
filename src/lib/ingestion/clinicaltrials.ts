import type { RawItem } from './rss'

const BASE = 'https://clinicaltrials.gov/api/v2'

const SEARCH_TERMS = [
  'Medicaid managed care',
  'Medicare Advantage',
  'value-based care',
  'prior authorization',
]

export async function fetchClinicalTrials(): Promise<RawItem[]> {
  const items: RawItem[] = []

  for (const term of SEARCH_TERMS.slice(0, 2)) {
    try {
      const encoded = encodeURIComponent(term)
      const url = `${BASE}/studies?query.term=${encoded}&sort=LastUpdatePostDate:desc&pageSize=5&fields=NCTId,OfficialTitle,BriefSummary,LastUpdatePostDate,OverallStatus,LeadSponsorName,Phase`
      const res = await fetch(url, { next: { revalidate: 3600 } })
      if (!res.ok) continue
      const data = await res.json()

      for (const study of (data.studies || [])) {
        const p = study.protocolSection
        const id = p?.identificationModule?.nctId
        const title = p?.identificationModule?.officialTitle || p?.identificationModule?.briefTitle
        const summary = p?.descriptionModule?.briefSummary?.slice(0, 500) || ''
        const phase = p?.designModule?.phases?.join(', ') || 'N/A'
        const sponsor = p?.sponsorCollaboratorsModule?.leadSponsor?.name || ''
        const status = p?.statusModule?.overallStatus || ''
        const updated = p?.statusModule?.lastUpdatePostDateStruct?.date

        if (!id || !title) continue

        items.push({
          title: `Clinical Trial Update: ${title.slice(0, 100)}`,
          content: `Phase: ${phase} | Status: ${status} | Sponsor: ${sponsor} | ${summary}`,
          url: `https://clinicaltrials.gov/study/${id}`,
          publishedAt: updated ? new Date(updated) : new Date(),
          sourceName: 'ClinicalTrials.gov',
          sourceUrl: 'https://clinicaltrials.gov',
        })
      }
    } catch (err) {
      console.error(`ClinicalTrials fetch failed for "${term}":`, err instanceof Error ? err.message : err)
    }
  }

  return items
}
