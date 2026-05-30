import { Servicio } from './database.types'

// Servicios por defecto para seed inicial
export const SERVICIOS_DEFAULT: Omit<Servicio, 'id' | 'created_at'>[] = [
  { nombre: 'Lavado clásico',        duracion_minutos: 60,  precio_base: 5000,  descripcion: 'Lavado exterior completo',           activo: true },
  { nombre: 'Lavado premium',        duracion_minutos: 90,  precio_base: 9000,  descripcion: 'Lavado exterior + secado y brillo',   activo: true },
  { nombre: 'Limpieza interior',     duracion_minutos: 120, precio_base: 12000, descripcion: 'Aspirado, tapizados y tablero',       activo: true },
  { nombre: 'Abrillantado',          duracion_minutos: 150, precio_base: 18000, descripcion: 'Pulido y abrillantado de carrocería', activo: true },
  { nombre: 'Detallado de motor',    duracion_minutos: 120, precio_base: 15000, descripcion: 'Limpieza profunda del compartimento',  activo: true },
  { nombre: 'Tratamiento acrílico',  duracion_minutos: 240, precio_base: 35000, descripcion: 'Sellado acrílico de larga duración',  activo: true },
  { nombre: 'Tratamiento cerámico',  duracion_minutos: 480, precio_base: 80000, descripcion: 'Recubrimiento cerámico profesional',  activo: true },
  { nombre: 'Restauración de óptica',duracion_minutos: 90,  precio_base: 10000, descripcion: 'Pulido y restauración de faros',      activo: true },
]

export const TAMAÑOS_AUTO = ['Chico', 'Mediano', 'Grande', 'SUV / Camioneta'] as const

export const ESTADOS_TURNO = {
  pendiente:   { label: 'Pendiente',   color: 'amber' },
  confirmado:  { label: 'Confirmado',  color: 'green'  },
  cancelado:   { label: 'Cancelado',   color: 'red'    },
  completado:  { label: 'Completado',  color: 'gray'   },
} as const

export const DIAS_LABORALES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
