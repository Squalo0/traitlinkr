// Lightweight signed-cookie sessions for TraitLinkr's MVP auth.
// No user table, no passwords-per-person — just three shared passcodes
// (breeder / admin / requester) gating three areas of the app. Built with
// Web Crypto so it works in both the Edge middleware and server actions.

export type Role = 'admin' | 'breeder' | 'requester'

export const SESSION_COOKIE_NAME = 'traitlinkr_session'
const SESSION_TTL_SECONDS = 60 * 60 * 8 // 8 hours

export interface SessionPayload {
  role: Role
  exp: number // unix seconds
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error(
      'SESSION_SECRET is not set. Add it to your environment (see README) before logins will work.',
    )
  }
  return secret
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return toBase64Url(new Uint8Array(sig))
}

export async function createSessionToken(role: Role): Promise<string> {
  const payload: SessionPayload = {
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }
  const payloadStr = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
  const sig = await hmac(payloadStr)
  return `${payloadStr}.${sig}`
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null
  const [payloadStr, sig] = token.split('.')
  if (!payloadStr || !sig) return null

  const expectedSig = await hmac(payloadStr)
  if (expectedSig !== sig) return null

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payloadStr)),
    ) as SessionPayload
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    if (!['admin', 'breeder', 'requester'].includes(payload.role)) return null
    return payload
  } catch {
    return null
  }
}

// Where each role should land after logging in, and which path prefix
// their area lives under.
export const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  breeder: '/admin',
  requester: '/requests',
}

export function roleAllowedForPath(role: Role, pathname: string): boolean {
  if (pathname.startsWith('/admin')) return role === 'admin' || role === 'breeder'
  if (pathname.startsWith('/requests')) return role === 'admin' || role === 'requester'
  return true
}

export function passcodeEnvVarFor(role: Role): string {
  return { admin: 'ADMIN_PASSCODE', breeder: 'BREEDER_PASSCODE', requester: 'REQUESTER_PASSCODE' }[
    role
  ]
}

export function checkPasscode(role: Role, submitted: string): boolean {
  const expected = process.env[passcodeEnvVarFor(role)]
  if (!expected) return false
  return submitted === expected
}