import axios from 'axios'
import cron from 'node-cron'
import { getPlatforms, updatePlatformStatus } from './db'
import type { Platform } from './types'

const TIMEOUT_MS = 8000

interface CheckResult {
  id: string
  status: Platform['status']
  latency: number
  models?: string[]
}

async function checkPlatform(id: string, apiBaseUrl: string): Promise<CheckResult> {
  const start = Date.now()
  try {
    const resp = await axios.get(`${apiBaseUrl}/models`, {
      timeout: TIMEOUT_MS,
      validateStatus: (s) => s < 500,
      headers: { Authorization: 'Bearer relay-hub-check' },
    })
    const latency = Date.now() - start
    const status: Platform['status'] = resp.status === 200 || resp.status === 401 || resp.status === 403
      ? 'online' : 'degraded'
    let models: string[] = []
    if (resp.status === 200 && resp.data?.data) {
      models = (resp.data.data as { id: string }[]).map(m => m.id).slice(0, 50)
    }
    console.log(`[checker] ${id} → ${status} (${latency}ms)`)
    return { id, status, latency, models: models.length > 0 ? models : undefined }
  } catch {
    const latency = Date.now() - start
    console.log(`[checker] ${id} → offline (${latency}ms)`)
    return { id, status: 'offline', latency }
  }
}

export async function checkAllPlatforms() {
  const platforms = getPlatforms()
  console.log(`[checker] Checking ${platforms.length} platforms...`)
  const results = await Promise.allSettled(
    platforms.map(p => checkPlatform(p.id, p.apiBaseUrl))
  )
  // 串行写入，避免并发读写导致 JSON 损坏
  for (const r of results) {
    if (r.status === 'fulfilled') {
      const { id, status, latency, models } = r.value
      updatePlatformStatus(id, status, latency, models)
    }
  }
  console.log('[checker] Done.')
}

export function startChecker() {
  // 启动时立即检测一次
  checkAllPlatforms().catch(console.error)
  // 每 5 分钟检测一次
  cron.schedule('*/5 * * * *', () => {
    checkAllPlatforms().catch(console.error)
  })
  console.log('[checker] Scheduled every 5 minutes.')
}
