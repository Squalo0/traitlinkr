import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AuthCompletePage() {
  const session = await getSession()
  if (!session) redirect('/auth/sign-in')
  redirect('/admin')
}
