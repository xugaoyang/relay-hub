import { Link, useLocation } from 'react-router-dom'
import { Zap, LayoutGrid, GitCompareArrows, Settings } from 'lucide-react'

export function Layout({ children }: { children: React.ReactNode }) {
  const loc = useLocation()
  const nav = [
    { to: '/', label: '平台列表', icon: <LayoutGrid size={15} /> },
    { to: '/compare', label: '对比分析', icon: <GitCompareArrows size={15} /> },
    { to: '/admin', label: '管理后台', icon: <Settings size={15} /> },
  ]
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0a0c10]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">RelayHub</span>
            <span className="text-slate-500 text-sm hidden sm:block">· AI 中转站聚合</span>
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map(n => (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  loc.pathname === n.to
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {n.icon}
                <span className="hidden sm:block">{n.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>
      <footer className="border-t border-slate-800 py-4 text-center text-slate-600 text-xs">
        RelayHub · AI 中转站聚合导航 · 数据每 5 分钟自动更新
      </footer>
    </div>
  )
}
