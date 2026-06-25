import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const skip = (page - 1) * limit

    // Filters
    const category = searchParams.get('category') || ''
    const severity = searchParams.get('severity') || ''
    const lob = searchParams.get('lob') || ''
    const company = searchParams.get('company') || ''
    const sector = searchParams.get('sector') || ''
    const updateType = searchParams.get('updateType') || ''
    const search = searchParams.get('search') || ''
    const dateRange = searchParams.get('dateRange') || ''
    const state = searchParams.get('state') || ''

    const where: any = {}

    if (category) where.category = category
    if (severity) where.severity = severity
    if (updateType) where.updateType = updateType
    if (company) where.companyId = company
    if (sector) where.company = { sector }

    if (lob) {
      where.linesOfBusiness = { contains: lob }
    }
    if (state) {
      where.states = { contains: state }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { rawContent: { contains: search, mode: 'insensitive' } },
        { sourceName: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (dateRange) {
      const now = new Date()
      const cutoff = new Date()
      if (dateRange === '24h') cutoff.setHours(cutoff.getHours() - 24)
      else if (dateRange === '7d') cutoff.setDate(cutoff.getDate() - 7)
      else if (dateRange === '30d') cutoff.setDate(cutoff.getDate() - 30)
      where.publishedAt = { gte: cutoff }
    }

    const [updates, total] = await Promise.all([
      prisma.update.findMany({
        where,
        include: {
          company: { select: { id: true, name: true, ticker: true, sector: true, orgType: true } },
          aiSummary: true,
        },
        orderBy: [{ publishedAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.update.count({ where })
    ])

    // Parse JSON fields
    const serialized = updates.map(u => ({
      ...u,
      publishedAt: u.publishedAt.toISOString(),
      ingestedAt: u.ingestedAt.toISOString(),
      linesOfBusiness: safeJsonParse(u.linesOfBusiness, []),
      states: safeJsonParse(u.states, []),
      aiSummary: u.aiSummary ? {
        ...u.aiSummary,
        keyFacts: safeJsonParse(u.aiSummary.keyFacts, []),
        tags: safeJsonParse(u.aiSummary.tags, []),
        generatedAt: u.aiSummary.generatedAt.toISOString(),
      } : null,
    }))

    return NextResponse.json({
      updates: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('GET /api/updates error:', err)
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 })
  }
}

function safeJsonParse<T>(val: string | null, fallback: T): T {
  if (!val) return fallback
  try { return JSON.parse(val) } catch { return fallback }
}
