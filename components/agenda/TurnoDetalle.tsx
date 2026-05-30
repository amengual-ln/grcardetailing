'use client'

import { useState } from 'react'
import { X, Calendar, Clock, Wrench, Car, Flag, FileText, Check, Ban } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { EstadoBadge } from '@/components/ui/Badge'
import { actualizarEstado } from '@/lib/actions/turnos'
import { TurnoConRelaciones, EstadoTurno } from '@/lib/database.types'
import { formatFecha, formatDuracion, calcularHoraFin } from '@/lib/utils'

interface Props {
  turno: TurnoConRelaciones
  onClose: () => void
  onUpdated: () => void
}

export function TurnoDetalle({ turno, onClose, onUpdated }: Props) {
  const [loading, setLoading] = useState(false)
  const dur = turno.servicios?.duracion_minutos || 60
  const horaFin = calcularHoraFin(turno.hora, dur)

  async function cambiarEstado(estado: EstadoTurno) {
    setLoading(true)
    try {
      await actualizarEstado(turno.id, estado)
      onUpdated()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] w-full max-w-sm shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-[var(--border)]">
          <Avatar nombre={turno.clientes?.nombre || '?'} size="md" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{turno.clientes?.nombre}</div>
            <div className="text-xs text-[var(--text-muted)]">{turno.clientes?.telefono}</div>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-3">
          {[
            { icon: Calendar, label: 'Fecha',    val: formatFecha(turno.fecha) },
            { icon: Clock,    label: 'Horario',  val: `${turno.hora} — ${horaFin} (${formatDuracion(dur)})` },
            { icon: Wrench,   label: 'Servicio', val: turno.servicios?.nombre || '' },
            { icon: Car,      label: 'Auto',     val: `${turno.auto_modelo} · ${turno.auto_tamaño}` },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <Icon size={15} className="text-[var(--text-muted)] shrink-0" />
              <span className="text-[var(--text-muted)] min-w-[68px] text-xs">{label}</span>
              <span className="font-medium">{val}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 text-sm">
            <Flag size={15} className="text-[var(--text-muted)] shrink-0" />
            <span className="text-[var(--text-muted)] min-w-[68px] text-xs">Estado</span>
            <EstadoBadge estado={turno.estado} />
          </div>
          {turno.notas && (
            <div className="flex items-start gap-3 text-sm">
              <FileText size={15} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
              <span className="text-[var(--text-muted)] min-w-[68px] text-xs">Notas</span>
              <span className="text-[var(--text-muted)] text-xs">{turno.notas}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-[var(--border)]">
          {turno.estado !== 'confirmado' && turno.estado !== 'completado' && (
            <Button variant="primary" size="sm" onClick={() => cambiarEstado('confirmado')} disabled={loading} className="flex-1 justify-center">
              <Check size={13} /> Confirmar
            </Button>
          )}
          {turno.estado === 'confirmado' && (
            <Button variant="ghost" size="sm" onClick={() => cambiarEstado('completado')} disabled={loading} className="flex-1 justify-center">
              <Check size={13} /> Completado
            </Button>
          )}
          {turno.estado !== 'cancelado' && turno.estado !== 'completado' && (
            <Button variant="danger" size="sm" onClick={() => cambiarEstado('cancelado')} disabled={loading} className="flex-1 justify-center">
              <Ban size={13} /> Cancelar
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">Cerrar</Button>
        </div>
      </div>
    </div>
  )
}