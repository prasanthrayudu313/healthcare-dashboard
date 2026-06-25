'use client'
import { Header } from '@/components/layout/Header'
import { DashboardCharts } from '@/components/charts/DashboardCharts'
import { KpiCards } from '@/components/kpi/KpiCards'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <KpiCards />
      <div className="px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-100">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">30-day intelligence overview for managed care analysis</p>
        </div>
        <DashboardCharts />
      </div>
    </div>
  )
}
