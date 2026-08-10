import Link from 'next/link'
import { Sprout } from 'lucide-react'
import { AuthForm } from '@/components/auth-form'

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3 text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground"><Sprout className="h-5 w-5" /></span>
          <span className="font-heading text-xl font-semibold">TraitLinkr</span>
        </Link>
        <AuthForm mode="sign-in" />
      </div>
    </main>
  )
}
