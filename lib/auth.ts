import { createNeonAuth } from '@neondatabase/auth/next/server'

const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET || 'traitlinkr-local-development-cookie-secret-32'

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: cookieSecret,
    sessionDataTtl: 300,
  },
})

export async function getSession() {
  const result = await auth.getSession({ query: { disableCookieCache: 'true' } })
  return result.data ?? null
}
