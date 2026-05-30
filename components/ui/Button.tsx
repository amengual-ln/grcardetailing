import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-lg border transition-all cursor-pointer',
          'dark:border-[var(--border)]',
          size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
          variant === 'primary' && [
            'bg-[var(--red)] border-[var(--red)] text-white',
            'hover:bg-[var(--red-dark)] hover:border-[var(--red-dark)]',
            'dark:bg-[var(--red-dark)] dark:border-[var(--red-dark)] dark:hover:bg-[var(--red)]',
          ],
          variant === 'ghost' && [
            'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text)]',
            'hover:bg-[var(--bg-hover)]',
            'dark:hover:bg-[var(--bg-hover)]',
          ],
          variant === 'danger' && [
            'bg-[var(--bg-card)] border-[var(--danger-border)] text-[var(--danger-text)]',
            'hover:bg-[var(--danger-bg)]',
            'dark:border-[var(--danger-border)] dark:text-[var(--danger-text)] dark:hover:bg-[var(--danger-bg)]',
          ],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'