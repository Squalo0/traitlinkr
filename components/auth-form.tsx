'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'breeder' | 'requester'>('breeder')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)

    try {
      const result = mode === 'sign-in'
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ name, email, password })

      if (result.error) {
        setError(result.error.message || 'Unable to authenticate. Check your details and try again.')
        return
      }

      if (mode === 'sign-up') {
        const profileResponse = await fetch('/api/profile', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ role, name }),
        })
        if (!profileResponse.ok) {
          setError('Your account was created, but your profile could not be saved. Please try again.')
          return
        }
      }

      window.location.assign('/admin')
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      setError(message || 'Unable to reach the authentication service. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
          TraitLinkr access
        </p>
        <CardTitle className="font-heading text-2xl">
          {mode === 'sign-in' ? 'Welcome back' : 'Create your account'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'sign-up' && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
          </div>
          {mode === 'sign-up' && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">I am joining as a</legend>
              <div className="grid grid-cols-2 gap-2">
                {(['breeder', 'requester'] as const).map((option) => (
                  <label key={option} className={`cursor-pointer rounded-md border px-3 py-2 text-sm capitalize transition-colors ${role === option ? 'border-primary bg-secondary text-secondary-foreground' : 'border-border text-muted-foreground'}`}>
                    <input className="sr-only" type="radio" name="role" value={option} checked={role === option} onChange={() => setRole(option)} />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Working…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === 'sign-in' ? 'New to TraitLinkr?' : 'Already have an account?'}{' '}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" href={mode === 'sign-in' ? '/auth/sign-up' : '/auth/sign-in'}>
            {mode === 'sign-in' ? 'Create an account' : 'Sign in'}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
