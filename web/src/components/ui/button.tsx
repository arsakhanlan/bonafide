import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-[-0.01em] transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200 [&:hover_.lucide-arrow-right]:translate-x-0.5 [&:hover_.lucide-plus]:rotate-90 [&:hover_.lucide-rotate-ccw]:-rotate-90',
  {
    variants: {
      variant: {
        default: 'btn-raised btn-sheen bg-primary text-primary-foreground hover:bg-primary/92',
        primary:
          'btn-raised btn-sheen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white hover:from-emerald-400 hover:via-emerald-500 hover:to-teal-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-500 dark:text-slate-950 dark:hover:from-emerald-300 dark:hover:via-emerald-400 dark:hover:to-teal-400',
        destructive:
          'btn-raised btn-raised-rose btn-sheen bg-gradient-to-br from-rose-500 to-rose-700 text-white hover:from-rose-400 hover:to-rose-600 dark:from-rose-500 dark:to-rose-700 dark:hover:from-rose-400 dark:hover:to-rose-600',
        outline:
          'btn-sweep border border-border bg-card/90 shadow-xs hover:border-emerald-500/40 hover:text-foreground hover:shadow-sm',
        secondary:
          'btn-sweep bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'btn-sweep hover:text-foreground',
        link: 'h-auto rounded-none p-0 text-primary underline-offset-4 hover:underline',
        success:
          'btn-raised btn-sheen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white hover:from-emerald-400 hover:via-emerald-500 hover:to-teal-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-500 dark:text-slate-950 dark:hover:from-emerald-300 dark:hover:via-emerald-400 dark:hover:to-teal-400',
        sovereign:
          'btn-raised btn-sheen bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white hover:from-emerald-600 hover:via-emerald-500 hover:to-teal-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-400 dark:text-slate-950',
      },
      size: {
        default: 'h-11 px-4 py-2 sm:h-10',
        sm: 'h-10 px-4 text-[13px] sm:h-9 sm:px-3.5 sm:text-xs',
        lg: 'h-12 px-7 text-sm font-bold',
        icon: 'h-11 w-11 min-h-11 min-w-11 p-0 sm:h-10 sm:w-10',
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
