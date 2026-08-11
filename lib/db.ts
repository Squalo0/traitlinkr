import { neon } from '@neondatabase/serverless'

// Single shared SQL client. TraitLinkr uses tagged-template SQL, which
// automatically parameterizes interpolated values to prevent injection.
// Keep client creation lazy-safe during Next.js build analysis, where project
// environment variables are not injected into the build subprocess.
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

export const sql = databaseUrl
  ? neon(databaseUrl)
  : ((() => {
      throw new Error('DATABASE_URL is required to query TraitLinkr data')
    }) as unknown as ReturnType<typeof neon>)
