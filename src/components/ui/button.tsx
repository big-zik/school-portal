import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[var(--cgs-primary)] text-[var(--cgs-on-primary)] hover:bg-[var(--cgs-primary-hover)] shadow-sm active:scale-[0.98]',
        destructive: 'bg-[var(--cgs-danger)] text-[var(--cgs-on-danger)] hover:opacity-90 shadow-sm active:scale-[0.98]',
        outline: 'border border-[var(--cgs-control)] bg-transparent hover:bg-[var(--cgs-surface-subtle)] text-[var(--cgs-text)]',
        secondary: 'bg-[var(--cgs-surface-subtle)] text-[var(--cgs-text)] hover:opacity-90 border border-[var(--cgs-border)]',
        ghost: 'hover:bg-[var(--cgs-surface-subtle)] text-[var(--cgs-text)]',
        link: 'text-[var(--cgs-primary)] underline-offset-4 hover:underline',
        success: 'bg-[var(--cgs-success)] text-[var(--cgs-on-success)] hover:opacity-90 shadow-sm active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base font-semibold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
