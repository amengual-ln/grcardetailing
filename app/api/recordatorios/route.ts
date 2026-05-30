import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { enviarRecordatorio } from '@/lib/whatsapp'
import { format, addDays } from 'date-fns'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const mañana = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  const { data: turnos, error } = await supabase
    .from('turnos')
    .select('*, clientes(*), servicios(*)')
    .eq('fecha', mañana)
    .eq('estado', 'confirmado')
    .eq('recordatorio_enviado', false)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!turnos?.length) return NextResponse.json({ message: 'Sin turnos mañana', enviados: 0 })

  let enviados = 0
  for (const turno of turnos as any[]) {
    const cliente = turno.clientes
    const servicio = turno.servicios
    if (!cliente?.telefono) continue

    const ok = await enviarRecordatorio({
      clienteNombre: cliente.nombre,
      clienteTelefono: cliente.telefono,
      fecha: mañana,
      hora: turno.hora,
      servicio: servicio?.nombre || 'Servicio',
    })

    if (ok) {
      await supabase.from('turnos').update({ recordatorio_enviado: true }).eq('id', turno.id)
      enviados++
    }
  }

  return NextResponse.json({ message: `Recordatorios enviados: ${enviados}`, total: turnos.length })
}
