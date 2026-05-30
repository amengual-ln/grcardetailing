import { Suspense } from 'react'
import { AgendaView } from '@/components/agenda/AgendaView'
import { getServicios } from '@/lib/actions/servicios'
import { getClientes } from '@/lib/actions/clientes'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AgendaPage() {
  // Fetch servicios y clientes para el formulario de nuevo turno
  const [servicios, clientes] = await Promise.all([
    getServicios().catch(() => []),
    getClientes().catch(() => []),
  ])

  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-sm text-[var(--text-muted)]">Cargando agenda...</div>}>
      <AgendaView servicios={servicios ?? []} clientes={clientes ?? []} />
    </Suspense>
  )
}
