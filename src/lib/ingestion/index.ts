import { prisma } from '@/lib/db'
import { scoreUpdate, detectStates } from '@/lib/scoring'
import { fetchAllRss, type RawItem } from './rss'
import { fetchFdaApprovals, fetchFdaRecalls } from './fda'
import { fetchClinicalTrials } from './clinicaltrials'
import { fetchSecFilings } from './sec'
import { TRACKED_COMPANIES, RSS_SOURCES } from '@/lib/constants'
import crypto from 'crypto'

function hashContent(title: string, url: string): string {
  return crypto.createHash('sha256').update(`${url}::${title}`).digest('hex').slice(0, 16)
}

function detectCompanyId(
  text: string,
  companies: { id: string; name: string; ticker: string | null }[]
): string | null {
  const lower = text.toLowerCase()
  for (const c of companies) {
    if (lower.includes(c.name.toLowerCase())) return c.id
    if (c.ticker && lower.includes(c.ticker.toLowerCase())) return c.id
  }
  return null
}

export async function runIngestion(): Promise<{ found: number; added: number; errors: string[] }> {
  const errors: string[] = []
  let found = 0
  let added = 0

  // Ensure data sources exist
  await ensureDataSources()

  // Fetch all companies for matching
  const companies = await prisma.company.findMany({ select: { id: true, name: true, ticker: true } })

  // Gather all raw items in parallel
  const [rssItems, fdaApprovals, fdaRecalls, trials, secFilings] = await Promise.allSettled([
    fetchAllRss(),
    fetchFdaApprovals(),
    fetchFdaRecalls(),
    fetchClinicalTrials(),
    fetchSecFilings(),
  ])

  const allItems: RawItem[] = [
    ...(rssItems.status === 'fulfilled' ? rssItems.value : (errors.push('RSS failed'), [])),
    ...(fdaApprovals.status === 'fulfilled' ? fdaApprovals.value : (errors.push('FDA approvals failed'), [])),
    ...(fdaRecalls.status === 'fulfilled' ? fdaRecalls.value : (errors.push('FDA recalls failed'), [])),
    ...(trials.status === 'fulfilled' ? trials.value : (errors.push('ClinicalTrials failed'), [])),
    ...(secFilings.status === 'fulfilled' ? secFilings.value : (errors.push('SEC EDGAR failed'), [])),
  ]

  found = allItems.length

  // Process and deduplicate
  for (const item of allItems) {
    try {
      const hash = hashContent(item.title, item.url)
      const existing = await prisma.update.findFirst({ where: { OR: [{ url: item.url }, { contentHash: hash }] } })
      if (existing) continue

      const fullText = `${item.title} ${item.content}`
      const { impactScore, severity, updateType, linesOfBusiness, category } = scoreUpdate(item.title, item.content)
      const states = detectStates(fullText)
      const companyId = detectCompanyId(fullText, companies)

      // Find source
      const dataSource = await prisma.dataSource.findFirst({ where: { url: item.sourceUrl } })

      await prisma.update.create({
        data: {
          title: item.title.slice(0, 400),
          rawContent: item.content,
          url: item.url,
          publishedAt: item.publishedAt,
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          sourceId: dataSource?.id,
          companyId,
          category,
          linesOfBusiness: JSON.stringify(linesOfBusiness),
          states: JSON.stringify(states),
          impactScore,
          severity,
          updateType,
          contentHash: hash,
        }
      })
      added++
    } catch (err) {
      // Skip duplicates silently
      if (!(err instanceof Error && err.message.includes('Unique constraint'))) {
        errors.push(`Item save failed: ${err instanceof Error ? err.message : err}`)
      }
    }
  }

  await prisma.ingestLog.create({
    data: {
      sourceName: 'full_run',
      itemsFound: found,
      itemsNew: added,
      status: errors.length === 0 ? 'success' : 'partial',
      error: errors.length > 0 ? errors.slice(0, 3).join('; ') : null,
    }
  })

  return { found, added, errors }
}

async function ensureDataSources() {
  for (const src of RSS_SOURCES) {
    await prisma.dataSource.upsert({
      where: { url: src.url },
      update: { lastPolledAt: new Date() },
      create: {
        name: src.name,
        type: 'rss',
        url: src.url,
        credScore: src.credScore,
        pollIntervalMin: src.pollMin,
        lastPolledAt: new Date(),
      }
    })
  }
}

export async function seedCompanies() {
  const { TRACKED_COMPANIES } = await import('@/lib/constants')
  for (const co of TRACKED_COMPANIES) {
    await prisma.company.upsert({
      where: { id: co.name.toLowerCase().replace(/[^a-z0-9]/g, '-') },
      update: {},
      create: {
        id: co.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        ...co,
      }
    })
  }
}
