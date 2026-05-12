import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, ChevronRight, Zap, Shield, TrendingUp, Search, Star } from 'lucide-react'
import { fetchPlatforms, trackClick } from '../api'
import { StatusBadge } from '../components/StatusDot'
import type { Platform } from '../types'

const ACCESS_LABEL: Record<string, { label: string; cls: string }> = {
  direct: { label: '国内直连', cls: 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50' },
  proxy:  { label: '需要代理', cls: 'text-amber-400 bg-amber-900/30 border-amber-800/50' },
  both:   { label: '均可访问', cls: 'text-sky-400 bg-sky-900/30 border-sky-800/50' },
}

const PRICING_LABEL: Record<string, string> = {
  prepaid: '充值预付', postpaid: '按量后付', free: '完全免费', mixed: '混合计费',
}

function PlatformCard({ p }: { p: Platform }) {
  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const { url } = await trackClick(p.id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      window.open(p.registerUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const access = ACCESS_LABEL[p.accessType] ?? ACCESS_LABEL.both

  return (
    <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-700/60 hover:bg-slate-800/60 transition-all flex flex-col">
      {p.featured && (
        <div className="absolute top-3 right-3">
          <Star size={14} className="text-amber-400 fill-amber-400" />
        </div>
      )}

      {/* 标题行 */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-900/40 border border-indigo-800/40 flex items-center justify-center shrink-0 text-indigo-400 font-bold text-sm">
          {p.name.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-white text-sm">{p.name}</h3>
            <StatusBadge status={p.status} />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${access.cls}`}>{access.label}</span>
            {p.latency && (
              <span className={`text-[10px] ${p.latency < 500 ? 'text-emerald-400' : p.latency < 1500 ? 'text-amber-400' : 'text-red-400'}`}>
                {p.latency}ms
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 描述 */}
      <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{p.description}</p>

      {/* 主打模型 */}
      {p.keyModels && p.keyModels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {p.keyModels.slice(0, 4).map(m => (
            <span key={m} className="text-[10px] bg-indigo-950/60 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/40">{m}</span>
          ))}
          {p.keyModels.length > 4 && (
            <span className="text-[10px] text-slate-500">+{p.keyModels.length - 4}</span>
          )}
        </div>
      )}

      {/* 计费信息 */}
      <div className="text-xs text-slate-500 mb-4 space-y-0.5">
        <div>
          <span className="text-indigo-400 font-medium">{PRICING_LABEL[p.pricing.type]}</span>
          {p.pricing.minRecharge && <span> · 起充 {p.pricing.minRecharge}</span>}
        </div>
        {p.pricing.freeCredit && (
          <div className="text-emerald-500">{p.pricing.freeCredit}</div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={handleRegister}
          className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium py-2 rounded-lg transition-colors"
        >
          <Zap size={12} />注册领取福利
        </button>
        <Link
          to={`/platform/${p.id}`}
          className="p-2 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
        >
          <ChevronRight size={14} />
        </Link>
      </div>

      {p.clickCount > 0 && (
        <div className="mt-2 text-center text-[10px] text-slate-600">{p.clickCount} 次点击</div>
      )}
    </div>
  )
}

export function HomePage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'online' | 'featured'>('all')

  useEffect(() => {
    fetchPlatforms().then(setPlatforms).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = platforms.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.includes(search)) || p.description.includes(search)
    const matchFilter = filter === 'all' || (filter === 'online' && p.status === 'online') || (filter === 'featured' && p.featured)
    return matchSearch && matchFilter
  })

  const online = platforms.filter(p => p.status === 'online').length
  const total = platforms.length

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">AI 中转站聚合导航</h1>
        <p className="text-slate-400 mb-6">聚合 {total} 个主流 AI API 中转站，实时监控可用性，一键注册带邀请码</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Shield size={16} className="text-emerald-400" />, label: '实时在线', value: `${online}/${total}`, sub: '每5分钟更新', color: 'border-emerald-800/30 bg-emerald-900/10' },
            { icon: <TrendingUp size={16} className="text-indigo-400" />, label: '支持模型', value: `${platforms.reduce((s, p) => s + p.models.length, 0)}+`, sub: '自动检测', color: 'border-indigo-800/30 bg-indigo-900/10' },
            { icon: <Zap size={16} className="text-amber-400" />, label: '邀请点击', value: `${platforms.reduce((s, p) => s + p.clickCount, 0)}`, sub: '累计跳转', color: 'border-amber-800/30 bg-amber-900/10' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 flex items-center gap-3 ${s.color}`}>
              {s.icon}
              <div>
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="搜索平台名称、标签..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'online', 'featured'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'border border-slate-700 text-slate-400 hover:text-slate-200'}`}
              >
                {{ all: '全部', online: '在线', featured: '推荐' }[f]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <p>正在加载平台数据...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Search size={32} className="mx-auto mb-3 opacity-30" />
          <p>没有找到匹配的平台</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => <PlatformCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  )
}
