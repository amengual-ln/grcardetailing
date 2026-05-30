import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, startOfWeek, addDays, addWeeks } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function calcularHoraFin(hora: string, duracionMin: number): string {
  const [h, m] = hora.split(':').map(Number)
  const total = h * 60 + m + duracionMin
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function getWeekDays(weekOffset: number): Date[] {
  const now = new Date()
  const monday = startOfWeek(addWeeks(now, weekOffset), { weekStartsOn: 1 })
  return Array.from({ length: 6 }, (_, i) => addDays(monday, i))
}

export function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number)
  return format(new Date(y, m - 1, d), "EEEE d 'de' MMMM", { locale: es })
}

export function formatFechaCorta(date: Date): string {
  return format(date, 'EEE d', { locale: es })
}

export function formatRangoSemana(days: Date[]): string {
  const start = format(days[0], "d MMM", { locale: es })
  const end = format(days[days.length - 1], "d MMM yyyy", { locale: es })
  return `${start} — ${end}`
}

export function getInitiales(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

export function formatPrecio(precio: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(precio)
}

export function isSameDay(a: Date, b: Date): boolean {
  return format(a, 'yyyy-MM-dd') === format(b, 'yyyy-MM-dd')
}

export function hoyStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
