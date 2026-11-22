// SMS is the first backend-connected feature. The other pages stay on sample data
// until their backend endpoints are agreed and added here.

import { API_URL, request } from '@/lib/http'

export { ApiError, load } from '@/lib/http'

export type SmsAnalyticsPoint = { day: string; delivered: number; failed: number; pending: number }
export type OverviewData = {
  analytics: SmsAnalyticsPoint[]
  dailyUsage: { planId: LicensePlanId; usedToday: number }
}

// GET {API_URL}/overview -> OverviewData (analytics points and current plan usage).

const mockOverview: OverviewData = {
  analytics: [
    { day: 'Mon', delivered: 3100, failed: 35, pending: 10 },
    { day: 'Tue', delivered: 3800, failed: 45, pending: 15 },
    { day: 'Wed', delivered: 3500, failed: 40, pending: 16 },
    { day: 'Thu', delivered: 4120, failed: 55, pending: 20 },
    { day: 'Fri', delivered: 3980, failed: 52, pending: 18 },
    { day: 'Sat', delivered: 4500, failed: 65, pending: 25 },
    { day: 'Sun', delivered: 3140, failed: 70, pending: 30 },
  ],
  dailyUsage: { planId: 'regular', usedToday: 3240 },
}

export async function getOverview(): Promise<OverviewData> {
  if (API_URL) {
    try {
      const result = await request<OverviewData>('/overview')
      const validPlan = result?.dailyUsage && ['regular', 'plus', 'inner-circle', 'enterprise'].includes(result.dailyUsage.planId)
      if (result && Array.isArray(result.analytics) && validPlan && Number.isFinite(result.dailyUsage.usedToday)) return result
    } catch {
      // Keep the overview usable with sample data until the backend overview contract is available.
    }
  }
  return mockOverview
}

/* ---------- SMS ---------- */

export type Option = { value: string; label: string }

// GET {API_URL}/sms/options -> SmsOptions
export type SmsOptions = { campaignTypes: Option[]; sids: Option[]; routes: Option[] }

// POST {API_URL}/sms
// Without an image: JSON body.
// With an image: multipart form (fields below, image file under the name "image").
export type SendSmsInput = {
  campaignType: string
  sid: string
  route: string
  recipients: string[]
  message: string
  test: boolean
  image?: File | null
}

// POST {API_URL}/sms may answer with { message: "..." } (shown in the success toast)
export type SendSmsResult = { message?: string }

const mockSmsOptions: SmsOptions = {
  campaignTypes: [{ value: 'sms', label: 'SMS' }],
  sids: [{ value: 'northstar', label: 'northstar' }],
  routes: [{ value: 'default', label: 'Default route' }],
}

// Accepts [{ value, label }], [{ id, name }] or ["A", "B"], so the backend shape can vary.
function toOptions(list: unknown): Option[] {
  if (!Array.isArray(list)) return []
  return list.map((item) => {
    if (typeof item === 'string') return { value: item, label: item }
    const o = item as Record<string, unknown>
    const value = String(o.value ?? o.id ?? o.name ?? '')
    return { value, label: String(o.label ?? o.name ?? value) }
  })
}

export async function getSmsOptions(): Promise<SmsOptions> {
  if (!API_URL) return mockSmsOptions

  const data = await request<Record<string, unknown>>('/sms/options')
  return {
    campaignTypes: toOptions(data.campaignTypes ?? data.campaign_types),
    sids: toOptions(data.sids ?? data.sender_ids),
    routes: toOptions(data.routes),
  }
}

export async function sendSms(input: SendSmsInput): Promise<SendSmsResult> {
  if (!API_URL) return { message: 'Sample mode: nothing was actually sent.' }

  const { image, ...fields } = input
  if (!image) return request<SendSmsResult>('/sms', { method: 'POST', body: fields })

  const form = new FormData()
  form.append('campaignType', fields.campaignType)
  form.append('sid', fields.sid)
  form.append('route', fields.route)
  form.append('message', fields.message)
  form.append('test', String(fields.test))
  fields.recipients.forEach((recipient) => form.append('recipients', recipient))
  form.append('image', image)
  return request<SendSmsResult>('/sms', { method: 'POST', body: form })
}

/* ---------- SID ---------- */

export type SidItem = {
  id: string
  name: string
  status: string
  tone?: 'ok' | 'warn' | 'muted'
  created: string
  region?: string
}

export type SidRegion = 'usa' | 'canada' | 'eu_uk_custom'

export type SidRequestInput = {
  region: SidRegion
  senderName?: string
}

export type SidRequestResult = {
  sid: SidItem
  message?: string
}

const mockSids: SidItem[] = [
  { id: '1', name: '+1 (202) 555-0182', status: 'Active', created: 'Nov 12, 2026', region: 'USA' },
  { id: '2', name: 'northstar-promo', status: 'Activating', tone: 'warn', created: 'Nov 18, 2026', region: 'EU / UK' },
]

export async function getSids(): Promise<SidItem[]> {
  if (API_URL) return request<SidItem[]>('/sids')
  return mockSids
}

// POST {API_URL}/sids -> { sid: SidItem, message?: string }
// DELETE {API_URL}/sids/{id} -> 204
export async function requestSid(input: SidRequestInput): Promise<SidRequestResult> {
  if (!API_URL) {
    const regionLabel = input.region === 'usa' ? 'USA' : input.region === 'canada' ? 'Canada' : 'EU / UK'
    return {
      sid: {
        id: `sample-${Date.now()}`,
        name: input.senderName?.trim() || `${regionLabel} number request`,
        status: 'Activating',
        tone: 'warn',
        created: 'Just now',
        region: regionLabel,
      },
      message: 'Sample mode: request saved locally for preview.',
    }
  }

  const result = await request<SidItem | SidRequestResult>('/sids', { method: 'POST', body: input })
  return 'sid' in result ? result : { sid: result }
}

export async function deleteSid(id: string): Promise<void> {
  if (!API_URL) return
  await request<void>(`/sids/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

/* ---------- Logs ---------- */

export type LogItem = {
  id: string
  date: string
  deliveryTime?: string | null
  recipient: string
  recipients?: string[]
  sid: string
  message: string
  status: string
  reply?: string | null
  replyAt?: string | null
  amountDeducted?: string | null
  tone?: 'ok' | 'warn' | 'muted'
}

export type LogsPage = { items: LogItem[]; hasMore: boolean }

const mockLogs: LogItem[] = [
  { id: '1', date: 'Nov 19, 10:42 AM', deliveryTime: 'Nov 19, 2026, 10:42 AM', recipient: '+12025550182', sid: 'northstar', message: 'Your code is 482913', status: 'Delivered', amountDeducted: '1 credit' },
  { id: '2', date: 'Nov 19, 10:40 AM', deliveryTime: 'Nov 19, 2026, 10:40 AM', recipient: '+447700900123', sid: 'northstar', message: 'Welcome aboard! Thanks for joining us.', status: 'Delivered', amountDeducted: '1 credit', reply: 'Thanks, received!', replyAt: 'Nov 19, 2026, 10:44 AM' },
  { id: '3', date: 'Nov 19, 10:31 AM', deliveryTime: 'Nov 19, 2026, 10:32 AM', recipient: '+12025550911', sid: 'northstar', message: 'Your order has shipped', status: 'Failed', tone: 'muted', amountDeducted: '0 credits' },
  { id: '4', date: 'Nov 19, 10:18 AM', deliveryTime: 'Nov 19, 2026, 10:18 AM', recipient: '+12025550182', recipients: ['+12025550182', '+12025550183', '+12025550184'], sid: 'northstar', message: 'Your appointment is tomorrow at 9 AM.', status: 'Delivered', amountDeducted: '3 credits' },
  { id: '5', date: 'Nov 19, 09:52 AM', deliveryTime: 'Nov 19, 2026, 09:53 AM', recipient: '+447700900123', sid: 'northstar', message: 'Your one-time password is 731204', status: 'Delivered', amountDeducted: '1 credit' },
  { id: '6', date: 'Nov 19, 09:20 AM', deliveryTime: 'Nov 19, 2026, 09:20 AM', recipient: '+12025550911', sid: 'northstar', message: 'Your order has shipped', status: 'Pending', tone: 'warn', amountDeducted: '1 credit' },
]

const mockLogsPage: LogsPage = {
  hasMore: false,
  items: mockLogs,
}

export async function getLogs(page: number): Promise<LogsPage> {
  if (API_URL) return request<LogsPage>(`/logs?page=${page}`)
  return mockLogsPage
}

export async function getLog(id: string): Promise<LogItem> {
  if (API_URL) return request<LogItem>(`/logs/${encodeURIComponent(id)}`)
  const log = mockLogs.find((item) => item.id === id)
  if (!log) throw new Error('This message could not be found.')
  return log
}

/* ---------- Inbound ---------- */

export type InboundItem = {
  id: string
  date: string
  from: string
  to: string
  message: string
}

export type InboundPage = { items: InboundItem[]; hasMore: boolean }

// GET {API_URL}/inbound?page=1 -> InboundPage

const mockInbound: InboundPage = {
  hasMore: false,
  items: [
    { id: '1', date: 'Nov 19, 10:38 AM', from: '+447700900123', to: '+12025550100', message: 'Thanks, received!' },
    { id: '2', date: 'Nov 19, 09:15 AM', from: '+12025550182', to: '+12025550100', message: 'STOP' },
  ],
}

export async function getInbound(page: number): Promise<InboundPage> {
  if (API_URL) return request<InboundPage>(`/inbound?page=${page}`)
  return mockInbound
}

/* ---------- Credits ---------- */

export type CryptoInvoiceInput = { amountGbp: number; coin: string; expiresInSeconds: 3600 }

export type CreditBalance = { balanceGbp: number }

// GET {API_URL}/credits/balance -> { balanceGbp }
export async function getCreditBalance(): Promise<CreditBalance | null> {
  if (!API_URL) return null
  return request<CreditBalance>('/credits/balance')
}

export type CryptoInvoice = {
  id: string
  amountGbp: number
  coin: string
  cryptoAmount: string
  network: string
  address: string
  expiresAt: string
  isPreview?: boolean
}

// POST {API_URL}/credits/crypto-invoices -> CryptoInvoice (expiresAt is set to one hour after creation)
export async function createCryptoInvoice(input: CryptoInvoiceInput): Promise<CryptoInvoice> {
  if (!API_URL) {
    const coin = input.coin.toUpperCase()
    const networks: Record<string, string> = {
      BTC: 'Bitcoin', ETH: 'Ethereum', USDT: 'Ethereum', USDC: 'Ethereum', BNB: 'BNB Smart Chain',
      SOL: 'Solana', LTC: 'Litecoin', XRP: 'XRP Ledger', DOGE: 'Dogecoin', TRX: 'Tron', ADA: 'Cardano', TON: 'TON',
    }
    const mockAmounts: Record<string, string> = {
      BTC: '0.00142000', ETH: '0.04200000', USDT: '50.00', USDC: '50.00', BNB: '0.12500000',
      SOL: '0.85000000', LTC: '0.52000000', XRP: '35.00000000', DOGE: '250.00000000', TRX: '120.00000000',
      ADA: '80.00000000', TON: '9.50000000',
    }
    return {
      id: `preview-${Date.now()}`,
      amountGbp: input.amountGbp,
      coin,
      cryptoAmount: mockAmounts[coin] ?? '10.00000000',
      network: networks[coin] ?? `${coin} network`,
      address: `MOCK-${coin}-ADDRESS-FOR-PREVIEW-ONLY`,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      isPreview: true,
    }
  }
  return request<CryptoInvoice>('/credits/crypto-invoices', { method: 'POST', body: input })
}

/* ---------- License plans ---------- */

export type LicensePlanId = 'regular' | 'plus' | 'inner-circle' | 'enterprise'
export type LicenseCheckout = { checkoutUrl: string }

export const licensePlanInfo: Record<LicensePlanId, { name: string; dailyLimit: number | null }> = {
  regular: { name: 'Regular', dailyLimit: 5_000 },
  plus: { name: 'Pro', dailyLimit: 15_000 },
  'inner-circle': { name: 'Advanced', dailyLimit: null },
  enterprise: { name: 'Elite', dailyLimit: null },
}

// POST {API_URL}/licenses/purchase -> { checkoutUrl }
export async function startLicensePurchase(planId: LicensePlanId): Promise<LicenseCheckout> {
  return request<LicenseCheckout>('/licenses/purchase', { method: 'POST', body: { planId } })
}

/* ---------- Route & Pricing ---------- */

export type RouteItem = {
  id: string
  country: string
  flag: string
  status: 'Online' | 'Offline'
  supportsCustomSid: boolean
  priceGbp: string
}

const mockRoutes: RouteItem[] = [
  { id: 'us', country: 'USA', flag: '🇺🇸', status: 'Online', supportsCustomSid: false, priceGbp: '0.026' },
  { id: 'ca', country: 'Canada', flag: '🇨🇦', status: 'Online', supportsCustomSid: false, priceGbp: '0.026' },
  { id: 'gb', country: 'United Kingdom', flag: '🇬🇧', status: 'Online', supportsCustomSid: true, priceGbp: '0.069' },
  { id: 'fr', country: 'France', flag: '🇫🇷', status: 'Online', supportsCustomSid: true, priceGbp: '0.069' },
  { id: 'de', country: 'Germany', flag: '🇩🇪', status: 'Online', supportsCustomSid: true, priceGbp: '0.069' },
  { id: 'au', country: 'Australia', flag: '🇦🇺', status: 'Online', supportsCustomSid: true, priceGbp: '0.079' },
  { id: 'be', country: 'Belgium', flag: '🇧🇪', status: 'Online', supportsCustomSid: true, priceGbp: '0.069' },
  { id: 'ch', country: 'Switzerland', flag: '🇨🇭', status: 'Online', supportsCustomSid: true, priceGbp: '0.092' },
  { id: 'es', country: 'Spain', flag: '🇪🇸', status: 'Online', supportsCustomSid: true, priceGbp: '0.069' },
  { id: 'ru', country: 'Russia', flag: '🇷🇺', status: 'Online', supportsCustomSid: true, priceGbp: '0.076' },
  { id: 'my', country: 'Malaysia', flag: '🇲🇾', status: 'Online', supportsCustomSid: true, priceGbp: '0.082' },
  { id: 'no', country: 'Norway', flag: '🇳🇴', status: 'Online', supportsCustomSid: true, priceGbp: '0.077' },
  { id: 'mc', country: 'Monaco', flag: '🇲🇨', status: 'Online', supportsCustomSid: true, priceGbp: '0.069' },
  { id: 'fi', country: 'Finland', flag: '🇫🇮', status: 'Online', supportsCustomSid: true, priceGbp: '0.069' },
  { id: 'pk', country: 'Pakistan', flag: '🇵🇰', status: 'Online', supportsCustomSid: true, priceGbp: '0.069' },
  { id: 'cu', country: 'Cuba', flag: '🇨🇺', status: 'Online', supportsCustomSid: true, priceGbp: '0.069' },
  { id: 'sd', country: 'Sudan', flag: '🇸🇩', status: 'Online', supportsCustomSid: true, priceGbp: '0.069' },
  { id: 'pe', country: 'Peru', flag: '🇵🇪', status: 'Offline', supportsCustomSid: true, priceGbp: '0.069' },
  { id: 'ro', country: 'Romania', flag: '🇷🇴', status: 'Online', supportsCustomSid: true, priceGbp: '0.07' },
  { id: 'dk', country: 'Denmark', flag: '🇩🇰', status: 'Online', supportsCustomSid: true, priceGbp: '0.074' },
  { id: 'jp', country: 'Japan', flag: '🇯🇵', status: 'Online', supportsCustomSid: true, priceGbp: '0.085' },
  { id: 'nl', country: 'Netherlands', flag: '🇳🇱', status: 'Online', supportsCustomSid: true, priceGbp: '0.079' },
  { id: 'ie', country: 'Ireland', flag: '🇮🇪', status: 'Online', supportsCustomSid: true, priceGbp: '0.073' },
  { id: 'pt', country: 'Portugal', flag: '🇵🇹', status: 'Online', supportsCustomSid: true, priceGbp: '0.075' },
  { id: 'pl', country: 'Poland', flag: '🇵🇱', status: 'Online', supportsCustomSid: true, priceGbp: '0.071' },
  { id: 'it', country: 'Italy', flag: '🇮🇹', status: 'Online', supportsCustomSid: true, priceGbp: '0.072' },
  { id: 'at', country: 'Austria', flag: '🇦🇹', status: 'Online', supportsCustomSid: true, priceGbp: '0.069' },
  { id: 'cl', country: 'Chile', flag: '🇨🇱', status: 'Online', supportsCustomSid: true, priceGbp: '0.072' },
  { id: 'cz', country: 'Czech Republic', flag: '🇨🇿', status: 'Online', supportsCustomSid: true, priceGbp: '0.07' },
  { id: 'ee', country: 'Estonia', flag: '🇪🇪', status: 'Online', supportsCustomSid: true, priceGbp: '0.07' },
  { id: 'hu', country: 'Hungary', flag: '🇭🇺', status: 'Online', supportsCustomSid: true, priceGbp: '0.075' },
  { id: 'lt', country: 'Lithuania', flag: '🇱🇹', status: 'Online', supportsCustomSid: true, priceGbp: '0.06' },
  { id: 'lv', country: 'Latvia', flag: '🇱🇻', status: 'Online', supportsCustomSid: true, priceGbp: '0.07' },
  { id: 'mx', country: 'Mexico', flag: '🇲🇽', status: 'Online', supportsCustomSid: true, priceGbp: '0.06' },
  { id: 'se', country: 'Sweden', flag: '🇸🇪', status: 'Online', supportsCustomSid: true, priceGbp: '0.079' },
  { id: 'sk', country: 'Slovakia', flag: '🇸🇰', status: 'Online', supportsCustomSid: true, priceGbp: '0.07' },
  { id: 'tr', country: 'Turkey', flag: '🇹🇷', status: 'Online', supportsCustomSid: true, priceGbp: '0.07' },
]

export async function getRoutes(): Promise<RouteItem[]> {
  // Keep the route page independent of a backend endpoint that has not been agreed yet.
  // Replace this sample return with GET /routes once the production response contract is ready.
  return mockRoutes
}

