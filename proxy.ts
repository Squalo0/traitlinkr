import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Authentication is checked by the server data layer. Avoid the Neon Auth
// edge middleware here because it cannot read the preview iframe session cookie.
export function proxy(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/requests/:path*'],
}
