'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient, isConfigured } from '../supabase'
import { Cliente, Auto } from '../database.types'

export async function getClientes(): Promise<Cliente[]> {
  if (!isConfigured) return []
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre')
  if (error) throw new Error(error.message)
  return (data || []) as Cliente[]
}

export async function getAutosPorCliente(clienteId: string): Promise<Auto[]> {
  if (!isConfigured) return []
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('autos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []) as Auto[]
}

export async function crearAuto(clienteId: string, modelo: string, tamaño: string, patente?: string): Promise<Auto> {
  if (!isConfigured) throw new Error('Database not configured')
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('autos')
    .insert({
      cliente_id: clienteId,
      modelo,
      tamaño: tamaño as any,
      patente: patente || null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Auto
}

export async function buscarOCrearCliente(nombre: string, telefono: string, email?: string): Promise<Cliente> {
  if (!isConfigured) throw new Error('Database not configured')
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
  if (!isConfigured) throw new Error('Database not configured')
  const supabase = createServiceClient()
  const [clienteRes, turnosRes] = await Promise.all([
    supabase.from('clientes').select('*').eq('id', clienteId).single(),
    supabase.from('turnos').select('*, servicios(*)').eq('cliente_id', clienteId).order('fecha', { ascending: false })
  ])
  if (clienteRes.error) throw new Error(clienteRes.error.message)
  return { cliente: clienteRes.data as Cliente, turnos: turnosRes.data || [] }
}