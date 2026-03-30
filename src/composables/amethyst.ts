const BASE = '/api/accs/v1'

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]!) : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? body?.message ?? `HTTP ${res.status}`)
  }
  return res.json()
}

// Token management

export function saveTokens(accessToken: string, refreshToken: string) {
  setCookie('amethyst_access', accessToken, 0.5 / 24) // 30 min
  setCookie('amethyst_refresh', refreshToken, 90)
}

export function getAccessToken(): Record<string, unknown> | null {
  const token = getCookie('amethyst_access')
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1]!))
  } catch {
    return null
  }
}

export function getRefreshToken(): string | null {
  return getCookie('amethyst_refresh')
}

export function clearTokens() {
  deleteCookie('amethyst_access')
  deleteCookie('amethyst_refresh')
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const data = await apiFetch<{ token: string }>('/refresh', {
    headers: { Authorization: `Bearer ${refreshToken}` },
  })

  setCookie('amethyst_access', data.token, 0.5 / 24)
  return data.token
}

// Returns a valid access token string, refreshing if necessary.
export async function getValidAccessToken(): Promise<string> {
  const access = getCookie('amethyst_access')
  if (access) return access
  return await refreshAccessToken()
}

// Adobe auth flow

export async function getAdobeAuthContext(): Promise<{ token: string; uuid: string }> {
  const data = await apiFetch<{ token: string }>('/authModules/adobe')
  // Decode the JWT payload to extract the uuid (sub claim)
  const payload = JSON.parse(atob(data.token.split('.')[1]!))
  return { token: data.token, uuid: payload.sub as string }
}

export async function verifyAdobeAvatar(
  contextToken: string,
  avatarUrl: string,
): Promise<string> {
  const data = await apiFetch<{ token: string }>('/authModules/adobe', {
    method: 'POST',
    headers: { Authorization: `Bearer ${contextToken}` },
    body: JSON.stringify({ avatarUrl }),
  })
  return data.token
}

export async function completeAdobeAuth(contextToken: string, avatarUrl: string) {
  const refreshToken = await verifyAdobeAvatar(contextToken, avatarUrl)
  const accessToken = await apiFetch<{ token: string }>('/refresh', {
    headers: { Authorization: `Bearer ${refreshToken}` },
  })
  saveTokens(accessToken.token, refreshToken)
}

// Password auth flow

export async function registerWithPassword(username: string, password: string) {
  const data = await apiFetch<{ token: string }>('/authModules/password/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  const refreshToken = data.token
  const accessData = await apiFetch<{ token: string }>('/refresh', {
    headers: { Authorization: `Bearer ${refreshToken}` },
  })
  saveTokens(accessData.token, refreshToken)
}

export async function loginWithPassword(username: string, password: string) {
  const data = await apiFetch<{ token: string }>('/authModules/password/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  const refreshToken = data.token
  const accessData = await apiFetch<{ token: string }>('/refresh', {
    headers: { Authorization: `Bearer ${refreshToken}` },
  })
  saveTokens(accessData.token, refreshToken)
}

// Add password login as a login method
export async function addPasswordMethod(username: string, password: string) {
  const token = await getValidAccessToken()
  await apiFetch('/authModules/password/add', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ username, password }),
  })
}

// Abstract checking utils

export function isLoggedIn(): boolean {
  return getCookie('amethyst_access') !== null || getRefreshToken() !== null
}

export function isVerified(): boolean {
  return getAccessToken()?.verified === true
}
