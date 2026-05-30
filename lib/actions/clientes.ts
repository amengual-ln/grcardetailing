'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '../supabase'
import { Cliente } from '../database.types'

export async function getClientes(): Promise<Cliente[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre')
  if (error) throw new Error(error.message)
  return (data || []) as Cliente[]
}

export async function buscarOCrearCliente(nombre: string, telefono: string, email?: string): Promise<Cliente> {
  const supabase = createServiceClient()
  if (telefono) {
    const { data: existing } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefono', telefono)
      .single()
    if (existing) return existing as Cliente
  }

  const { data, error } = await supabase
    .from('clientes')
    .insert({ nombre, telefono: telefono || '', email: email || null, notas: null })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/clientes')
  return data as Cliente
}

export async function getClienteConHistorial(clienteId: string) {
  const supabase = createServiceClient()
  const [clienteRes, turnosRes] = await Promise.all([
    supabase.from('clientes').select('*').eq('id', clienteId).single(),
    supabase.from('turnos').select('*, servicios(*)').eq('cliente_id', clienteId).order('fecha', { ascending: false })
  ])
  if (clienteRes.error) throw new Error(clienteRes.error.message)
  return { cliente: clienteRes.data as Cliente, turnos: turnosRes.data || [] }
}
