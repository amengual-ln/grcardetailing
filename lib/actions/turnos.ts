'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '../supabase'
import { EstadoTurno, TurnoConRelaciones } from '../database.types'

export async function getTurnos(fechaDesde?: string, fechaHasta?: string): Promise<TurnoConRelaciones[]> {
  const supabase = createServiceClient()
  let query = supabase
    .from('turnos')
    .select('*, clientes(*), servicios(*)')
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true })

  if (fechaDesde) query = query.gte('fecha', fechaDesde)
  if (fechaHasta) query = query.lte('fecha', fechaHasta)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data || []) as TurnoConRelaciones[]
}

export async function crearTurno(payload: {
  cliente_id: string
  servicio_id: string
  fecha: string
  hora: string
  auto_modelo: string
  auto_tamaño: string
  notas?: string
}) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('turnos').insert({
    cliente_id: payload.cliente_id,
    servicio_id: payload.servicio_id,
    fecha: payload.fecha,
    hora: payload.hora,
    auto_modelo: payload.auto_modelo,
    auto_tamaño: payload.auto_tamaño,
    notas: payload.notas || null,
    estado: 'pendiente',
    recordatorio_enviado: false,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/agenda')
}

export async function actualizarEstado(turnoId: string, estado: EstadoTurno) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('turnos')
    .update({ estado })
    .eq('id', turnoId)
  if (error) throw new Error(error.message)
  revalidatePath('/agenda')
}

export async function eliminarTurno(turnoId: string) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('turnos').delete().eq('id', turnoId)
  if (error) throw new Error(error.message)
  revalidatePath('/agenda')
}
