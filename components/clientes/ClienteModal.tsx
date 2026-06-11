'use client'

import { useState, useEffect } from 'react'
import { X, Check, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { crearCliente, actualizarCliente, eliminarCliente, getClienteConAutos } from '@/lib/actions/clientes'
import { ClienteConAutos, TamañoAuto } from '@/lib/database.types'
import { TAMAÑOS_AUTO } from '@/lib/constants'

interface Props {
  clienteId?: string
  onClose: () => void
  onSaved: () => void
}

interface AutoForm {
  modelo: string
  tamaño: TamañoAuto
}

export function ClienteModal({ clienteId, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [notas, setNotas] = useState('')
  const [autos, setAutos] = useState<AutoForm[]>([])

  useEffect(() => {
    if (clienteId) {
      getClienteConAutos(clienteId).then(c => {
        if (!c) return
        setNombre(c.nombre)
        setTelefono(c.telefono)
        setNotas(c.notas || '')
        setAutos(c.autos.map(v => ({ modelo: v.modelo, tamaño: v.tamaño as TamañoAuto })))
      })
    }
  }, [clienteId])

  function addAuto() {
    setAutos(v => [...v, { modelo: '', tamaño: 'Mediano' }])
  }

  function removeAuto(i: number) {
    setAutos(v => v.filter((_, idx) => idx !== i))
  }

  function updateAuto(i: number, field: keyof AutoForm, value: string) {
    setAutos(v => v.map((a, idx) =>
      idx === i
        ? { ...a, [field]: field === 'tamaño' ? value as TamañoAuto : value }
        : a
    ))
  }

  async function handleSave() {
    if (!nombre.trim() || !telefono.trim()) return
    setLoading(true)
    try {
      const autosData = autos.filter(v => v.modelo.trim())
      if (clienteId) {
        await actualizarCliente(clienteId, {
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          notas: notas.trim() || undefined,
          autos: autosData.length > 0 ? autosData : undefined,
        })
      } else {
        await crearCliente({
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          notas: notas.trim() || undefined,
          autos: autosData.length > 0 ? autosData : undefined,
        })
      }
      onSaved()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!clienteId) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      await eliminarCliente(clienteId)
      onSaved()
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] w-full max-w-md p-6 flex flex-col gap-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center">
          <h2 className="text-base font-semibold">
            {clienteId ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button onClick={onClose} className="ml-auto text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Nombre *</label>
          <input className="input" placeholder="Nombre y apellido" value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Celular *</label>
          <input className="input" type="tel" placeholder="+54 9 11..." value={telefono} onChange={e => setTelefono(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Autos (opcional)</label>
            <button
              onClick={addAuto}
              className="text-xs text-[var(--red)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} /> Agregar
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {autos.map((a, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-2 items-start">
                <input
                  className="input w-full"
                  placeholder="Modelo del auto"
                  value={a.modelo}
                  onChange={e => updateAuto(i, 'modelo', e.target.value)}
                />
                <select
                  className="input w-[90px]"
                  value={a.tamaño}
                  onChange={e => updateAuto(i, 'tamaño', e.target.value)}
                >
                  {TAMAÑOS_AUTO.map(t => <option key={t}>{t}</option>)}
                </select>
                <button
                  onClick={() => removeAuto(i)}
                  className="mt-1.5 text-[var(--text-muted)] hover:text-[var(--danger-text)] cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Notas (opcional)</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Comentarios sobre el cliente..."
            value={notas}
            onChange={e => setNotas(e.target.value)}
          />
        </div>

        <div className="flex gap-2 pt-1">
          {clienteId && (
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
              className="justify-center"
            >
              <Trash2 size={14} />
              {confirmDelete ? '¿Confirmar?' : 'Eliminar'}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} className="flex-1 justify-center">
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading || !nombre.trim() || !telefono.trim()}
            className="flex-1 justify-center"
          >
            <Check size={14} /> {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
