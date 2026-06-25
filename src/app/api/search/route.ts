import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function safeJsonParse<T>(val: string | null, fallback: T): T {
  if (!val) return fallback
  try { return JSON.parse(val) } catch { return fallback }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  try {
    const updates = await prisma.update.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { rawContent: { contains: q } },
          { sourceName: { contains: q } },
          { company: { name: { contains: q } } },
        ]
      },
      include: {
        company: { select: { id: true, name: true, ticker: true, sector: true } },
        aiSummary: { select: { summary: true, centeneRelevance: true } },
      },
      orderBy: [{ impactScore: 'desc' }, { publishedAt: 'desc' }],
      take: 20,
    })

    return NextResponse.json({
      results: updates.map(u => ({
        ...u,
        publishedAt: u.publishedAt.toISOString(),
        ingestedAt: u.ingestedAt.toISOString(),
        linesOfBusiness: safeJsonParse(u.linesOfBusiness, []),
        states: safeJsonParse(u.states, []),
      }))
    })
  } catch (err) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
