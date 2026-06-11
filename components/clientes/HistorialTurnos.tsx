'use client'

import { X, Calendar, Wrench, Car } from 'lucide-react'
import { EstadoBadge } from '@/components/ui/Badge'
import { TurnoConRelaciones, Cliente } from '@/lib/database.types'
import { formatFecha } from '@/lib/utils'

interface Props {
  cliente: Cliente
  turnos: TurnoConRelaciones[]
  onClose: () => void
}

export function HistorialTurnos({ cliente, turnos, onClose }: Props) {
  const sorted = [...turnos].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora))

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] w-full max-w-md p-6 flex flex-col gap-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center">
          <div>
            <h2 className="text-base font-semibold">Historial de turnos</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{cliente.nombre}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {sorted.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-8">Sin turnos registrados</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map(t => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]"
              >
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-[var(--text-muted)] shrink-0" />
                    <span className="text-xs font-medium">{formatFecha(t.fecha)}</span>
                    <span className="text-xs text-[var(--text-muted)]">{t.hora}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench size={12} className="text-[var(--text-muted)] shrink-0" />
                    <span className="text-xs text-[var(--text-muted)] truncate">{t.servicios?.map(s => s.nombre).join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car size={12} className="text-[var(--text-muted)] shrink-0" />
                    <span className="text-xs text-[var(--text-muted)] truncate">{t.auto_modelo} · {t.auto_tamaño}</span>
                  </div>
                </div>
                <EstadoBadge estado={t.estado} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
