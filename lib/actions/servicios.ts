'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient, isConfigured } from '../supabase'
import { Servicio } from '../database.types'
import { SERVICIOS_DEFAULT } from '../constants'

export async function getServicios(): Promise<Servicio[]> {
  if (!isConfigured) {
    return SERVICIOS_DEFAULT as unknown as Servicio[]
  }
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
  if (!isConfigured) throw new Error('Database not configured')
  const supabase = createServiceClient()
  const { error } = await supabase.from('servicios').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/servicios')
}