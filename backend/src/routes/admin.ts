import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { getPlatforms, getPlatformById, upsertPlatform, deletePlatform, readDB, replaceDB } from '../db'
import type { DB, Platform } from '../types'

const router = Router()

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'relay-hub-admin-2026'

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-admin-token'] || req.query.token
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return next()
}

router.use(authMiddleware)

// GET /api/admin/platforms
router.get('/platforms', (_req, res) => {
  res.json(getPlatforms())
})

// POST /api/admin/platforms
router.post('/platforms', (req, res) => {
  const body = req.body as Partial<Platform>
  if (!body.name || !body.apiBaseUrl) {
    return res.status(400).json({ error: 'name and apiBaseUrl are required' })
  }
  const now = new Date().toISOString()
  const platforms = getPlatforms()
  const maxOrder = platforms.reduce((m, p) => Math.max(m, p.sortOrder), 0)
  const platform: Platform = {
    id: body.id || body.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: body.name,
    description: body.description || '',
    website: body.website || '',
    apiBaseUrl: body.apiBaseUrl,
    registerUrl: body.registerUrl || '',
    inviteCode: body.inviteCode || '',
    dashboardUrl: body.dashboardUrl || '',
    docUrl: body.docUrl || '',
    tags: body.tags || [],
    pros: body.pros || [],
    cons: body.cons || [],
    pricing: body.pricing || { type: 'prepaid', priceNote: '' },
    accessType: body.accessType || 'direct',
    keyModels: body.keyModels || [],
    paymentMethods: body.paymentMethods || [],
    since: body.since || '',
    featured: body.featured ?? false,
    sortOrder: body.sortOrder ?? maxOrder + 1,
    status: 'unknown',
    models: [],
    clickCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  upsertPlatform(platform)
  return res.status(201).json(platform)
})

// PUT /api/admin/platforms/:id
router.put('/platforms/:id', (req, res) => {
  const existing = getPlatformById(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Not found' })
  const updated: Platform = {
    ...existing,
    ...(req.body as Partial<Platform>),
    id: existing.id,
    status: existing.status,
    models: existing.models,
    clickCount: existing.clickCount,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  }
  upsertPlatform(updated)
  return res.json(updated)
})

// DELETE /api/admin/platforms/:id
router.delete('/platforms/:id', (req, res) => {
  const existing = getPlatformById(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Not found' })
  deletePlatform(req.params.id)
  return res.json({ ok: true })
})

// GET /api/admin/export —— 下载完整 db.json 备份
router.get('/export', (_req, res) => {
  const db = readDB()
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="relay-hub-db-${Date.now()}.json"`)
  res.send(JSON.stringify(db, null, 2))
})

// POST /api/admin/import?confirm=yes —— 全量覆盖 db.json（自动备份当前版本）
router.post('/import', (req, res) => {
  if (req.query.confirm !== 'yes') {
    return res.status(400).json({ error: 'append ?confirm=yes to overwrite the database' })
  }
  const body = req.body as Partial<DB>
  if (!body || !Array.isArray(body.platforms) || !Array.isArray(body.clicks)) {
    return res.status(400).json({ error: 'invalid db payload: expect { platforms: [], clicks: [] }' })
  }
  try {
    replaceDB(body as DB)
    return res.json({ ok: true, platforms: body.platforms.length, clicks: body.clicks.length })
  } catch (e) {
    return res.status(400).json({ error: (e as Error).message })
  }
})

// GET /api/admin/stats
router.get('/stats', (_req, res) => {
  const db = readDB()
  const platforms = db.platforms
  const clicks = db.clicks
  const totalClicks = platforms.reduce((s, p) => s + p.clickCount, 0)
  const onlineCount = platforms.filter(p => p.status === 'online').length
  const last7days = clicks.filter(c => {
    const d = new Date(c.timestamp)
    const ago = new Date(Date.now() - 7 * 24 * 3600 * 1000)
    return d >= ago
  })
  const byPlatform = platforms.map(p => ({
    id: p.id,
    name: p.name,
    clickCount: p.clickCount,
    status: p.status,
    latency: p.latency,
  })).sort((a, b) => b.clickCount - a.clickCount)

  res.json({ totalClicks, onlineCount, totalPlatforms: platforms.length, last7daysClicks: last7days.length, byPlatform })
})

export default router
