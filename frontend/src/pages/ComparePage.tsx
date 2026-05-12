import { useEffect, useState } from 'react'
import { ExternalLink, FileText, Zap } from 'lucide-react'
import { fetchPlatforms, trackClick } from '../api'
import { StatusDot } from '../components/StatusDot'
import type { Platform } from '../types'

type SortKey = 'name' | 'status' | 'latency' | 'since'

const STATUS_ORDER = { online: 0, degraded: 1, unknown: 2, offline: 3 }

const ACCESS_BADGE: Record<string, { label: string; cls: string }> = {
  direct: { label: '国内直连', cls: 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' },
  proxy:  { label: '需要代理', cls: 'text-amber-400 bg-amber-900/30 border-amber-800/50' },
  both:   { label: '均可访问', cls: 'text-sky-400 bg-sky-900/30 border-sky-800/50' },
}

const PRICING_CLS: Record<string, string> = {
  prepaid:  'text-blue-400',
  postpaid: 'text-violet-400',
  free:     'text-emerald-400',
  mixed:    'text-orange-400',
}
const PRICING_LABEL: Record<string, string> = {
  prepaid: '充值制', postpaid: '按量付', free: '免费', mixed: '混合',
}

export function ComparePage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('status')
  const [sortAsc, setSortAsc] = useState(true)
  const [filterAccess, setFilterAccess] = useState<'all' | 'direct' | 'proxy'>('all')

  useEffect(() => {
    fetchPlatforms().then(setPlatforms).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleRegister = async (p: Platform) => {
    try {
      const { url } = await trackClick(p.id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      window.open(p.registerUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  const sorted = [...platforms]
    .filter(p =>
      filterAccess === 'all' ||
      p.accessType === filterAccess ||
      (filterAccess === 'direct' && p.accessType === 'both')
    )
    .sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name')    cmp = a.name.localeCompare(b.name)
      if (sortKey === 'status')  cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      if (sortKey === 'latency') cmp = (a.latency ?? 99999) - (b.latency ?? 99999)
      if (sortKey === 'since')   cmp = (a.since ?? '').localeCompare(b.since ?? '')
      return sortAsc ? cmp : -cmp
    })

  const SortBtn = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      onClick={() => handleSort(k)}
      className="flex items-center gap-0.5 text-xs text-slate-400 hover:text-white transition-colors select-none whitespace-nowrap"
    >
      {label}
      <span className="text-slate-600 ml-0.5">{sortKey === k ? (sortAsc ? '↑' : '↓') : '↕'}</span>
    </button>
  )

  return (
    <div>
      {/* 页头 */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white mb-1">平台横向对比</h1>
        <p className="text-slate-400 text-sm mb-3">
          点击列头排序 · 展示按量定价与订阅套餐
        </p>
        <div className="flex gap-2 flex-wrap items-center">
          {(['all', 'direct', 'proxy'] as const).map(v => (
            <button
              key={v}
              onClick={() => setFilterAccess(v)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                filterAccess === v
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {{ all: '全部', direct: '国内直连', proxy: '需代理' }[v]}
            </button>
          ))}
          <span className="text-xs text-slate-600 ml-1">{sorted.length} 个平台</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <p>加载中...</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '18%' }} />  {/* 平台 */}
              <col style={{ width: '10%' }} />  {/* 状态 */}
              <col style={{ width: '22%' }} />  {/* 主打模型 */}
              <col style={{ width: '24%' }} />  {/* 价格方案 */}
              <col style={{ width: '16%' }} />  {/* 免费 & 支付 */}
              <col style={{ width: '10%' }} />  {/* 操作 */}
            </colgroup>
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="text-left py-3 px-4">
                  <SortBtn label="平台" k="name" />
                </th>
                <th className="text-left py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <SortBtn label="状态" k="status" />
                    <SortBtn label="延迟" k="latency" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-semibold">主打模型</th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-semibold">价格方案</th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-semibold">免费额度 &amp; 支付</th>
                <th className="text-left py-3 px-4 text-xs text-slate-400 font-semibold">注册</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => {
                const access   = ACCESS_BADGE[p.accessType] ?? ACCESS_BADGE.both
                const priceCls = PRICING_CLS[p.pricing.type] ?? PRICING_CLS.mixed
                const hasPlans = (p.pricing.plans ?? []).length > 0

                return (
                  <tr
                    key={p.id}
                    className={`border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors align-top ${
                      i % 2 === 0 ? '' : 'bg-slate-900/20'
                    }`}
                  >
                    {/* ① 平台 */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-sm leading-tight mb-1.5">
                        {p.name}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${access.cls}`}>
                          {access.label}
                        </span>
                        {p.since && (
                          <span className="text-[10px] text-slate-600">{p.since}</span>
                        )}
                      </div>
                    </td>

                    {/* ② 状态 + 延迟 */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <StatusDot status={p.status} />
                        <span className="text-xs text-slate-300">
                          {{ online: '正常', degraded: '降级', offline: '离线', unknown: '未知' }[p.status]}
                        </span>
                      </div>
                      {p.latency ? (
                        <span className={`text-xs font-mono ${
                          p.latency < 500 ? 'text-emerald-400' :
                          p.latency < 1500 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {p.latency}ms
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">-</span>
                      )}
                    </td>

                    {/* ③ 主打模型 */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(p.keyModels ?? []).slice(0, 5).map(m => (
                          <span
                            key={m}
                            className="text-[10px] bg-indigo-950/60 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/40 leading-tight"
                          >
                            {m}
                          </span>
                        ))}
                        {(p.keyModels ?? []).length > 5 && (
                          <span className="text-[10px] text-slate-500">
                            +{p.keyModels.length - 5}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* ④ 价格方案（按量 + 套餐合并） */}
                    <td className="py-3.5 px-4">
                      {/* 计费类型 + 按量价格 */}
                      <div className="mb-1.5">
                        <span className={`text-[10px] font-semibold mr-1.5 ${priceCls}`}>
                          {PRICING_LABEL[p.pricing.type]}
                        </span>
                        {p.pricing.paygoNote && (
                          <span className="text-xs text-slate-300">{p.pricing.paygoNote}</span>
                        )}
                        {p.pricing.type === 'free' && !p.pricing.paygoNote && (
                          <span className="text-xs text-emerald-400">完全免费</span>
                        )}
                      </div>
                      {/* 订阅套餐 */}
                      {hasPlans && (
                        <div className="flex flex-wrap gap-1">
                          {p.pricing.plans!.map(plan => (
                            <div
                              key={plan.name}
                              className="flex items-center gap-1 bg-slate-800/70 border border-slate-700/60 rounded px-1.5 py-0.5"
                            >
                              <span className="text-[9px] text-slate-400">{plan.name}</span>
                              <span className="text-[10px] text-amber-300 font-semibold">{plan.price}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* ⑤ 免费额度 + 支付方式 */}
                    <td className="py-3.5 px-4">
                      {p.pricing.freeCredit && (
                        <div className="text-[11px] text-emerald-400 mb-1.5 leading-tight">
                          {p.pricing.freeCredit}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {(p.paymentMethods ?? []).map(m => (
                          <span
                            key={m}
                            className="text-[9px] bg-slate-800/80 text-slate-500 px-1 py-0.5 rounded border border-slate-700/50"
                          >
                            {m}
                          </span>
                        ))}
                        {(p.paymentMethods ?? []).length === 0 && (
                          <span className="text-xs text-slate-600">-</span>
                        )}
                      </div>
                    </td>

                    {/* ⑥ 操作 */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => handleRegister(p)}
                          className="flex items-center justify-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors font-medium w-full"
                        >
                          <Zap size={11} />
                          注册
                        </button>
                        {p.docUrl && (
                          <a
                            href={p.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 text-xs border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 px-2 py-1.5 rounded-lg transition-colors w-full"
                          >
                            <FileText size={11} />
                            文档
                          </a>
                        )}
                        {p.website && (
                          <a
                            href={p.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
                          >
                            <ExternalLink size={10} />
                            官网
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[11px] text-slate-600 text-center">
        价格与套餐仅供参考，以各平台官网最新公告为准 · 状态延迟每5分钟自动更新
      </p>
    </div>
  )
}
