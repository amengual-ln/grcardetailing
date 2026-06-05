import { getClientesConVehiculos } from '@/lib/actions/clientes'
import { getTurnos } from '@/lib/actions/turnos'
import { ClientesList } from '@/components/clientes/ClientesList'
import { TurnoConRelaciones } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const [clientes, turnos] = await Promise.all([
    getClientesConVehiculos().catch(() => []),
    getTurnos().catch((): TurnoConRelaciones[] => []),
  ])

  return (
    <div className="flex flex-col flex-1">
      <ClientesList initialClientes={clientes} turnos={turnos} />
    </div>
  )
}