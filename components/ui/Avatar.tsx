import { cn } from '@/lib/utils'
import { getInitiales } from '@/lib/utils'

export function Avatar({ nombre, size = 'md' }: { nombre: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }
  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-medium shrink-0',
      sizes[size]
    )}
      style={{ background: 'var(--red-light)', color: 'var(--red)' }}>
      {getInitiales(nombre)}
    </div>
  )
}