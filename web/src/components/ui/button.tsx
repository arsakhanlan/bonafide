import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-[-0.01em] transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'btn-raised btn-sheen bg-primary text-primary-foreground hover:bg-primary/92',
        primary:
          'btn-raised btn-sheen bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400',
        destructive:
          'btn-raised btn-raised-rose btn-sheen bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-600 dark:hover:bg-rose-500',
        outline:
          'border border-border bg-card/90 shadow-xs hover:-translate-y-px hover:border-border hover:bg-secondary hover:text-foreground hover:shadow-sm',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:-translate-y-px hover:bg-secondary/80',
        ghost: 'hover:bg-secondary hover:text-foreground',
        link: 'h-auto rounded-none p-0 text-primary underline-offset-4 hover:underline',
        success:
          'btn-raised btn-sheen bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400',
        sovereign:
          'btn-raised btn-sheen bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white hover:from-emerald-600 hover:via-emerald-500 hover:to-teal-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-400 dark:text-slate-950',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3.5 text-xs',
        lg: 'h-12 px-7 text-sm font-bold',
        icon: 'h-10 w-10 min-h-10 min-w-10 p-0',
      },
      defaultVariants: {
        variant: 'default',
        size: 'default',
      },
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
