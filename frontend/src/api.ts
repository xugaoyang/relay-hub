import type { Platform } from './types'

const BASE = '/api'

export async function fetchPlatforms(): Promise<Platform[]> {
  const res = await fetch(`${BASE}/platforms`)
  if (!res.ok) throw new Error('Failed to fetch platforms')
  return res.json()
}

export async function fetchPlatform(id: string): Promise<Platform> {
  const res = await fetch(`${BASE}/platforms/${id}`)
  if (!res.ok) throw new Error('Not found')
  return res.json()
}

export async function trackClick(id: string): Promise<{ url: string }> {
  const res = await fetch(`${BASE}/platforms/${id}/click`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed')
  return res.json()
}

const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || 'relay-hub-admin-2026'
const adminHeaders = () => ({ 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN })

export async function adminGetStats() {
  const res = await fetch(`${BASE}/admin/stats`, { headers: adminHeaders() })
  return res.json()
}

export async function adminCreatePlatform(data: Partial<Platform>): Promise<Platform> {
  const res = await fetch(`${BASE}/admin/platforms`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function adminUpdatePlatform(id: string, data: Partial<Platform>): Promise<Platform> {
  const res = await fetch(`${BASE}/admin/platforms/${id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function adminDeletePlatform(id: string): Promise<void> {
  await fetch(`${BASE}/admin/platforms/${id}`, { method: 'DELETE', headers: adminHeaders() })
}
