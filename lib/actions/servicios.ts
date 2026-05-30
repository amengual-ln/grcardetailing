'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '../supabase'
import { Servicio } from '../database.types'

export async function getServicios(): Promise<Servicio[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('activo', true)
    .order('nombre')
  if (error) throw new Error(error.message)
  return (data || []) as Servicio[]
}

export async function actualizarServicio(id: string, updates: Partial<Omit<Servicio, 'id' | 'created_at'>>) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('servicios').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/servicios')
}
