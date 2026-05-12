import { useEffect, useState } from 'react'
import { Plus, Edit3, Trash2, Save, X, RefreshCw, BarChart3 } from 'lucide-react'
import { fetchPlatforms, adminCreatePlatform, adminUpdatePlatform, adminDeletePlatform, adminGetStats } from '../api'
import { StatusBadge } from '../components/StatusDot'
import type { Platform } from '../types'

const emptyForm = (): Partial<Platform> => ({
  name: '', description: '', website: '', apiBaseUrl: '',
  registerUrl: '', inviteCode: '', dashboardUrl: '',
  tags: [], pros: [], cons: [],
  pricing: { type: 'prepaid', priceNote: '' },
  featured: false, sortOrder: 99,
})

function PlatformForm({ initial, onSave, onCancel }: {
  initial: Partial<Platform>
  onSave: (data: Partial<Platform>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<Platform>>(initial)
  const set = (k: keyof Platform, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
  const labelCls = "block text-xs text-slate-400 mb-1"

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>平台名称 *</label><input className={inputCls} value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="AiHubMix" /></div>
        <div><label className={labelCls}>官网地址</label><input className={inputCls} value={form.website || ''} onChange={e => set('website', e.target.value)} placeholder="https://example.com" /></div>
        <div className="sm:col-span-2"><label className={labelCls}>简介</label><textarea className={inputCls + ' resize-none'} rows={2} value={form.description || ''} onChange={e => set('description', e.target.value)} /></div>
        <div><label className={labelCls}>API Base URL *</label><input className={inputCls} value={form.apiBaseUrl || ''} onChange={e => set('apiBaseUrl', e.target.value)} placeholder="https://api.example.com/v1" /></div>
        <div><label className={labelCls}>注册 URL（含邀请码位置）</label><input className={inputCls} value={form.registerUrl || ''} onChange={e => set('registerUrl', e.target.value)} placeholder="https://example.com/register?aff=YOUR_CODE" /></div>
        <div><label className={labelCls}>我的邀请码</label><input className={inputCls} value={form.inviteCode || ''} onChange={e => set('inviteCode', e.target.value)} placeholder="MYCODE123" /></div>
        <div><label className={labelCls}>后台链接（查看奖励）</label><input className={inputCls} value={form.dashboardUrl || ''} onChange={e => set('dashboardUrl', e.target.value)} placeholder="https://example.com/dashboard" /></div>
        <div><label className={labelCls}>标签（逗号分隔）</label><input className={inputCls} value={(form.tags || []).join(', ')} onChange={e => set('tags', e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean))} placeholder="国内直连, 按量计费" /></div>
        <div><label className={labelCls}>优势（逗号分隔）</label><input className={inputCls} value={(form.pros || []).join(', ')} onChange={e => set('pros', e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean))} /></div>
        <div><label className={labelCls}>劣势（逗号分隔）</label><input className={inputCls} value={(form.cons || []).join(', ')} onChange={e => set('cons', e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean))} /></div>
        <div>
          <label className={labelCls}>计费方式</label>
          <select className={inputCls} value={form.pricing?.type || 'prepaid'} onChange={e => set('pricing', { ...form.pricing, type: e.target.value })}>
            <option value="prepaid">充值预付</option><option value="postpaid">按量后付</option>
            <option value="free">免费</option><option value="mixed">混合</option>
          </select>
        </div>
        <div><label className={labelCls}>最低充值</label><input className={inputCls} value={form.pricing?.minRecharge || ''} onChange={e => set('pricing', { ...form.pricing, minRecharge: e.target.value })} placeholder="10元" /></div>
        <div><label className={labelCls}>免费额度说明</label><input className={inputCls} value={form.pricing?.freeCredit || ''} onChange={e => set('pricing', { ...form.pricing, freeCredit: e.target.value })} placeholder="注册送5元" /></div>
        <div><label className={labelCls}>价格备注</label><input className={inputCls} value={form.pricing?.priceNote || ''} onChange={e => set('pricing', { ...form.pricing, priceNote: e.target.value })} /></div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured || false} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 rounded accent-indigo-600" />
            <span className="text-sm text-slate-300">推荐平台（首页置顶）</span>
          </label>
        </div>
        <div><label className={labelCls}>排序（数字越小越靠前）</label><input type="number" className={inputCls} value={form.sortOrder || 99} onChange={e => set('sortOrder', parseInt(e.target.value))} /></div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-sm transition-colors"><X size={14} />取消</button>
        <button onClick={() => onSave(form)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"><Save size={14} />保存</button>
      </div>
    </div>
  )
}

export function AdminPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [stats, setStats] = useState<{ totalClicks: number; onlineCount: number; totalPlatforms: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [ps, st] = await Promise.all([fetchPlatforms(), adminGetStats()])
    setPlatforms(ps)
    setStats(st)
  }

  useEffect(() => { load().catch(console.error).finally(() => setLoading(false)) }, [])

  const handleCreate = async (data: Partial<Platform>) => {
    setSaving(true)
    try { await adminCreatePlatform(data); setAdding(false); await load() }
    catch (e) { alert((e as Error).message) }
    finally { setSaving(false) }
  }

  const handleUpdate = async (id: string, data: Partial<Platform>) => {
    setSaving(true)
    try { await adminUpdatePlatform(id, data); setEditingId(null); await load() }
    catch (e) { alert((e as Error).message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确认删除「${name}」？`)) return
    await adminDeletePlatform(id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">管理后台</h1>
          <p className="text-slate-400 text-sm">管理平台列表、邀请码和展示顺序</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => load()} className="p-2 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"><RefreshCw size={15} /></button>
          <button onClick={() => { setAdding(true); setEditingId(null) }} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus size={15} />添加平台</button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: '总平台数', value: stats.totalPlatforms },
            { label: '在线平台', value: stats.onlineCount },
            { label: '总点击量', value: stats.totalClicks },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2"><BarChart3 size={14} className="text-indigo-400" /><span className="text-xs text-slate-500">{s.label}</span></div>
              <div className="text-2xl font-bold text-white mt-1">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">添加新平台</h3>
          <PlatformForm initial={emptyForm()} onSave={handleCreate} onCancel={() => setAdding(false)} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-500">加载中...</div>
      ) : (
        <div className="space-y-3">
          {platforms.map(p => (
            <div key={p.id}>
              {editingId === p.id ? (
                <PlatformForm initial={p} onSave={(data) => handleUpdate(p.id, data)} onCancel={() => setEditingId(null)} />
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{p.name}</span>
                      <StatusBadge status={p.status} />
                      {p.featured && <span className="text-xs bg-amber-900/40 text-amber-300 px-1.5 py-0.5 rounded">推荐</span>}
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>邀请码：<span className="text-slate-300 font-mono">{p.inviteCode || '未设置'}</span></span>
                      <span>点击：{p.clickCount}</span>
                      <span>模型：{p.models.length}</span>
                      <span>排序：{p.sortOrder}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setEditingId(p.id); setAdding(false) }} className="p-2 border border-slate-700 text-slate-400 hover:text-indigo-300 hover:border-indigo-700 rounded-lg transition-colors"><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(p.id, p.name)} className="p-2 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-800 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {saving && <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"><div className="bg-slate-900 border border-slate-700 rounded-xl px-6 py-4 text-slate-200">保存中...</div></div>}
    </div>
  )
}
