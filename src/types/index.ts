export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type UpdateType = 'risk' | 'opportunity' | 'competitor_move' | 'policy_change' | 'operational_signal'
export type LineOfBusiness = 'Medicaid' | 'Medicare' | 'Marketplace' | 'Commercial' | 'Pharmacy' | 'Dual-Eligible'

export type Category =
  | 'fda_approval'
  | 'fda_recall'
  | 'cms_policy'
  | 'earnings'
  | 'trial_update'
  | 'drug_launch'
  | 'ma_activity'
  | 'partnership'
  | 'regulatory'
  | 'research'
  | 'leadership'
  | 'safety_alert'
  | 'state_contract'
  | 'vbc'
  | 'digital_health'
  | 'news'

export interface UpdateWithSummary {
  id: string
  title: string
  rawContent: string | null
  url: string
  publishedAt: string
  ingestedAt: string
  companyId: string | null
  sourceName: string | null
  sourceUrl: string | null
  category: Category
  subCategory: string | null
  linesOfBusiness: LineOfBusiness[]
  states: string[]
  impactScore: number
  severity: Severity
  updateType: UpdateType | null
  company: {
    id: string
    name: string
    ticker: string | null
    sector: string
    orgType: string
  } | null
  aiSummary: AiSummaryData | null
}

export interface AiSummaryData {
  id: string
  summary: string
  keyFacts: string[]
  affectedPopulation: string | null
  operationalImpact: string | null
  financialImpact: string | null
  regulatoryImpact: string | null
  competitiveImpact: string | null
  centeneRelevance: string | null
  recommendedAction: string | null
  updateType: string | null
  tags: string[]
  generatedAt: string
  modelVersion?: string
}

export interface Metrics {
  total: number
  highImpact: number
  medicaid: number
  medicare: number
  marketplace: number
  competitor: number
  regulatory: number
  fda: number
  cmsPolicy: number
  stateMedicaid: number
  earnings: number
  ma: number
  lastUpdated: string
}

export interface FilterState {
  search: string
  category: string
  severity: string
  lineOfBusiness: string
  state: string
  company: string
  dateRange: string
  updateType: string
  sector: string
}
