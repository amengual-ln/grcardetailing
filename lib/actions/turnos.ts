'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient, isConfigured } from '../supabase'
import { EstadoTurno, TurnoConRelaciones } from '../database.types'

function calcularHoraFin(hora: string, duracionMin: number): string {
  const [h, m] = hora.split(':').map(Number)
  const total = h * 60 + m + duracionMin
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function minutosDesdeMedianoche(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

function hayOverlap(
  inicio1: string, fin1: string,
  inicio2: string, fin2: string
): boolean {
  const i1 = minutosDesdeMedianoche(inicio1)
  const f1 = minutosDesdeMedianoche(fin1)
  const i2 = minutosDesdeMedianoche(inicio2)
  const f2 = minutosDesdeMedianoche(fin2)
  return i1 < f2 && i2 < f1
}

export async function getTurnos(fechaDesde?: string, fechaHasta?: string): Promise<TurnoConRelaciones[]> {
  if (!isConfigured) return []
  const supabase = createServiceClient()

  let query = supabase
    .from('turnos')
    .select(`
      *,
      clientes(*),
      turno_servicios(servicio_id)
    `)
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true })

  if (fechaDesde) query = query.gte('fecha', fechaDesde)
  if (fechaHasta) query = query.lte('fecha', fechaHasta)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) return []

  const turnoIds = data.map(t => t.id)

  const { data: servicioRows, error: serviciosError } = await supabase
    .from('turno_servicios')
    .select('turno_id, servicios(*)')
    .in('turno_id', turnoIds)

  if (serviciosError) throw new Error(serviciosError.message)

  const serviciosMap: Record<string, any[]> = {}
  for (const row of servicioRows || []) {
    if (!serviciosMap[row.turno_id]) {
      serviciosMap[row.turno_id] = []
    }
    if (row.servicios) {
      serviciosMap[row.turno_id].push(row.servicios)
    }
  }

  const result: TurnoConRelaciones[] = data.map(turno => ({
    ...turno,
    servicios: serviciosMap[turno.id] || [],
  }))

  return result as TurnoConRelaciones[]
}

export async function crearTurno(payload: {
  cliente_id: string
  servicio_ids: string[]
  fecha: string
  hora: string
  auto_modelo: string
  auto_tamaño: string
  notas?: string
}) {
  if (!isConfigured) throw new Error('Database not configured')
  const supabase = createServiceClient()

  const { data: serviciosData } = await supabase
    .from('servicios')
    .select('id, duracion_minutos')
    .in('id', payload.servicio_ids)

  const duracionTotal = (serviciosData || []).reduce((acc: number, s: any) => acc + s.duracion_minutos, 0)
  const horaFinNuevo = calcularHoraFin(payload.hora, duracionTotal)

  const { data: turnosExistentes } = await supabase
    .from('turnos')
    .select('id, hora, fecha')
    .eq('fecha', payload.fecha)
    .neq('estado', 'cancelado')

  if (turnosExistentes && turnosExistentes.length > 0) {
    const turnoIds = turnosExistentes.map(t => t.id)
    const { data: servicioRows } = await supabase
      .from('turno_servicios')
      .select('turno_id, servicios(duracion_minutos)')
      .in('turno_id', turnoIds)

    const serviciosMap: Record<string, number> = {}
    for (const row of servicioRows || []) {
      if (!serviciosMap[row.turno_id]) serviciosMap[row.turno_id] = 0
      if (row.servicios) serviciosMap[row.turno_id] += row.servicios.duracion_minutos
    }

    for (const turno of turnosExistentes) {
      const durExistente = serviciosMap[turno.id] || 60
      const horaFinExistente = calcularHoraFin(turno.hora, durExistente)

      if (hayOverlap(payload.hora, horaFinNuevo, turno.hora, horaFinExistente)) {
        throw new Error(`Ya hay un turno agendado a las ${turno.hora} ese día. Elegí otro horario.`)
      }
    }
  }

  const { data: turnoData, error: turnoError } = await supabase
    .from('turnos')
    .insert({
      cliente_id: payload.cliente_id,
      fecha: payload.fecha,
      hora: payload.hora,
      auto_modelo: payload.auto_modelo,
      auto_tamaño: payload.auto_tamaño,
      notas: payload.notas || null,
      estado: 'pendiente',
      recordatorio_enviado: false,
    })
    .select()
    .single()

  if (turnoError) throw new Error(turnoError.message)
  if (!turnoData) throw new Error('No se pudo crear el turno')

  const turnoId = turnoData.id

  if (payload.servicio_ids.length > 0) {
    const servicioRows = payload.servicio_ids.map(servicioId => ({
      turno_id: turnoId,
      servicio_id: servicioId,
    }))

    const { error: serviciosError } = await supabase
      .from('turno_servicios')
      .insert(servicioRows)

    if (serviciosError) throw new Error(serviciosError.message)
  }

  revalidatePath('/agenda')
}

export async function actualizarEstado(turnoId: string, estado: EstadoTurno) {
  if (!isConfigured) throw new Error('Database not configured')
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('turnos')
    .update({ estado })
    .eq('id', turnoId)
  if (error) throw new Error(error.message)
  revalidatePath('/agenda')
}

export async function eliminarTurno(turnoId: string) {
  if (!isConfigured) throw new Error('Database not configured')
  const supabase = createServiceClient()
  const { error } = await supabase.from('turnos').delete().eq('id', turnoId)
  if (error) throw new Error(error.message)
  revalidatePath('/agenda')
}
