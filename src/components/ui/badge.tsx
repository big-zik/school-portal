import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[var(--cgs-tint)] text-[var(--cgs-primary)] border border-[var(--cgs-sky)]/30',
        secondary: 'border-transparent bg-[var(--cgs-surface-subtle)] text-[var(--cgs-text)] border border-[var(--cgs-border)]',
        destructive: 'border-transparent bg-[var(--cgs-danger-soft)] text-[var(--cgs-danger)]',
        success: 'border-transparent bg-[var(--cgs-success-soft)] text-[var(--cgs-success)]',
        warning: 'border-transparent bg-[var(--cgs-warning-soft)] text-[var(--cgs-warning)]',
        gold: 'border-transparent bg-[var(--cgs-gold)] text-[var(--cgs-on-accent)] font-bold shadow-sm',
        outline: 'text-[var(--cgs-text)] border border-[var(--cgs-border)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
