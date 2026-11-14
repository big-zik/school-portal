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
        destructive: 'border-transparent bg-red-100 text-[#BA362A] dark:bg-red-950/60 dark:text-[#E05D50]',
        success: 'border-transparent bg-emerald-100 text-[#047857] dark:bg-emerald-950/60 dark:text-[#22C55E]',
        warning: 'border-transparent bg-amber-100 text-[#8C6314] dark:bg-amber-950/60 dark:text-[#E5B24E]',
        gold: 'border-transparent bg-[#C8962E] text-[#0F2A44] font-bold shadow-sm',
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
