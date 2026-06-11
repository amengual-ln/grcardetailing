'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Search, Plus, Pencil, FileText, MessageCircle, Calendar } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ClienteModal } from './ClienteModal'
import { HistorialTurnos } from './HistorialTurnos'
import { ClienteConAutos, TurnoConRelaciones } from '@/lib/database.types'

interface Props {
  initialClientes: ClienteConAutos[]
  turnos: TurnoConRelaciones[]
}

export function ClientesList({ initialClientes, turnos }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [historialClienteId, setHistorialClienteId] = useState<string | null>(null)

  const clientesConStats = useMemo(() => {
    return initialClientes.map(c => {
      const clienteTurnos = turnos.filter(t => t.cliente_id === c.id)
      const ultimo = [...clienteTurnos].sort((a, b) => b.fecha.localeCompare(a.fecha))[0] as TurnoConRelaciones | undefined
      return { ...c, totalTurnos: clienteTurnos.length, ultimoTurno: ultimo }
    }).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [initialClientes, turnos])

  const filtered = useMemo(() => {
    if (!search.trim()) return clientesConStats
    const q = search.toLowerCase()
    return clientesConStats.filter(c =>
      c.nombre.toLowerCase().includes(q) || c.telefono.includes(q)
    )
  }, [clientesConStats, search])

  function handleSaved() {
    setShowModal(false)
    setEditingId(null)
    router.refresh()
  }

  return (
    <>
      <div className="px-4 py-4 border-b border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-semibold">Clientes</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {initialClientes.length} cliente{initialClientes.length !== 1 ? 's' : ''} registrado{initialClientes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Añadir Cliente
          </Button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            className="input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Buscar por nombre o teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)] gap-2">
            <Users size={32} className="text-[var(--border)]" />
            <p className="text-sm">
              {search ? 'Ningún cliente coincide con la búsqueda' : 'Todavía no hay clientes registrados'}
            </p>
            <p className="text-xs">Se agregan automáticamente al crear un turno</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(c => (
              <div
                key={c.id}
                className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] transition-all"
              >
                <Avatar />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.nombre}</div>
                  <div className="text-xs text-[var(--text-muted)] truncate">
                    {c.telefono}{c.email ? ` · ${c.email}` : ''}
                  </div>
                  {c.autos.length > 0 && (
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
                      {c.autos.map(v => v.modelo).join(', ')}
                    </div>
                  )}
                  {c.notas && (
                    <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] mt-0.5">
                      <FileText size={11} />
                      <span className="truncate">{c.notas}</span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold">{c.totalTurnos}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">visita{c.totalTurnos !== 1 ? 's' : ''}</div>
                </div>
                {c.ultimoTurno && (
                  <div className="text-right shrink-0 hidden lg:block min-w-[80px]">
                    <div className="text-[11px] text-[var(--text-muted)]">Último turno</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{c.ultimoTurno.servicios?.nombre}</div>
                  </div>
                )}
                <button
                  onClick={() => setHistorialClienteId(c.id)}
                  className="shrink-0 p-1.5 text-[var(--text-muted)] hover:text-[var(--red)] hover:bg-[var(--bg-hover)] rounded-lg transition-all cursor-pointer"
                  title="Ver historial de turnos"
                >
                  <Calendar size={14} />
                </button>
                <a
                  href={`https://wa.me/${c.telefono.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-1.5 text-[var(--text-muted)] hover:text-green-500 hover:bg-[var(--bg-hover)] rounded-lg transition-all cursor-pointer"
                  title="Enviar WhatsApp"
                >
                  <MessageCircle size={14} />
                </a>
                <button
                  onClick={() => setEditingId(c.id)}
                  className="shrink-0 p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)] rounded-lg transition-all cursor-pointer"
                  title="Editar cliente"
                >
                  <Pencil size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ClienteModal onClose={() => setShowModal(false)} onSaved={handleSaved} />
      )}
      {editingId && (
        <ClienteModal
          clienteId={editingId}
          onClose={() => setEditingId(null)}
          onSaved={handleSaved}
        />
      )}
      {historialClienteId && (() => {
        const c = clientesConStats.find(x => x.id === historialClienteId)
        if (!c) return null
        return (
          <HistorialTurnos
            cliente={c}
            turnos={turnos.filter(t => t.cliente_id === c.id)}
            onClose={() => setHistorialClienteId(null)}
          />
        )
      })()}
    </>
  )
}
