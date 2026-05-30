import { cn } from '@/lib/utils'
import { EstadoTurno } from '@/lib/database.types'

const estadoLight: Record<EstadoTurno, string> = {
  pendiente:  'bg-amber-50 text-amber-800 border-amber-200',
  confirmado: 'bg-green-50 text-green-800 border-green-200',
  cancelado:  'bg-red-50 text-red-800 border-red-200',
  completado: 'bg-gray-100 text-gray-600 border-gray-200',
}

const estadoDark: Record<EstadoTurno, string> = {
  pendiente:  'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]',
  confirmado: 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]',
  cancelado:  'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]',
  completado: 'bg-[var(--muted-bg)] text-[var(--muted-text)] border-[var(--muted-border)]',
}

const estadoLabel: Record<EstadoTurno, string> = {
  pendiente:  'Pendiente',
  confirmado: 'Confirmado',
  cancelado:  'Cancelado',
  completado: 'Completado',
}

export function EstadoBadge({ estado }: { estado: EstadoTurno }) {
  return (
    <span className={cn(
      'text-xs font-medium px-2 py-0.5 rounded-full border',
      estadoLight[estado],
      'dark:border-0',
      estadoDark[estado]
    )}>
      {estadoLabel[estado]}
    </span>
  )
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      'text-xs font-medium px-2 py-0.5 rounded-full',
      'bg-[var(--muted-bg)] text-[var(--muted-text)] border border-[var(--muted-border)]',
      'dark:bg-[var(--muted-bg)] dark:text-[var(--muted-text)] dark:border-[var(--muted-border)]',
      className
    )}>
      {children}
    </span>
  )
}