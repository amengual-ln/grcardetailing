import { NextResponse } from 'next/server'
import { createServiceClient, isConfigured } from '@/lib/supabase'
import { enviarRecordatorio } from '@/lib/whatsapp'
import { format, addDays } from 'date-fns'

export async function GET(request: Request) {
  if (!isConfigured) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const mañana = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  const { data: turnos, error } = await supabase
    .from('turnos')
    .select('*, clientes(*), turno_servicios(servicio_id)')
    .eq('fecha', mañana)
    .eq('estado', 'confirmado')
    .eq('recordatorio_enviado', false)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!turnos?.length) return NextResponse.json({ message: 'Sin turnos mañana', enviados: 0 })

  const turnoIds = turnos.map(t => t.id)
  const { data: servicioRows } = await supabase
    .from('turno_servicios')
    .select('turno_id, servicios(*)')
    .in('turno_id', turnoIds)

  const serviciosMap: Record<string, any[]> = {}
  for (const row of servicioRows || []) {
    if (!serviciosMap[row.turno_id]) serviciosMap[row.turno_id] = []
    if (row.servicios) serviciosMap[row.turno_id].push(row.servicios)
  }

  let enviados = 0
  for (const turno of turnos as any[]) {
    const cliente = turno.clientes
    const servicios = serviciosMap[turno.id] || []
    if (!cliente?.telefono) continue

    const serviciosNombres = servicios.map((s: any) => s.nombre)
    if (serviciosNombres.length === 0) continue

    const ok = await enviarRecordatorio({
      clienteNombre: cliente.nombre,
      clienteTelefono: cliente.telefono,
      fecha: mañana,
      hora: turno.hora,
      servicios: serviciosNombres,
    })

    if (ok) {
      await supabase.from('turnos').update({ recordatorio_enviado: true }).eq('id', turno.id)
      enviados++
    }
  }

  return NextResponse.json({ message: `Recordatorios enviados: ${enviados}`, total: turnos.length })
}
