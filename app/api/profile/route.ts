import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const role = body.role === 'requester' ? 'requester' : 'breeder'
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : null
  await sql`
    INSERT INTO profiles (id, role, name)
    VALUES (${session.user.id}, ${role}, ${name})
    ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name
  `
  return NextResponse.json({ ok: true })
}
