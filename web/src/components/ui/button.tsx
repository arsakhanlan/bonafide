import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 font-semibold active:scale-[0.98]',
        primary:
          'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 font-semibold active:scale-[0.98]',
        destructive:
          'bg-rose-600 text-white shadow-sm hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800 font-semibold active:scale-[0.98]',
        outline:
          'border border-border bg-card shadow-xs hover:bg-secondary hover:text-foreground active:scale-[0.98]',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:scale-[0.98]',
        ghost: 'hover:bg-secondary hover:text-foreground active:scale-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline',
        success:
          'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 font-semibold active:scale-[0.98]',
        sovereign:
          'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white shadow-md hover:shadow-emerald-500/20 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-400 dark:text-slate-950 font-bold active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-8 text-base font-semibold',
        icon: 'h-10 w-10 min-w-10 min-h-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

