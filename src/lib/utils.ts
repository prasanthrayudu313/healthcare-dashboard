import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import type { Severity, Category } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function formatDateShort(date: string | Date): string {
  return format(new Date(date), 'MMM d')
}

export const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; dot: string; bg: string; border: string }> = {
  critical: {
    label: 'Critical',
    color: 'text-red-400',
    dot: 'bg-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  high: {
    label: 'High',
    color: 'text-orange-400',
    dot: 'bg-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-400',
    dot: 'bg-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  low: {
    label: 'Low',
    color: 'text-green-400',
    dot: 'bg-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
  },
}

export const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  fda_approval: { label: 'FDA Approval', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  fda_recall: { label: 'FDA Recall', color: 'text-red-400', bg: 'bg-red-500/10' },
  safety_alert: { label: 'Safety Alert', color: 'text-red-400', bg: 'bg-red-500/10' },
  cms_policy: { label: 'CMS Policy', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  state_contract: { label: 'State Contract', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  earnings: { label: 'Earnings', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  trial_update: { label: 'Clinical Trial', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  drug_launch: { label: 'Drug Launch', color: 'text-teal-400', bg: 'bg-teal-500/10' },
  ma_activity: { label: 'M&A', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  partnership: { label: 'Partnership', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  regulatory: { label: 'Regulatory', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  research: { label: 'Research', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  leadership: { label: 'Leadership', color: 'text-slate-400', bg: 'bg-slate-500/10' },
  vbc: { label: 'Value-Based Care', color: 'text-green-400', bg: 'bg-green-500/10' },
  digital_health: { label: 'Digital Health', color: 'text-sky-400', bg: 'bg-sky-500/10' },
  news: { label: 'News', color: 'text-slate-400', bg: 'bg-slate-500/10' },
}

export const UPDATE_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  risk: { label: 'Risk', icon: '⚠', color: 'text-red-400' },
  opportunity: { label: 'Opportunity', icon: '↑', color: 'text-green-400' },
  competitor_move: { label: 'Competitor Move', icon: '⚡', color: 'text-orange-400' },
  policy_change: { label: 'Policy Change', icon: '§', color: 'text-blue-400' },
  operational_signal: { label: 'Operational Signal', icon: '◎', color: 'text-slate-400' },
}

export const LINES_OF_BUSINESS = [
  'Medicaid', 'Medicare', 'Marketplace', 'Commercial', 'Pharmacy', 'Dual-Eligible'
] as const

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC'
]
