import Parser from 'rss-parser'
import { scoreUpdate, detectStates } from '@/lib/scoring'
import { RSS_SOURCES } from '@/lib/constants'

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'HealthcareDashboard/1.0' },
})

export interface RawItem {
  title: string
  content: string
  url: string
  publishedAt: Date
  sourceName: string
  sourceUrl: string
}

export async function fetchRssSource(source: typeof RSS_SOURCES[0]): Promise<RawItem[]> {
  try {
    const feed = await parser.parseURL(source.url)
    const items: RawItem[] = []

    for (const item of (feed.items || []).slice(0, 20)) {
      if (!item.title || !item.link) continue
      const content = stripHtml(item.contentSnippet || item.content || item.summary || '')
      items.push({
        title: cleanText(item.title),
        content: content.slice(0, 2000),
        url: item.link,
        publishedAt: parseDate(item.pubDate || item.isoDate || ''),
        sourceName: source.name,
        sourceUrl: source.url,
      })
    }

    return items
  } catch (err) {
    console.error(`RSS fetch failed for ${source.name}:`, err instanceof Error ? err.message : err)
    return []
  }
}

export async function fetchAllRss(): Promise<RawItem[]> {
  const results = await Promise.allSettled(
    RSS_SOURCES.map(s => fetchRssSource(s))
  )

  const all: RawItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value)
  }

  // Sort newest first
  return all.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
}

function parseDate(s: string): Date {
  if (!s) return new Date()
  const d = new Date(s)
  return isNaN(d.getTime()) ? new Date() : d
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}
