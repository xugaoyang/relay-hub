import fs from 'fs'
import path from 'path'
import type { DB, Platform } from './types'

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json')

const now = new Date().toISOString()
const makePlatform = (p: Omit<Platform, 'status' | 'models' | 'clickCount' | 'createdAt' | 'updatedAt'>): Platform => ({
  ...p, status: 'unknown', models: [], clickCount: 0, createdAt: now, updatedAt: now,
})

// prettier-ignore
const INITIAL_PLATFORMS: Platform[] = [
  // ── 综合聚合型中转站（国内直连）────────────────────────────
  makePlatform({
    id: 'aihubmix',
    name: 'AiHubMix',
    description: '国内直连，聚合 GPT-4o、Claude 3.5、Gemini 等 100+ 模型，价格透明',
    website: 'https://aihubmix.com',
    apiBaseUrl: 'https://aihubmix.com/v1',
    registerUrl: 'https://aihubmix.com?aff=YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://aihubmix.com/token',
    docUrl: 'https://doc.aihubmix.com',
    tags: ['国内直连', '100+模型', 'GPT', 'Claude', 'Gemini'],
    pros: ['国内无需代理', '模型覆盖极广', '稳定性好', '定价清晰'],
    cons: ['需先充值', '价格略高于官方'],
    pricing: { type: 'prepaid', minRecharge: '10元', priceNote: '按 Token 计费，各模型独立定价', paygoNote: '按 Token 按量，各模型独立定价' },
    accessType: 'direct',
    keyModels: ['GPT-4o', 'Claude 3.5 Sonnet', 'Gemini 1.5 Pro', 'DeepSeek V3', 'o1'],
    paymentMethods: ['支付宝', '微信'],
    since: '2023-06',
    featured: true, sortOrder: 1,
  }),
  makePlatform({
    id: '302ai',
    name: '302.AI',
    description: '国内知名综合中转，支持 Claude/GPT/Gemini/Flux 等，含图片视频生成',
    website: 'https://302.ai',
    apiBaseUrl: 'https://api.302.ai/v1',
    registerUrl: 'https://302.ai/apis/YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://302.ai/invite',
    docUrl: 'https://help.302.ai',
    tags: ['国内直连', '综合平台', 'Claude', 'GPT', 'Gemini', '图片生成'],
    pros: ['品类最全（含绘图/视频/语音）', '国内直连', '按量灵活', '文档完善'],
    cons: ['价格偏高', '套餐模式较复杂'],
    pricing: { type: 'mixed', priceNote: '按次/按量，不同模型策略不同', paygoNote: 'Claude / GPT / Gemini 分别定价', freeCredit: '注册送少量额度' },
    accessType: 'direct',
    keyModels: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro', 'Flux', 'Sora'],
    paymentMethods: ['支付宝', '微信', '信用卡'],
    since: '2023-09',
    featured: true, sortOrder: 2,
  }),
  makePlatform({
    id: 'openrouter',
    name: 'OpenRouter',
    description: '全球最大模型聚合平台，300+ 模型，含大量免费模型，海外首选',
    website: 'https://openrouter.ai',
    apiBaseUrl: 'https://openrouter.ai/api/v1',
    registerUrl: 'https://openrouter.ai/?referrer=YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://openrouter.ai/credits',
    docUrl: 'https://openrouter.ai/docs',
    tags: ['海外', '300+模型', '免费模型', '按量计费'],
    pros: ['模型覆盖最全', '部分模型永久免费', '稳定性极高', 'API 文档完善', '统一接口'],
    cons: ['国内需代理', '注册需海外邮箱或 Google 账号'],
    pricing: { type: 'postpaid', priceNote: '按 Token 按量，与官方持平或更低', paygoNote: '官方价±5%，部分模型免费', freeCredit: '部分模型永久免费' },
    accessType: 'proxy',
    keyModels: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro', 'Llama 3.1 405B', 'DeepSeek V3'],
    paymentMethods: ['信用卡', 'Crypto'],
    since: '2023-01',
    featured: true, sortOrder: 3,
  }),
  makePlatform({
    id: 'burnhair',
    name: 'Burn.Hair',
    description: '价格极具竞争力，DeepSeek 系列定价业内最低，国内直连，按量后付',
    website: 'https://burn.hair',
    apiBaseUrl: 'https://burn.hair/v1',
    registerUrl: 'https://burn.hair/register?aff=YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://burn.hair/console/invite',
    docUrl: 'https://burn.hair/docs',
    tags: ['价格极低', '国内直连', 'DeepSeek', 'GPT', 'Claude', '按量计费'],
    pros: ['DeepSeek 价格业内最低', '按量后付无需预充', '国内直连', '支持多模型'],
    cons: ['相对较新', '用户社区较小'],
    pricing: { type: 'postpaid', priceNote: 'DeepSeek V3 极低价，GPT/Claude 有折扣' },
    accessType: 'direct',
    keyModels: ['DeepSeek V3', 'DeepSeek R1', 'GPT-4o', 'Claude 3.5 Sonnet'],
    paymentMethods: ['支付宝', '微信'],
    since: '2024-01',
    featured: true, sortOrder: 4,
  }),
  makePlatform({
    id: 'closeai',
    name: 'CloseAI',
    description: '老牌稳定中转，运营多年，GPT 全系，国内直连，社区活跃',
    website: 'https://openai-hk.com',
    apiBaseUrl: 'https://api.openai-hk.com/v1',
    registerUrl: 'https://openai-hk.com?invite=YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://openai-hk.com/dashboard',
    tags: ['国内直连', '老牌平台', 'GPT全系', '稳定'],
    pros: ['运营超 2 年极稳定', '国内直连', '售后响应快', '社区活跃'],
    cons: ['价格偏贵', '新模型上线节奏稍慢'],
    pricing: { type: 'prepaid', minRecharge: '20元', priceNote: '按 Token 计费，价格透明' },
    accessType: 'direct',
    keyModels: ['GPT-4o', 'GPT-4o mini', 'o1', 'Claude 3.5 Sonnet'],
    paymentMethods: ['支付宝', '微信'],
    since: '2023-03',
    featured: false, sortOrder: 5,
  }),
  makePlatform({
    id: 'api2d',
    name: 'API2D',
    description: '运营超 3 年的老牌中转，国内直连，支持企业增值税发票，稳定可靠',
    website: 'https://api2d.com',
    apiBaseUrl: 'https://openai.api2d.net/v1',
    registerUrl: 'https://api2d.com/r/YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://api2d.com/plus/myUsage',
    docUrl: 'https://api2d.com/doc',
    tags: ['国内直连', '老牌平台', '支持发票', '企业友好'],
    pros: ['运营超 3 年', '企业可开增值税发票', '文档完善', '极稳定可靠'],
    cons: ['价格较高', '新模型上线较慢'],
    pricing: { type: 'prepaid', minRecharge: '50元', priceNote: '按 Token 计费，企业可开发票' },
    accessType: 'direct',
    keyModels: ['GPT-4o', 'GPT-4 Turbo', 'GPT-3.5 Turbo'],
    paymentMethods: ['支付宝', '微信', '对公转账'],
    since: '2022-12',
    featured: false, sortOrder: 6,
  }),
  makePlatform({
    id: 'ohmygpt',
    name: 'OhMyGPT',
    description: '新兴中转，注册即送免费额度，价格有竞争力，支持 GPT/Claude/DeepSeek',
    website: 'https://ohmygpt.com',
    apiBaseUrl: 'https://api.ohmygpt.com/v1',
    registerUrl: 'https://ohmygpt.com?aff=YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://ohmygpt.com/invite',
    tags: ['注册送额度', '国内直连', 'GPT', 'Claude', 'DeepSeek'],
    pros: ['注册即送免费额度', '价格有竞争力', '界面简洁友好'],
    cons: ['平台较新', '稳定性有待长期观察'],
    pricing: { type: 'prepaid', priceNote: '充值按量计费', freeCredit: '注册送少量额度' },
    accessType: 'direct',
    keyModels: ['GPT-4o', 'Claude 3.5 Sonnet', 'DeepSeek V3'],
    paymentMethods: ['支付宝', '微信'],
    since: '2024-03',
    featured: false, sortOrder: 7,
  }),
  makePlatform({
    id: 'deepbricks',
    name: 'DeepBricks',
    description: '海外中转，价格低于官方，支持 GPT-4o、Claude 3.5、DeepSeek、Gemini',
    website: 'https://deepbricks.ai',
    apiBaseUrl: 'https://api.deepbricks.ai/v1',
    registerUrl: 'https://deepbricks.ai/?ref=YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://deepbricks.ai/dashboard',
    docUrl: 'https://deepbricks.ai/docs',
    tags: ['海外', '价格低', 'GPT', 'Claude', 'DeepSeek', 'Gemini'],
    pros: ['价格低于官方', '模型种类多', '注册赠送额度'],
    cons: ['国内需代理', '平台较新'],
    pricing: { type: 'postpaid', priceNote: '按量计费，价格低于官方', freeCredit: '注册赠送少量额度' },
    accessType: 'proxy',
    keyModels: ['GPT-4o', 'Claude 3.5 Sonnet', 'DeepSeek V3', 'Gemini 1.5 Pro'],
    paymentMethods: ['信用卡', '支付宝'],
    since: '2024-02',
    featured: false, sortOrder: 8,
  }),
  // ── Claude/Codex/Gemini 专属中转站 ─────────────────────────
  makePlatform({
    id: 'cubence',
    name: 'Cubence',
    description: 'Claude Code & Codex Gateway，速度/价格/缓存综合一流，大风控时最先恢复，支持开票',
    website: 'https://cubence.com',
    apiBaseUrl: 'https://cubence.com/v1',
    registerUrl: 'https://cubence.com/signup?code=YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://cubence.com/dashboard',
    docUrl: 'https://cubence.com/docs',
    tags: ['国内直连', 'Claude Code', 'Codex', 'Gemini', '支持发票', '高速稳定'],
    pros: ['Claude/Codex 速度缓存综合一流', '大风控时最先恢复', '付费用户支持 ACE MCP', '支持发票'],
    cons: ['按量价格 Claude 2.5x 偏高', '30天超期订单不退款'],
    pricing: {
      type: 'mixed',
      priceNote: 'Claude 2.5x / Codex 0.5x，另有订阅套餐',
      paygoNote: 'Claude Sonnet ¥7.5/M · Codex ¥0.875/M',
      plans: [
        { name: 'Cube',      price: '¥238/月', note: '$35/5h + $100/周额度' },
        { name: 'Prism',     price: '¥468/月', note: '$80/5h + $200/周额度' },
        { name: 'Tesseract', price: '¥738/月', note: '$120/5h + $375/周额度' },
      ],
    },
    accessType: 'direct',
    keyModels: ['Claude Sonnet 4.6', 'Claude Opus 4.6', 'GPT-5.4', 'Gemini 3.1 Pro'],
    paymentMethods: ['支付宝', '微信'],
    since: '2025-01',
    featured: true, sortOrder: 9,
  }),
  makePlatform({
    id: 'timicc',
    name: 'TimiCC',
    description: 'Claude Code + Codex 性价比首选，Claude Sonnet ¥4.5/M，支持开票退款，客服高强度在线',
    website: 'https://timicc.com',
    apiBaseUrl: 'https://timicc.com/v1',
    registerUrl: 'https://timicc.cn/register?ref=YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://timicc.com/dashboard',
    tags: ['国内直连', 'Claude Code', 'Codex', '高性价比', '支持发票', '支持退款'],
    pros: ['Claude Sonnet ¥4.5/M 价格实惠', '支持开票（20元起）', '客服高强度在线', '缓存率 93%+', '导出使用记录'],
    cons: ['仅支持 QQ 邮箱注册', '默认并发限10个', '2026年1月新站'],
    pricing: {
      type: 'postpaid',
      priceNote: 'Claude 1.5x · Codex 0.35x，按量计费',
      paygoNote: 'Claude Sonnet ¥4.5/M · Codex ¥0.612/M',
      freeCredit: '注册可能有试用额度',
    },
    accessType: 'direct',
    keyModels: ['Claude Sonnet 4.6', 'Claude Opus 4.6', 'GPT-5.3-Codex', 'GPT-5.4'],
    paymentMethods: ['支付宝', '微信'],
    since: '2026-01',
    featured: true, sortOrder: 10,
  }),
  makePlatform({
    id: 'aicodemirror',
    name: 'AICodeMirror',
    description: '企业级 Claude Code/Codex/Gemini 中转，积分永不过期，JetBrains+VSCode 双 IDE，支持企业发票',
    website: 'https://www.aicodemirror.com',
    apiBaseUrl: 'https://api.aicodemirror.com/v1',
    registerUrl: 'https://www.aicodemirror.com/register?invitecode=YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://www.aicodemirror.com/dashboard',
    docUrl: 'https://www.aicodemirror.com/docs',
    tags: ['国内直连', 'Claude Code', 'Codex', 'Gemini', 'JetBrains', '支持发票', '额度不过期'],
    pros: ['积分永不过期', 'JetBrains + VSCode 双 IDE 适配', '企业发票合规', '注册送8元额度'],
    cons: ['按量计费，无订阅固定套餐', '人民币计费受汇率影响'],
    pricing: {
      type: 'prepaid',
      priceNote: '充值即得等额人民币额度，积分永不过期',
      freeCredit: '注册送8元永久额度',
      plans: [
        { name: 'PAYGO', price: '¥259',   note: '¥305额度，8.5折，30天有效' },
        { name: 'PRO',   price: '¥559',   note: '¥699额度，8折，30天有效' },
        { name: 'ULTRA', price: '¥1259',  note: '¥1678额度，7.5折，30天有效' },
      ],
    },
    accessType: 'direct',
    keyModels: ['Claude 4.6 Sonnet', 'Claude 4 Opus', 'OpenAI Codex', 'Gemini CLI'],
    paymentMethods: ['支付宝', '微信'],
    since: '2025-06',
    featured: true, sortOrder: 11,
  }),
  makePlatform({
    id: 'tuziapi',
    name: '兔子API',
    description: '300+ 模型聚合，Claude Code/Codex/Gemini 三工具积分通用，价格低至官价 9.56%，无需翻墙永不封号',
    website: 'https://api.tu-zi.com',
    apiBaseUrl: 'https://api.tu-zi.com/v1',
    registerUrl: 'https://api.tu-zi.com/register?invite=YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://api.tu-zi.com/dashboard',
    docUrl: 'https://wiki.tu-zi.com',
    tags: ['国内直连', '300+模型', 'Claude Code', 'Codex', 'Gemini', '三工具积分通用', '永不封号'],
    pros: ['三工具（Claude Code+Codex+Gemini CLI）积分通用', '价格低至官价 9.56%', '国内无需翻墙', '注册送 $0.1', '支持发票（¥200起）'],
    cons: ['CC 专用站 2026-04-10 极新', '稳定性有待验证', '定价需注册后查看'],
    pricing: {
      type: 'postpaid',
      priceNote: 'API 站低至官价 9.56% · 充 $1=¥0.7',
      paygoNote: '价格低至官方 9.56%',
      freeCredit: '注册送 $0.1 试用额度',
    },
    accessType: 'direct',
    keyModels: ['Claude Code', 'Codex', 'Gemini CLI', 'GPT-4o', 'DeepSeek-V3'],
    paymentMethods: ['支付宝', '微信'],
    since: '2024-06',
    featured: false, sortOrder: 12,
  }),
  makePlatform({
    id: 'weelinking',
    name: 'Weelinking',
    description: '200+ 全球大模型聚合，一个 API 密钥全调用，统一接口接入 Claude/GPT/Gemini，国内直连',
    website: 'https://weelinking.com',
    apiBaseUrl: 'https://api.weelinking.com/v1',
    registerUrl: 'https://api.weelinking.com/register?aff=YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://weelinking.com/dashboard',
    tags: ['国内直连', '200+模型', 'Claude', 'GPT', 'Gemini', 'Codex', '统一密钥'],
    pros: ['200+ 模型统一接入', '一个密钥管理所有模型', '国内直连', '注册送额度'],
    cons: ['倍率浮动', '非开源', '价格非最低'],
    pricing: { type: 'postpaid', priceNote: '按量计费，聚合平台浮动倍率', freeCredit: '注册送额度' },
    accessType: 'direct',
    keyModels: ['Claude 4.6 Sonnet', 'Claude 4.6 Opus', 'GPT-5', 'Gemini', 'Codex'],
    paymentMethods: ['信用卡'],
    since: '2024-08',
    featured: false, sortOrder: 13,
  }),
  makePlatform({
    id: 'ctokai',
    name: 'CTok.ai',
    description: '极速稳定 AI API 中转，支持 Claude/OpenAI/Gemini/DeepSeek 多模型，国内直连',
    website: 'https://ctok.ai',
    apiBaseUrl: 'https://api.ctok.ai/v1',
    registerUrl: 'https://ctok.ai/register?invite=YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://ctok.ai/dashboard',
    tags: ['国内直连', 'Claude Code', 'Codex', 'Gemini', 'DeepSeek', '极速'],
    pros: ['极速稳定', '多模型覆盖', '国内直连', '管理面板完善'],
    cons: ['平台较新', '定价待确认'],
    pricing: { type: 'postpaid', priceNote: '按量计费，具体倍率请查看官网' },
    accessType: 'direct',
    keyModels: ['Claude Code', 'OpenAI Codex', 'Gemini CLI', 'DeepSeek'],
    paymentMethods: ['支付宝', '微信'],
    since: '2025-06',
    featured: false, sortOrder: 14,
  }),
  // ── 综合通用中转站（海外）──────────────────────────────────
  makePlatform({
    id: 'groq',
    name: 'Groq',
    description: 'LPU 推理芯片，推理速度全球最快（>800 tokens/s），开源模型免费额度极慷慨',
    website: 'https://groq.com',
    apiBaseUrl: 'https://api.groq.com/openai/v1',
    registerUrl: 'https://console.groq.com',
    inviteCode: '',
    dashboardUrl: 'https://console.groq.com/keys',
    docUrl: 'https://console.groq.com/docs',
    tags: ['海外', '超快速度', '免费额度', 'Llama', 'DeepSeek R1', '开源模型'],
    pros: ['推理速度全球最快（>800 tokens/s）', '每日免费配额极慷慨', '稳定性高', 'OpenAI 格式兼容'],
    cons: ['国内需代理', '仅开源模型，不支持 GPT/Claude'],
    pricing: { type: 'postpaid', priceNote: '慷慨的每日免费配额，用完按量极低价', freeCredit: '每日免费配额' },
    accessType: 'proxy',
    keyModels: ['Llama 3.3 70B', 'DeepSeek R1 Distill 70B', 'Mixtral 8x7B', 'Gemma2 9B'],
    paymentMethods: ['信用卡'],
    since: '2024-02',
    featured: false, sortOrder: 15,
  }),
  makePlatform({
    id: 'together',
    name: 'Together AI',
    description: '100+ 开源模型聚合，注册送 $25 额度，支持模型微调，开发者和研究者首选',
    website: 'https://together.ai',
    apiBaseUrl: 'https://api.together.xyz/v1',
    registerUrl: 'https://api.together.ai/signup?referral=YOUR_CODE',
    inviteCode: '',
    dashboardUrl: 'https://api.together.ai/settings/api-keys',
    docUrl: 'https://docs.together.ai',
    tags: ['海外', '100+开源模型', '支持微调', 'Llama', 'DeepSeek', '注册送$25'],
    pros: ['开源模型覆盖极全', '支持模型微调 Fine-tuning', '注册赠送 $25 额度', '价格极低'],
    cons: ['国内需代理', '不支持 GPT/Claude 等闭源模型'],
    pricing: { type: 'postpaid', priceNote: '按量计费，开源模型价格极低', freeCredit: '注册赠送 $25 额度' },
    accessType: 'proxy',
    keyModels: ['Llama 3.1 405B', 'DeepSeek V3', 'Qwen2.5 72B', 'Mistral 7B'],
    paymentMethods: ['信用卡'],
    since: '2023-06',
    featured: false, sortOrder: 16,
  }),
  makePlatform({
    id: 'chatanywhere',
    name: 'ChatAnyWhere',
    description: '开源免费 GPT-3.5 中转项目，无需信用卡，适合个人学习测试使用',
    website: 'https://github.com/chatanywhere/GPT_API_free',
    apiBaseUrl: 'https://api.chatanywhere.tech/v1',
    registerUrl: 'https://api.chatanywhere.org/',
    inviteCode: '',
    dashboardUrl: 'https://api.chatanywhere.org/',
    tags: ['免费', '开源', 'GPT-3.5', '学习测试'],
    pros: ['完全免费', '无需信用卡', '开源透明可审计', '兼容 OpenAI 格式'],
    cons: ['仅 GPT-3.5', '速率严格限制（3次/分钟）', '不适合生产环境'],
    pricing: { type: 'free', priceNote: '永久免费，每分钟限 3 次请求', freeCredit: '永久免费（GPT-3.5）' },
    accessType: 'both',
    keyModels: ['gpt-3.5-turbo'],
    paymentMethods: [],
    since: '2023-04',
    featured: false, sortOrder: 17,
  }),
]

function ensureDataDir() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function readDB(): DB {
  ensureDataDir()
  if (!fs.existsSync(DB_PATH)) {
    const initial: DB = { platforms: INITIAL_PLATFORMS, clicks: [] }
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2))
    return initial
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as DB
  } catch {
    console.warn('[db] db.json 损坏，重置为初始数据')
    const initial: DB = { platforms: INITIAL_PLATFORMS, clicks: [] }
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2))
    return initial
  }
}

export function writeDB(db: DB): void {
  ensureDataDir()
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

export function getPlatforms(): Platform[] {
  return readDB().platforms.sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getPlatformById(id: string): Platform | undefined {
  return readDB().platforms.find(p => p.id === id)
}

export function upsertPlatform(platform: Platform): void {
  const db = readDB()
  const idx = db.platforms.findIndex(p => p.id === platform.id)
  if (idx >= 0) {
    db.platforms[idx] = platform
  } else {
    db.platforms.push(platform)
  }
  writeDB(db)
}

export function updatePlatformStatus(id: string, status: Platform['status'], latency?: number, models?: string[]) {
  const db = readDB()
  const p = db.platforms.find(p => p.id === id)
  if (p) {
    p.status = status
    p.lastChecked = new Date().toISOString()
    if (latency !== undefined) p.latency = latency
    if (models !== undefined) p.models = models
    p.updatedAt = new Date().toISOString()
  }
  writeDB(db)
}

export function recordClick(platformId: string, userAgent?: string): void {
  const db = readDB()
  const p = db.platforms.find(p => p.id === platformId)
  if (p) p.clickCount++
  db.clicks.push({
    id: `click_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    platformId,
    timestamp: new Date().toISOString(),
    userAgent,
  })
  writeDB(db)
}

export function deletePlatform(id: string): void {
  const db = readDB()
  db.platforms = db.platforms.filter(p => p.id !== id)
  writeDB(db)
}
