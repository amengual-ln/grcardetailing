import { getClientes } from '@/lib/actions/clientes'
import { getTurnos } from '@/lib/actions/turnos'
import { Avatar } from '@/components/ui/Avatar'
import { Users } from 'lucide-react'
import { Cliente, TurnoConRelaciones } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const [clientes, turnos] = await Promise.all([
    getClientes().catch((): Cliente[] => []),
    getTurnos().catch((): TurnoConRelaciones[] => []),
  ])

  const clientesConStats = clientes.map(c => {
    const clienteTurnos = turnos.filter(t => t.cliente_id === c.id)
    const ultimo = [...clienteTurnos].sort((a, b) => b.fecha.localeCompare(a.fecha))[0] as TurnoConRelaciones | undefined
    return { ...c, totalTurnos: clienteTurnos.length, ultimoTurno: ultimo }
  }).sort((a, b) => b.totalTurnos - a.totalTurnos)

  return (
    <div className="flex flex-col flex-1">
      <div className="px-4 py-4 border-b border-[var(--border)] bg-[var(--bg-card)] flex items-center gap-3">
        <div>
          <h1 className="text-base font-semibold">Clientes</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {clientesConStats.length} cliente{clientesConStats.length !== 1 ? 's' : ''} registrado{clientesConStats.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {clientesConStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)] gap-2">
            <Users size={32} className="text-[var(--border)]" />
            <p className="text-sm">Todavía no hay clientes registrados</p>
            <p className="text-xs">Se agregan automáticamente al crear un turno</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {clientesConStats.map(c => (
              <div
                key={c.id}
                className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] transition-all"
              >
                <Avatar nombre={c.nombre} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.nombre}</div>
                  <div className="text-xs text-[var(--text-muted)] truncate">
                    {c.telefono}{c.email ? ` · ${c.email}` : ''}
                  </div>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}