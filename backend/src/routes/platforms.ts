import { Router } from 'express'
import { getPlatforms, getPlatformById, recordClick } from '../db'

const router = Router()

// GET /api/platforms
router.get('/', (_req, res) => {
  const platforms = getPlatforms()
  res.json(platforms)
})

// GET /api/platforms/:id
router.get('/:id', (req, res) => {
  const platform = getPlatformById(req.params.id)
  if (!platform) return res.status(404).json({ error: 'Not found' })
  return res.json(platform)
})

// POST /api/platforms/:id/click  — 记录点击并返回跳转 URL
router.post('/:id/click', (req, res) => {
  const platform = getPlatformById(req.params.id)
  if (!platform) return res.status(404).json({ error: 'Not found' })
  recordClick(platform.id, req.headers['user-agent'])
  const url = platform.inviteCode
    ? platform.registerUrl.replace('YOUR_CODE', platform.inviteCode)
    : platform.registerUrl
  return res.json({ url })
})

export default router
