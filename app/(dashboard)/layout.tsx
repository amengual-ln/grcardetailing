'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile header with hamburger — only shows on mobile */}
        <div className="flex items-center gap-3 p-4 border-b border-[var(--border)] bg-[var(--bg-card)] md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)]"
            aria-label="Abrir menú"
          >
            <Menu size={20} className="text-[var(--text)]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-[var(--red)]">
              <span className="text-white text-xs font-bold">GR</span>
            </div>
            <span className="text-sm font-semibold">GR Car Detailing</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}