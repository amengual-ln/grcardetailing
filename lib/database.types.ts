export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type EstadoTurno = 'pendiente' | 'confirmado' | 'cancelado' | 'completado'
export type TamañoAuto = 'Chico' | 'Mediano' | 'Grande' | 'SUV / Camioneta'

export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: string
          created_at: string
          nombre: string
          telefono: string
          email: string | null
          notas: string | null
        }
        Insert: Omit<Database['public']['Tables']['clientes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['clientes']['Insert']>
      }
      servicios: {
        Row: {
          id: string
          created_at: string
          nombre: string
          duracion_minutos: number
          precio_base: number
          descripcion: string | null
          activo: boolean
        }
        Insert: Omit<Database['public']['Tables']['servicios']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['servicios']['Insert']>
      }
      turnos: {
        Row: {
          id: string
          created_at: string
          cliente_id: string
          fecha: string
          hora: string
          estado: EstadoTurno
          auto_modelo: string
          auto_tamaño: TamañoAuto
          notas: string | null
          recordatorio_enviado: boolean
        }
        Insert: Omit<Database['public']['Tables']['turnos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['turnos']['Insert']>
      }
      turno_servicios: {
        Row: {
          id: string
          turno_id: string
          servicio_id: string
        }
        Insert: Omit<Database['public']['Tables']['turno_servicios']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['turno_servicios']['Insert']>
      }
      autos: {
        Row: {
          id: string
          cliente_id: string
          modelo: string
          tamaño: TamañoAuto
          patente: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['autos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['autos']['Insert']>
      }
      }
    }
  }
}

export type Cliente = Database['public']['Tables']['clientes']['Row']
export type Servicio = Database['public']['Tables']['servicios']['Row']
export type Turno = Database['public']['Tables']['turnos']['Row']
export type Auto = Database['public']['Tables']['autos']['Row']
export type TurnoConRelaciones = Turno & {
  clientes: Cliente
  servicios: Servicio[]
}
export type ClienteConAutos = Cliente & {
  autos: Auto[]
}
