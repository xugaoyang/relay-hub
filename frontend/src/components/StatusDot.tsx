import type { PlatformStatus } from '../types'

const config: Record<PlatformStatus, { color: string; label: string; pulse: boolean }> = {
  online:   { color: 'bg-emerald-400', label: '正常', pulse: true },
  degraded: { color: 'bg-amber-400',   label: '降级', pulse: false },
  offline:  { color: 'bg-red-500',     label: '离线', pulse: false },
  unknown:  { color: 'bg-slate-500',   label: '检测中', pulse: false },
}

export function StatusDot({ status, showLabel }: { status: PlatformStatus; showLabel?: boolean }) {
  const c = config[status]
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        {c.pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.color} opacity-60`} />}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${c.color}`} />
      </span>
      {showLabel && <span className="text-xs text-slate-400">{c.label}</span>}
    </span>
  )
}

export function StatusBadge({ status }: { status: PlatformStatus }) {
  const cfg: Record<PlatformStatus, string> = {
    online:   'bg-emerald-900/30 text-emerald-300 border-emerald-800/40',
    degraded: 'bg-amber-900/30 text-amber-300 border-amber-800/40',
    offline:  'bg-red-900/30 text-red-300 border-red-800/40',
    unknown:  'bg-slate-800 text-slate-500 border-slate-700',
  }
  const labels: Record<PlatformStatus, string> = { online: '正常', degraded: '降级', offline: '离线', unknown: '检测中' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${cfg[status]}`}>
      <StatusDot status={status} />
      {labels[status]}
    </span>
  )
}
