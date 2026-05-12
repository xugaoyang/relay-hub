export type PlatformStatus = 'online' | 'degraded' | 'offline' | 'unknown'

/** 国内访问方式 */
export type AccessType = 'direct' | 'proxy' | 'both'

export interface SubscriptionPlan {
  name: string    // 套餐名 e.g. "基础版"
  price: string   // 价格 e.g. "¥238/月"
  note?: string   // 说明 e.g. "$35/5h + $100/周"
}

export interface PricingInfo {
  type: 'prepaid' | 'postpaid' | 'free' | 'mixed'
  minRecharge?: string
  priceNote: string
  freeCredit?: string
  /** 按量计费代表性价格，e.g. "Claude ¥4.5/M · Codex ¥0.6/M" */
  paygoNote?: string
  /** 订阅套餐列表 */
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
  /** 国内访问方式：direct=直连, proxy=需代理, both=均可 */
  accessType: AccessType
  /** 主打/支持的核心模型（手动维护） */
  keyModels: string[]
  /** 支付方式 e.g. ['支付宝', '微信', '信用卡'] */
  paymentMethods: string[]
  /** 平台上线/运营起始时间 e.g. '2023-06' */
  since?: string
  featured: boolean
  sortOrder: number
  // Auto-maintained fields
  status: PlatformStatus
  latency?: number
  models: string[]
  lastChecked?: string
  uptime7d?: number
  clickCount: number
  createdAt: string
  updatedAt: string
}

export interface ClickRecord {
  id: string
  platformId: string
  timestamp: string
  userAgent?: string
}

export interface DB {
  platforms: Platform[]
  clicks: ClickRecord[]
}
