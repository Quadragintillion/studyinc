import { isLoggedIn, getValidAccessToken } from './amethyst'

const BASE = '/api/save'

export async function getSavedata(gameId: number): Promise<Record<string, string> | null> {
  if (!isLoggedIn()) return null
  try {
    const token = await getValidAccessToken()
    const res = await fetch(`${BASE}/${gameId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = await res.json()
    return body.data ?? null
  } catch (err) {
    console.warn('[savedata] getSavedata failed:', err)
    return null
  }
}

export async function setSavedata(gameId: number, data: Record<string, string>): Promise<void> {
  if (!isLoggedIn()) return
  try {
    const token = await getValidAccessToken()
    const res = await fetch(`${BASE}/${gameId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    })
    if (res.status === 413) {
      console.warn('[savedata] save rejected: payload too large')
      return
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch (err) {
    console.warn('[savedata] setSavedata failed:', err)
  }
}
