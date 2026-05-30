'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { buscarOCrearCliente } from '@/lib/actions/clientes'
import { crearTurno } from '@/lib/actions/turnos'
import { Servicio, Cliente } from '@/lib/database.types'
import { formatDuracion } from '@/lib/utils'
import { TAMAÑOS_AUTO } from '@/lib/constants'

interface Props {
  servicios: Servicio[]
  clientes: Cliente[]
  defaultFecha: string
  onClose: () => void
  onSaved: () => void
}

export function TurnoModal({ servicios, clientes, defaultFecha, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    clienteNombre: '', clienteTel: '', clienteEmail: '',
    auto: '', tamaño: TAMAÑOS_AUTO[1],
    servicioId: servicios[0]?.id || '',
    fecha: defaultFecha, hora: '09:00', notas: '',
    clienteExistenteId: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit() {
    if (!form.clienteNombre || !form.auto || !form.fecha || !form.hora || !form.servicioId) return
    setLoading(true)
    try {
      const cliente = await buscarOCrearCliente(form.clienteNombre, form.clienteTel, form.clienteEmail || undefined)
      await crearTurno({
        cliente_id: cliente.id,
        servicio_id: form.servicioId,
        fecha: form.fecha,
        hora: form.hora,
        auto_modelo: form.auto,
        auto_tamaño: form.tamaño,
        notas: form.notas || undefined,
      })
      onSaved()
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
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] w-full max-w-md p-6 flex flex-col gap-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center">
          <h2 className="text-base font-semibold">Nuevo turno</h2>
          <button onClick={onClose} className="ml-auto text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Cliente</label>
          <input className="input" placeholder="Nombre y apellido" value={form.clienteNombre} onChange={set('clienteNombre')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Teléfono</label>
            <input className="input" type="tel" placeholder="+54 9 11..." value={form.clienteTel} onChange={set('clienteTel')} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Email (opcional)</label>
            <input className="input" type="email" placeholder="email@..." value={form.clienteEmail} onChange={set('clienteEmail')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Auto / Patente</label>
            <input className="input" placeholder="ej: Golf VII" value={form.auto} onChange={set('auto')} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Tamaño</label>
            <select className="input" value={form.tamaño} onChange={set('tamaño')}>
              {TAMAÑOS_AUTO.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Servicio</label>
          <select className="input" value={form.servicioId} onChange={set('servicioId')}>
            {servicios.map(s => (
              <option key={s.id} value={s.id}>{s.nombre} ({formatDuracion(s.duracion_minutos)})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Fecha</label>
            <input className="input" type="date" value={form.fecha} onChange={set('fecha')} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Hora</label>
            <input className="input" type="time" value={form.hora} onChange={set('hora')} min="08:00" max="19:00" step="1800" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Notas</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Estado del auto, condición, observaciones..."
            value={form.notas}
            onChange={set('notas')}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} className="flex-1 justify-center">Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading} className="flex-1 justify-center">
            <Check size={14} /> {loading ? 'Guardando...' : 'Confirmar turno'}
          </Button>
        </div>
      </div>
    </div>
  )
}