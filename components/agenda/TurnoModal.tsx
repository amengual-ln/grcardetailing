'use client'

import { useState, useMemo, useEffect } from 'react'
import { X, Check, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { buscarOCrearCliente, getAutosPorCliente, crearAuto } from '@/lib/actions/clientes'
import { crearTurno } from '@/lib/actions/turnos'
import { Servicio, Cliente, Auto } from '@/lib/database.types'
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
  const [esClienteNuevo, setEsClienteNuevo] = useState(false)
  const [autosCliente, setAutosCliente] = useState<Auto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    clienteExistenteId: '',
    clienteNombre: '', clienteTel: '', clienteEmail: '',
    autoId: '',
    auto: '', tamaño: TAMAÑOS_AUTO[1], patente: '',
    servicioIds: [] as string[],
    fecha: defaultFecha, hora: '09:00', notas: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const toggleServicio = (id: string) => {
    setForm(f => ({
      ...f,
      servicioIds: f.servicioIds.includes(id)
        ? f.servicioIds.filter(s => s !== id)
        : [...f.servicioIds, id]
    }))
  }

  const serviciosSeleccionados = useMemo(() =>
    servicios.filter(s => form.servicioIds.includes(s.id)),
    [servicios, form.servicioIds]
  )

  const duracionTotal = useMemo(() =>
    serviciosSeleccionados.reduce((acc, s) => acc + s.duracion_minutos, 0),
    [serviciosSeleccionados]
  )

  const precioTotal = useMemo(() =>
    serviciosSeleccionados.reduce((acc, s) => acc + Number(s.precio_base), 0),
    [serviciosSeleccionados]
  )

  const clienteExistente = useMemo(() =>
    clientes.find(c => c.id === form.clienteExistenteId),
    [clientes, form.clienteExistenteId]
  )

  const autoSeleccionado = useMemo(() =>
    autosCliente.find(a => a.id === form.autoId),
    [autosCliente, form.autoId]
  )

  useEffect(() => {
    if (form.clienteExistenteId && !esClienteNuevo) {
      getAutosPorCliente(form.clienteExistenteId)
        .then(autos => {
          setAutosCliente(autos)
          if (autos.length > 0) {
            setForm(f => ({
              ...f,
              autoId: autos[0].id,
              auto: autos[0].modelo,
              tamaño: autos[0].tamaño,
              patente: autos[0].patente || '',
            }))
          } else {
            setForm(f => ({ ...f, autoId: '', auto: '', tamaño: TAMAÑOS_AUTO[1], patente: '' }))
          }
        })
        .catch(console.error)
    } else {
      setAutosCliente([])
    }
  }, [form.clienteExistenteId, esClienteNuevo])

  async function handleSubmit() {
    if (!form.auto || !form.fecha || !form.hora || form.servicioIds.length === 0) return
    setLoading(true)
    setError(null)
    try {
      let clienteId: string

      if (esClienteNuevo) {
        if (!form.clienteNombre) return
        const cliente = await buscarOCrearCliente(form.clienteNombre, form.clienteTel, form.clienteEmail || undefined)
        clienteId = cliente.id

        if (form.auto) {
          await crearAuto(clienteId, form.auto, form.tamaño, form.patente || undefined)
        }
      } else {
        if (!form.clienteExistenteId) return
        clienteId = form.clienteExistenteId

        if (form.autoId === '__nuevo__' && form.auto) {
          const nuevoAuto = await crearAuto(clienteId, form.auto, form.tamaño, form.patente || undefined)
          setAutosCliente(prev => [...prev, nuevoAuto])
          setForm(f => ({ ...f, autoId: nuevoAuto.id }))
        }
      }

      await crearTurno({
        cliente_id: clienteId,
        servicio_ids: form.servicioIds,
        fecha: form.fecha,
        hora: form.hora,
        auto_modelo: form.auto,
        auto_tamaño: form.tamaño,
        notas: form.notas || undefined,
      })
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear turno')
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

        {error && (
          <div className="bg-[var(--danger-bg)] border border-[var(--red)] text-[var(--red)] text-xs px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEsClienteNuevo(false)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${!esClienteNuevo ? 'border-[var(--red)] bg-[var(--red-bg)] text-[var(--red)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}
          >
            Cliente existente
          </button>
          <button
            type="button"
            onClick={() => setEsClienteNuevo(true)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${esClienteNuevo ? 'border-[var(--red)] bg-[var(--red-bg)] text-[var(--red)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}
          >
            <UserPlus size={12} className="inline mr-1" />
            Nuevo cliente
          </button>
        </div>

        {esClienteNuevo ? (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Nombre</label>
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
          </>
        ) : (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Seleccionar cliente</label>
            <select
              className="input"
              value={form.clienteExistenteId}
              onChange={e => {
                const id = e.target.value
                const cliente = clientes.find(c => c.id === id)
                setForm(f => ({
                  ...f,
                  clienteExistenteId: id,
                  clienteNombre: cliente?.nombre || '',
                  clienteTel: cliente?.telefono || '',
                  clienteEmail: cliente?.email || '',
                  autoId: '',
                  auto: '',
                  patente: '',
                }))
              }}
            >
              <option value="">-- Elegir cliente --</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} {c.telefono ? `(${c.telefono})` : ''}</option>
              ))}
            </select>
            {clienteExistente && (
              <div className="text-xs text-[var(--text-muted)] mt-1 px-1">
                {clienteExistente.telefono} {clienteExistente.email ? `· ${clienteExistente.email}` : ''}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Auto</label>
            {autosCliente.length > 0 ? (
              <select className="input" value={form.autoId} onChange={e => {
                const auto = autosCliente.find(a => a.id === e.target.value)
                if (e.target.value === '__nuevo__') {
                  setForm(f => ({ ...f, autoId: '__nuevo__', auto: '', tamaño: TAMAÑOS_AUTO[1], patente: '' }))
                } else {
                  setForm(f => ({
                    ...f,
                    autoId: e.target.value,
                    auto: auto?.modelo || '',
                    tamaño: auto?.tamaño || TAMAÑOS_AUTO[1],
                    patente: auto?.patente || '',
                  }))
                }
              }}>
                <option value="">-- Elegir auto --</option>
                {autosCliente.map(a => (
                  <option key={a.id} value={a.id}>{a.modelo} {a.patente ? `(${a.patente})` : ''}</option>
                ))}
                <option value="__nuevo__">+ Agregar otro auto</option>
              </select>
            ) : (
              <input className="input" placeholder="ej: Golf VII" value={form.auto} onChange={set('auto')} />
            )}
            {(form.autoId === '__nuevo__' || (autosCliente.length === 0 && form.auto)) && (
              <input
                className="input mt-1"
                placeholder="Modelo del auto"
                value={form.auto}
                onChange={set('auto')}
              />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Tamaño</label>
            <select className="input" value={form.tamaño} onChange={set('tamaño')}>
              {TAMAÑOS_AUTO.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Patente (opcional)</label>
          <input className="input" placeholder="ABC 123" value={form.patente} onChange={set('patente')} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Servicios</label>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto border border-[var(--border)] rounded-lg p-2">
            {servicios.map(s => (
              <label key={s.id} className="flex items-center gap-2 cursor-pointer hover:bg-[var(--bg-hover)] px-2 py-1 rounded">
                <input
                  type="checkbox"
                  checked={form.servicioIds.includes(s.id)}
                  onChange={() => toggleServicio(s.id)}
                  className="accent-[var(--red)]"
                />
                <span className="flex-1 text-sm">{s.nombre}</span>
                <span className="text-xs text-[var(--text-muted)]">{formatDuracion(s.duracion_minutos)}</span>
                <span className="text-xs text-[var(--text-muted)]">${Number(s.precio_base).toLocaleString()}</span>
              </label>
            ))}
          </div>
          {serviciosSeleccionados.length > 0 && (
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1 px-1">
              <span>Total: {formatDuracion(duracionTotal)}</span>
              <span className="font-medium text-[var(--text)]">${precioTotal.toLocaleString()}</span>
            </div>
          )}
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
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={
              loading ||
              form.servicioIds.length === 0 ||
              (esClienteNuevo ? !form.clienteNombre : !form.clienteExistenteId) ||
              !form.auto
            }
            className="flex-1 justify-center"
          >
            <Check size={14} /> {loading ? 'Guardando...' : 'Confirmar turno'}
          </Button>
        </div>
      </div>
    </div>
  )
}
