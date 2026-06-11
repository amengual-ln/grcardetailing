import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Avatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' }
  const iconSizes = { sm: 14, md: 18, lg: 22 }
  return (
    <div className={cn(
      'rounded-full flex items-center justify-center shrink-0',
      sizes[size]
    )}
      style={{ background: 'var(--red-light)', color: 'var(--red)' }}>
      <User size={iconSizes[size]} />
    </div>
  )
}