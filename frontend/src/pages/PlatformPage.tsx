import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, CheckCircle, XCircle, Zap, Clock, Cpu } from 'lucide-react'
import { fetchPlatform, trackClick } from '../api'
import { StatusBadge } from '../components/StatusDot'
import type { Platform } from '../types'

export function PlatformPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [p, setP] = useState<Platform | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchPlatform(id).then(setP).catch(() => navigate('/')).finally(() => setLoading(false))
  }, [id, navigate])

  const handleRegister = async () => {
    if (!p) return
    try {
      const { url } = await trackClick(p.id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      window.open(p.registerUrl, '_blank', 'noopener,noreferrer')
    }
  }

  if (loading) return <div className="text-center py-20 text-slate-500">加载中...</div>
  if (!p) return null

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8 transition-colors">
        <ArrowLeft size={16} /> 返回列表
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-900/40 border border-indigo-800/40 flex items-center justify-center text-indigo-400 font-bold text-lg">
            {p.name.slice(0, 2)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{p.name}</h1>
              <StatusBadge status={p.status} />
            </div>
            <div className="flex flex-wrap gap-1">
              {p.tags.map(t => (
                <span key={t} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700/50">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-6">{p.description}</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: <Clock size={14} className="text-blue-400" />, label: '响应延迟', value: p.latency ? `${p.latency}ms` : '-' },
            { icon: <Cpu size={14} className="text-purple-400" />, label: '支持模型', value: `${p.models.length} 个` },
            { icon: <Zap size={14} className="text-amber-400" />, label: '邀请点击', value: `${p.clickCount} 次` },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">{s.icon}<span className="text-xs text-slate-500">{s.label}</span></div>
              <div className="text-lg font-bold text-white">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRegister}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-colors"
          >
            <Zap size={16} />注册领取福利（带邀请码）
          </button>
          <a
            href={p.website}
            target="_blank"
            rel="noreferrer"
            className="p-3 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
          >
            <ExternalLink size={16} />
          </a>
          {p.dashboardUrl && (
            <a
              href={p.dashboardUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 border border-slate-700 hover:border-indigo-600 text-slate-400 hover:text-indigo-300 rounded-xl text-sm transition-colors"
            >
              查看奖励
            </a>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <CheckCircle size={14} className="text-emerald-400" />优势
          </h3>
          <div className="space-y-2">
            {p.pros.map((pro, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle size={13} className="text-emerald-500/60 shrink-0 mt-0.5" />
                {pro}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <XCircle size={14} className="text-red-400" />劣势
          </h3>
          <div className="space-y-2">
            {p.cons.map((con, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <XCircle size={13} className="text-red-500/60 shrink-0 mt-0.5" />
                {con}
              </div>
            ))}
          </div>
        </div>
      </div>

      {p.models.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Cpu size={14} className="text-purple-400" />支持模型（{p.models.length} 个）
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {p.models.map(m => (
              <span key={m} className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-lg border border-slate-700/50 font-mono">{m}</span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">定价说明</h3>
        <div className="flex flex-wrap gap-3 text-sm text-slate-300">
          <span>计费方式：<span className="text-indigo-300">{{ prepaid: '充值预付', postpaid: '按量后付', free: '免费', mixed: '混合' }[p.pricing.type]}</span></span>
          {p.pricing.minRecharge && <span>最低充值：<span className="text-white">{p.pricing.minRecharge}</span></span>}
          {p.pricing.freeCredit && <span>免费额度：<span className="text-emerald-400">{p.pricing.freeCredit}</span></span>}
        </div>
        <p className="text-xs text-slate-500 mt-2">{p.pricing.priceNote}</p>
      </div>
    </div>
  )
}
