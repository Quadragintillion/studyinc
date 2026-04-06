import { isLoggedIn, getValidAccessToken } from './amethyst'
import { useSavedataStore } from '@/stores/savedata'

const BASE = '/api/save/v1'

export async function downloadSavedata(toolId: number): Promise<Record<string, string> | null> {
  if (!isLoggedIn()) return null
  try {
    const token = await getValidAccessToken()
    const res = await fetch(`${BASE}/${toolId}`, {
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

export async function getSavedata(toolId: number): Promise<Record<string, string> | null> {
  return useSavedataStore().getCached(toolId)
}

export async function setSavedata(toolId: number, data: Record<string, string>): Promise<void> {
  if (!isLoggedIn()) return
  try {
    // Update cache immediately so subsequent reads are consistent
    useSavedataStore().setCached(toolId, data)

    const token = await getValidAccessToken()
    const res = await fetch(`${BASE}/${toolId}`, {
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
