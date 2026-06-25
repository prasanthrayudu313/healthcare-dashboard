import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [byCategory, bySeverity, byLob, topCompanies, recentByDay] = await Promise.all([
      // Updates by category
      prisma.update.groupBy({
        by: ['category'],
        _count: { id: true },
        where: { publishedAt: { gte: thirtyDaysAgo } },
        orderBy: { _count: { id: 'desc' } },
      }),
      // Updates by severity
      prisma.update.groupBy({
        by: ['severity'],
        _count: { id: true },
        where: { publishedAt: { gte: thirtyDaysAgo } },
      }),
      // Top companies by update count
      prisma.update.groupBy({
        by: ['companyId'],
        _count: { id: true },
        where: { publishedAt: { gte: thirtyDaysAgo }, companyId: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      // Company names for top companies
      prisma.company.findMany({ select: { id: true, name: true, sector: true } }),
      // Recent updates (last 7 days, grouped by date via raw query workaround)
      prisma.update.findMany({
        where: { publishedAt: { gte: new Date(Date.now() - 7 * 86400000) } },
        select: { publishedAt: true, severity: true, category: true },
        orderBy: { publishedAt: 'asc' },
      })
    ])

    // Group recent by day
    const dayMap: Record<string, { date: string; total: number; high: number }> = {}
    for (const u of recentByDay) {
      const day = u.publishedAt.toISOString().split('T')[0]
      if (!dayMap[day]) dayMap[day] = { date: day, total: 0, high: 0 }
      dayMap[day].total++
      if (u.severity === 'high' || u.severity === 'critical') dayMap[day].high++
    }

    // Map company IDs to names
    const compMap = Object.fromEntries(topCompanies.map(c => [c.id, c]))
    const byCompany = byLob
      .filter(r => r.companyId)
      .map(r => ({
        company: compMap[r.companyId!]?.name || r.companyId,
        sector: compMap[r.companyId!]?.sector || 'other',
        count: r._count.id,
      }))

    // LOB breakdown (approximate from text contains)
    const lobCounts = await Promise.all([
      prisma.update.count({ where: { linesOfBusiness: { contains: 'Medicaid' }, publishedAt: { gte: thirtyDaysAgo } } }),
      prisma.update.count({ where: { linesOfBusiness: { contains: 'Medicare' }, publishedAt: { gte: thirtyDaysAgo } } }),
      prisma.update.count({ where: { linesOfBusiness: { contains: 'Marketplace' }, publishedAt: { gte: thirtyDaysAgo } } }),
      prisma.update.count({ where: { linesOfBusiness: { contains: 'Pharmacy' }, publishedAt: { gte: thirtyDaysAgo } } }),
      prisma.update.count({ where: { linesOfBusiness: { contains: 'Dual-Eligible' }, publishedAt: { gte: thirtyDaysAgo } } }),
    ])

    return NextResponse.json({
      byCategory: byCategory.map(r => ({ category: r.category, count: r._count.id })),
      bySeverity: bySeverity.map(r => ({ severity: r.severity, count: r._count.id })),
      byCompany,
      byLob: [
        { lob: 'Medicaid', count: lobCounts[0] },
        { lob: 'Medicare', count: lobCounts[1] },
        { lob: 'Marketplace', count: lobCounts[2] },
        { lob: 'Pharmacy', count: lobCounts[3] },
        { lob: 'Dual-Eligible', count: lobCounts[4] },
      ],
      timeline: Object.values(dayMap),
    })
  } catch (err) {
    console.error('Analytics error:', err)
    return NextResponse.json({ error: 'Analytics failed' }, { status: 500 })
  }
}
