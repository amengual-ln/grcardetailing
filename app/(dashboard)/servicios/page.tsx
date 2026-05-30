import { getServicios } from '@/lib/actions/servicios'
import { formatDuracion, formatPrecio } from '@/lib/utils'
import { Clock, Wrench } from 'lucide-react'
import { Servicio } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

export default async function ServiciosPage() {
  const servicios: Servicio[] = await getServicios().catch((): Servicio[] => [])

  return (
    <div className="flex flex-col flex-1">
      <div className="px-4 py-4 border-b border-[var(--border)] bg-[var(--bg-card)]">
        <h1 className="text-base font-semibold">Servicios</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Duración y precios base — editables próximamente</p>
      </div>

      <div className="p-4">
        {servicios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)] gap-2">
            <Wrench size={32} className="text-[var(--border)]" />
            <p className="text-sm">Ejecutá el schema SQL en Supabase para cargar los servicios</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="grid grid-cols-[1fr_100px_120px] px-4 py-2.5 border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <span>Servicio</span>
                <span className="text-center">Duración</span>
                <span className="text-right">Precio base</span>
              </div>
              {servicios.map((s, i) => (
                <div
                  key={s.id}
                  className={`grid grid-cols-[1fr_100px_120px] items-center px-4 py-3 text-sm ${
                    i < servicios.length - 1 ? 'border-b border-[var(--border)]' : ''
                  }`}
                >
                  <div>
                    <div className="font-medium">{s.nombre}</div>
                    {s.descripcion && <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.descripcion}</div>}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[var(--text-muted)] text-xs">
                    <Clock size={12} />
                    {formatDuracion(s.duracion_minutos)}
                  </div>
                  <div className="flex items-center justify-end font-medium text-xs">
                    {formatPrecio(s.precio_base)}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {servicios.map(s => (
                <div
                  key={s.id}
                  className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{s.nombre}</div>
                      {s.descripcion && (
                        <div className="text-xs text-[var(--text-muted)] mt-1">{s.descripcion}</div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-sm">{formatPrecio(s.precio_base)}</div>
                      <div className="flex items-center justify-end gap-1 text-[var(--text-muted)] text-xs mt-0.5">
                        <Clock size={11} />
                        {formatDuracion(s.duracion_minutos)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}