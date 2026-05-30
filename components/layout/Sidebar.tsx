'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Users, Settings, Car, Wrench, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/agenda',    label: 'Agenda',    icon: Calendar },
  { href: '/clientes',  label: 'Clientes', icon: Users    },
  { href: '/servicios', label: 'Servicios', icon: Wrench  },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const path = usePathname()

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'w-52 shrink-0 flex flex-col h-screen sticky top-0 z-50',
          'bg-[var(--bg-card)] border-r border-[var(--border)]',
          'transition-transform duration-200',
          mobileOpen ? 'translate-x-0 fixed inset-y-0 left-0' : '-translate-x-full fixed inset-y-0 left-0 md:translate-x-0 md:static md:inset-auto'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--red)]">
              <Car size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-none">GR Car Detailing</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">Panel Admin</div>
            </div>
          </div>
          <button onClick={onMobileClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] md:hidden">
            <X size={16} className="text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-2 flex flex-col gap-0.5 flex-1">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest px-2 py-2">Menú</p>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                path.startsWith(href)
                  ? 'font-medium'
                  : 'hover:bg-[var(--bg-hover)]'
              )}
              style={path.startsWith(href) ? {
                color: 'var(--red)',
                background: 'var(--red-light)',
              } : {
                color: 'var(--text-muted)',
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border)]">
          <Link
            href="/servicios"
            onClick={onMobileClose}
            className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-all hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <Settings size={13} />
            Configuración
          </Link>
        </div>
      </aside>
    </>
  )
}