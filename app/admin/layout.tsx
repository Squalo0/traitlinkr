import type { ReactNode } from 'react'
import { AppHeader } from '@/components/app-header'
import { AdminNav } from '@/components/admin-nav'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <AdminNav />
        <main className="py-6">{children}</main>
      </div>
    </div>
  )
}
