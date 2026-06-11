'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, addDays, startOfWeek, addWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/Button'
import { EstadoBadge } from '@/components/ui/Badge'
import { TurnoModal } from './TurnoModal'
import { TurnoDetalle } from './TurnoDetalle'
import { getTurnos } from '@/lib/actions/turnos'
import { formatDuracion, calcularHoraFin } from '@/lib/utils'
import { Servicio, Cliente, TurnoConRelaciones } from '@/lib/database.types'

interface AgendaViewProps {
  servicios: Servicio[]
  clientes: Cliente[]
}

export function AgendaView({ servicios, clientes }: AgendaViewProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [turnos, setTurnos] = useState<TurnoConRelaciones[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDate, setModalDate] = useState<string | null>(null)
  const [selectedTurno, setSelectedTurno] = useState<TurnoConRelaciones | null>(null)

  const weekDays = Array.from({ length: 6 }, (_, i) =>
    addDays(startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }), i)
  )
  const fechaDesde = format(weekDays[0], 'yyyy-MM-dd')
  const fechaHasta = format(weekDays[5], 'yyyy-MM-dd')

  const fetchTurnos = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTurnos(fechaDesde, fechaHasta)
      setTurnos((data as TurnoConRelaciones[]) || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [fechaDesde, fechaHasta])

  useEffect(() => { fetchTurnos() }, [fetchTurnos])

  const weekLabel =
    weekOffset === 0 ? 'Esta semana' :
    weekOffset === 1 ? 'Próxima semana' :
    weekOffset === -1 ? 'Semana pasada' :
    `Semana ${weekOffset > 0 ? '+' : ''}${weekOffset}`

  const rangoLabel =
    format(weekDays[0], "d MMM", { locale: es }) + ' — ' +
    format(weekDays[5], "d MMM yyyy", { locale: es })

  const turnosSemana = turnos.length
  const turnosPendientes = turnos.filter(t => t.estado === 'pendiente').length

  return (
    <div className="flex flex-col flex-1 h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 sm:px-6 border-b border-[var(--border)] bg-[var(--bg-card)]">
        <div>
          <h1 className="text-base font-semibold">Agenda semanal</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{rangoLabel} · {turnosSemana} turno{turnosSemana !== 1 ? 's' : ''} · {turnosPendientes} pendiente{turnosPendientes !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] transition-all cursor-pointer"
              aria-label="Semana anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-medium px-2 min-w-[100px] text-center">{weekLabel}</span>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] transition-all cursor-pointer"
              aria-label="Semana siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={() => { setModalDate(null); setModalOpen(true) }}>
            <Plus size={13} /> <span className="hidden sm:inline">Nuevo turno</span>
          </Button>
        </div>
      </div>

      {/* Agenda */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-[var(--text-muted)]">Cargando turnos...</div>
        ) : (
          weekDays.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd')
            const dayTurnos = turnos.filter(t => t.fecha === dayStr).sort((a, b) => a.hora.localeCompare(b.hora))
            const isToday = dayStr === format(new Date(), 'yyyy-MM-dd')

            return (
              <div key={dayStr} className="border-b border-[var(--border)]">
                {/* Day header */}
                <div className="flex items-center gap-2 px-3 sm:px-6 py-2 border-b border-[var(--border)] bg-[var(--bg-hover)]">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider min-w-[56px] sm:min-w-[72px] ${isToday ? 'text-[var(--red)]' : 'text-[var(--text-muted)]'}`}>
                    {format(day, 'EEE d', { locale: es })}
                  </span>
                  <span className="text-[11px] text-[var(--text-subtle)]">{format(day, 'MMMM', { locale: es })}</span>
                  {dayTurnos.length > 0 && (
                    <span className="ml-auto text-[11px] text-[var(--text-muted)]">{dayTurnos.length} turno{dayTurnos.length > 1 ? 's' : ''}</span>
                  )}
                </div>

                {/* Turnos del día */}
                <div className="px-3 sm:px-6 py-2 flex flex-col gap-2">
                  {dayTurnos.length === 0 ? (
                    <button
                      onClick={() => { setModalDate(dayStr); setModalOpen(true) }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--text-muted)] hover:border-[var(--red-mid)] hover:text-[var(--red)] hover:bg-[var(--danger-bg)] transition-all cursor-pointer w-full text-left"
                    >
                      <Plus size={13} /> Agregar turno
                    </button>
                  ) : (
                    dayTurnos.map(turno => {
                      const servicios = turno.servicios || []
                      const dur = servicios.reduce((acc, s) => acc + s.duracion_minutos, 0) || 60
                      const horaFin = calcularHoraFin(turno.hora, dur)
                      const serviciosLabel = servicios.length > 1
                        ? `${servicios[0]?.nombre} +${servicios.length - 1}`
                        : servicios[0]?.nombre || ''
                      return (
                        <button
                          key={turno.id}
                          onClick={() => setSelectedTurno(turno)}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] transition-all text-left w-full cursor-pointer"
                          style={{
                            borderLeft: `3px solid ${
                              turno.estado === 'confirmado' ? '#639922' :
                              turno.estado === 'cancelado' ? '#A32D2D' :
                              turno.estado === 'completado' ? '#888' : '#BA7517'
                            }`
                          }}
                        >
                          <span className="text-xs font-mono text-[var(--text-muted)] min-w-[40px]">{turno.hora}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{turno.clientes?.nombre}</div>
                            <div className="text-xs text-[var(--text-muted)] truncate">{serviciosLabel} · {turno.auto_modelo}</div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] text-[var(--text-muted)] bg-[var(--muted-bg)] px-1.5 py-0.5 rounded-full hidden sm:inline">{formatDuracion(dur)}</span>
                            <EstadoBadge estado={turno.estado} />
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal nuevo turno */}
      {modalOpen && (
        <TurnoModal
          servicios={servicios}
          clientes={clientes}
          defaultFecha={modalDate || format(new Date(), 'yyyy-MM-dd')}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); fetchTurnos() }}
        />
      )}

      {/* Detalle turno */}
      {selectedTurno && (
        <TurnoDetalle
          turno={selectedTurno}
          onClose={() => setSelectedTurno(null)}
          onUpdated={() => { setSelectedTurno(null); fetchTurnos() }}
        />
      )}
    </div>
  )
}