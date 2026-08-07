import { neon } from '@neondatabase/serverless'

// Single shared SQL client. TraitLinkr uses tagged-template SQL, which
// automatically parameterizes interpolated values to prevent injection.
export const sql = neon(process.env.DATABASE_URL!)
