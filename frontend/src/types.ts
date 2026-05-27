export type PlatformStatus = 'online' | 'degraded' | 'offline' | 'unknown'

export type AccessType = 'direct' | 'proxy' | 'both'

export type PlatformCategory = 'relay' | 'inference' | 'aggregator'

export interface SubscriptionPlan {
  name: string
  price: string
  note?: string
}

export interface PricingInfo {
  type: 'prepaid' | 'postpaid' | 'free' | 'mixed'
  minRecharge?: string
  priceNote: string
  freeCredit?: string
  paygoNote?: string
  plans?: SubscriptionPlan[]
}

export interface Platform {
  id: string
  name: string
  description: string
  website: string
  apiBaseUrl: string
  registerUrl: string
  inviteCode: string
  dashboardUrl?: string
  docUrl?: string
  logo?: string
  tags: string[]
  pros: string[]
  cons: string[]
  pricing: PricingInfo
  accessType: AccessType
  keyModels: string[]
  paymentMethods: string[]
  since?: string
  category?: PlatformCategory
  featured: boolean
  sortOrder: number
  status: PlatformStatus
  latency?: number
  models: string[]
  lastChecked?: string
  uptime7d?: number
  clickCount: number
  createdAt: string
  updatedAt: string
}
