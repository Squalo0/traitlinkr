import type { ReactNode } from 'react'
import { AppHeader } from '@/components/app-header'

export default function RequestsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</div>
    </div>
  )
}
