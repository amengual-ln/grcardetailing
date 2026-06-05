'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient, isConfigured } from '../supabase'
import { Cliente, ClienteConVehiculos, TamañoAuto } from '../database.types'

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

export async function buscarOCrearCliente(nombre: string, telefono: string): Promise<Cliente> {
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
    .insert({ nombre, telefono: telefono || '', email: null, notas: null })
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

export async function getClientesConVehiculos(): Promise<ClienteConVehiculos[]> {
  if (!isConfigured) return []
  const supabase = createServiceClient()
  const { data: clientes, error } = await supabase
    .from('clientes')
    .select('*, vehiculos(*)')
    .order('nombre')
  if (error) throw new Error(error.message)
  return (clientes || []) as unknown as ClienteConVehiculos[]
}

export async function getClienteConVehiculos(id: string): Promise<ClienteConVehiculos | null> {
  if (!isConfigured) throw new Error('Database not configured')
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*, vehiculos(*)')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data as unknown as ClienteConVehiculos
}

interface CrearClienteData {
  nombre: string
  telefono: string
  notas?: string
  vehiculos?: { nombre: string; tamaño: TamañoAuto }[]
}

export async function crearCliente(data: CrearClienteData): Promise<ClienteConVehiculos> {
  if (!isConfigured) throw new Error('Database not configured')
  const supabase = createServiceClient()

  const { data: cliente, error } = await supabase
    .from('clientes')
    .insert({
      nombre: data.nombre,
      telefono: data.telefono,
      notas: data.notas || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (data.vehiculos && data.vehiculos.length > 0) {
    const { error: vehError } = await supabase
      .from('vehiculos')
      .insert(data.vehiculos.map(v => ({
        cliente_id: (cliente as Cliente).id,
        nombre: v.nombre,
        tamaño: v.tamaño,
      })))
    if (vehError) throw new Error(vehError.message)
  }

  revalidatePath('/clientes')
  return getClienteConVehiculos((cliente as Cliente).id) as Promise<ClienteConVehiculos>
}

interface ActualizarClienteData {
  nombre: string
  telefono: string
  notas?: string
  vehiculos?: { nombre: string; tamaño: TamañoAuto }[]
}

export async function actualizarCliente(id: string, data: ActualizarClienteData): Promise<ClienteConVehiculos> {
  if (!isConfigured) throw new Error('Database not configured')
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('clientes')
    .update({
      nombre: data.nombre,
      telefono: data.telefono,
      notas: data.notas || null,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Replace vehicles: delete all, then insert new ones
  const { error: delError } = await supabase
    .from('vehiculos')
    .delete()
    .eq('cliente_id', id)

  if (delError) throw new Error(delError.message)

  if (data.vehiculos && data.vehiculos.length > 0) {
    const { error: insError } = await supabase
      .from('vehiculos')
      .insert(data.vehiculos.map(v => ({
        cliente_id: id,
        nombre: v.nombre,
        tamaño: v.tamaño,
      })))
    if (insError) throw new Error(insError.message)
  }

  revalidatePath('/clientes')
  return getClienteConVehiculos(id) as Promise<ClienteConVehiculos>
}

export async function eliminarCliente(id: string): Promise<void> {
  if (!isConfigured) throw new Error('Database not configured')
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/clientes')
}