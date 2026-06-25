import type { Category, Severity } from '@/types'

const CENTENE_KEYWORDS = [
  'centene', 'wellcare', 'ambetter', 'coordinated care', 'managed care',
  'medicaid', 'medicare advantage', 'marketplace', 'aca', 'chip',
  'hedis', 'star rating', 'star ratings', 'risk adjustment', 'radv',
  'prior authorization', 'utilization management', 'claims cost',
  'value-based care', 'vbc', 'pay for performance',
  'dual eligible', 'dsnp', 'mmp', 'ltss',
  'provider network', 'provider contract', 'network adequacy',
  'pbm', 'pharmacy benefit', 'drug formulary',
  'behavioral health', 'substance use', 'mental health',
  'sdoh', 'social determinants', 'community health',
]

const HIGH_IMPACT_KEYWORDS = [
  'recall', 'safety alert', 'warning letter', 'fda warning',
  'acquisition', 'merger', 'acquired', 'buyout',
  'contract award', 'contract loss', 'bid protest',
  'cms final rule', 'final rule', 'interim final rule',
  'breakthrough therapy', 'fast track', 'priority review',
  'class action', 'lawsuit', 'settlement', 'fraud',
  'state medicaid', 'medicaid waiver', '1115 waiver',
  'medicare advantage rate', 'advance notice', 'rate notice',
]

const MODERATE_KEYWORDS = [
  'partnership', 'collaboration', 'agreement', 'contract',
  'earnings', 'quarterly results', 'guidance', 'revenue',
  'clinical trial', 'phase 3', 'phase 2', 'fda approval',
  'approved', 'drug approval', 'nda', 'bla', 'pma',
  'hospital', 'health system', 'integrated delivery',
]

const COMPETITOR_NAMES = [
  'unitedhealth', 'unitedhealthcare', 'optum', 'uhc',
  'cvs health', 'aetna', 'caremark',
  'elevance', 'anthem', 'wellpoint',
  'cigna', 'evernorth', 'express scripts',
  'humana', 'molina', 'oscar health',
  'kaiser', 'blue cross', 'bcbs',
]

export function scoreUpdate(title: string, content: string): {
  impactScore: number
  severity: Severity
  updateType: string
  linesOfBusiness: string[]
  category: Category
} {
  const text = `${title} ${content}`.toLowerCase()

  let score = 3
  const lob: string[] = []

  // LOB detection
  if (/medicaid/.test(text)) lob.push('Medicaid')
  if (/medicare/.test(text)) lob.push('Medicare')
  if (/marketplace|aca|exchange/.test(text)) lob.push('Marketplace')
  if (/pharmacy|pbm|drug formulary/.test(text)) lob.push('Pharmacy')
  if (/dual[- ]eligible|dsnp|mmp/.test(text)) lob.push('Dual-Eligible')
  if (/commercial insurance|employer/.test(text)) lob.push('Commercial')

  // Centene-relevant terms
  const centeneMatches = CENTENE_KEYWORDS.filter(kw => text.includes(kw)).length
  score += Math.min(centeneMatches * 0.5, 3)

  // High impact terms
  const highMatches = HIGH_IMPACT_KEYWORDS.filter(kw => text.includes(kw)).length
  score += Math.min(highMatches * 1, 3)

  // Moderate impact terms
  const modMatches = MODERATE_KEYWORDS.filter(kw => text.includes(kw)).length
  score += Math.min(modMatches * 0.4, 2)

  // Competitor mentions
  const compMatches = COMPETITOR_NAMES.filter(kw => text.includes(kw)).length
  score += Math.min(compMatches * 0.3, 1)

  score = Math.round(Math.min(Math.max(score, 1), 10))

  // Severity from score
  let severity: Severity = 'low'
  if (score >= 8) severity = 'critical'
  else if (score >= 6) severity = 'high'
  else if (score >= 4) severity = 'medium'

  // Update type
  let updateType = 'operational_signal'
  if (/recall|warning|safety alert|lawsuit|fraud/.test(text)) updateType = 'risk'
  else if (/approved|approval|breakthrough|award|win|contract award/.test(text)) updateType = 'opportunity'
  else if (/unitedhealthcare|aetna|humana|molina|elevance|cigna/.test(text)) updateType = 'competitor_move'
  else if (/final rule|rule change|regulation|cms|cms policy|waiver/.test(text)) updateType = 'policy_change'

  // Category detection
  const category = detectCategory(text, title.toLowerCase())

  return { impactScore: score, severity, updateType, linesOfBusiness: lob, category }
}

function detectCategory(text: string, title: string): Category {
  if (/fda.*approv|approved.*fda|nda.*approved|bla.*approved|pma.*approved/.test(text)) return 'fda_approval'
  if (/recall|class i recall|class ii recall|fda.*warning|fda.*alert|safety alert/.test(text)) return 'fda_recall'
  if (/clinical trial|phase [1-3]|clinicaltrials|trial results|study results/.test(text)) return 'trial_update'
  if (/cms|medicare|medicaid.*rule|final rule|interim rule|cms.*policy|advance notice/.test(text)) return 'cms_policy'
  if (/state medicaid|medicaid contract|medicaid waiver|rfp|request for proposal/.test(text)) return 'state_contract'
  if (/earnings|quarterly results|revenue|guidance|eps|financial results/.test(text)) return 'earnings'
  if (/acqui|merger|acquired|buyout|takeover/.test(text)) return 'ma_activity'
  if (/partnership|collaboration|agreement|alliance|joint venture/.test(text)) return 'partnership'
  if (/drug launch|launches|launch|approved.*available|market.*launch/.test(text)) return 'drug_launch'
  if (/digital health|telehealth|telemedicine|healthtech|ai.*health/.test(text)) return 'digital_health'
  if (/value-based|vbc|pay for performance|shared savings|alternative payment/.test(text)) return 'vbc'
  if (/research|study|pubmed|journal|publication|findings/.test(text)) return 'research'
  if (/ceo|cfo|coo|president|executive|appoint|resign|named/.test(text)) return 'leadership'
  if (/regulation|regulatory|compliance|enforcement|fda warning letter/.test(text)) return 'regulatory'
  return 'news'
}

export function detectStates(text: string): string[] {
  const statePatterns: Record<string, string> = {
    'Texas|TX': 'TX', 'Florida|FL': 'FL', 'California|CA': 'CA',
    'Missouri|MO': 'MO', 'Ohio|OH': 'OH', 'Georgia|GA': 'GA',
    'Illinois|IL': 'IL', 'Washington|WA': 'WA', 'Arizona|AZ': 'AZ',
    'New York|NY': 'NY', 'Pennsylvania|PA': 'PA', 'Michigan|MI': 'MI',
    'North Carolina|NC': 'NC', 'Tennessee|TN': 'TN', 'Virginia|VA': 'VA',
    'Colorado|CO': 'CO', 'Indiana|IN': 'IN', 'Kentucky|KY': 'KY',
    'Louisiana|LA': 'LA', 'Mississippi|MS': 'MS', 'Nevada|NV': 'NV',
    'South Carolina|SC': 'SC', 'Kansas|KS': 'KS', 'Arkansas|AR': 'AR',
    'Nebraska|NE': 'NE', 'New Mexico|NM': 'NM', 'West Virginia|WV': 'WV',
  }

  const found: string[] = []
  for (const [pattern, abbr] of Object.entries(statePatterns)) {
    if (new RegExp(pattern, 'i').test(text)) found.push(abbr)
  }
  return Array.from(new Set(found))
}
