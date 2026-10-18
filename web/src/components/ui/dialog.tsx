import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { lastModalTrigger } from '@/lib/modalOrigin';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'dialog-overlay fixed inset-0 z-50 bg-black/45 backdrop-blur-sm print:hidden no-print',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  hideDefaultClose?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, hideDefaultClose = false, ...props }, ref) => {
  // Work out where the opening control sits so the sheet can grow out of it.
  const setNode = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (!node) return;

      const trigger = lastModalTrigger();
      if (!trigger) return;

      const width = node.offsetWidth;
      const height = node.offsetHeight;
      if (!width || !height) return;

      // The dialog is fixed at the viewport centre; use that as the final frame.
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      const box = trigger.getBoundingClientRect();

      // The clip starts as a seed matching the button, pulled to the nearest
      // point inside the panel when the control sits outside it.
      const seedCenterX = Math.min(
        Math.max(box.left + box.width / 2, left + 20),
        left + width - 20
      );
      const seedCenterY = Math.min(
        Math.max(box.top + box.height / 2, top + 20),
        top + height - 20
      );
      const seedWidth = Math.min(Math.max(box.width, 36), width * 0.45);
      const seedHeight = Math.min(Math.max(box.height, 22), height * 0.3);

      const insetLeft = Math.max(0, seedCenterX - seedWidth / 2 - left);
      const insetRight = Math.max(0, left + width - (seedCenterX + seedWidth / 2));
      const insetTop = Math.max(0, seedCenterY - seedHeight / 2 - top);
      const insetBottom = Math.max(0, top + height - (seedCenterY + seedHeight / 2));

      const shiftX = (box.left + box.width / 2 - (left + width / 2)) * 0.18;
      const shiftY = (box.top + box.height / 2 - (top + height / 2)) * 0.18;
      const radius = getComputedStyle(trigger).borderTopLeftRadius || '24px';

      node.style.setProperty('--morph-top', `${insetTop}px`);
      node.style.setProperty('--morph-right', `${insetRight}px`);
      node.style.setProperty('--morph-bottom', `${insetBottom}px`);
      node.style.setProperty('--morph-left', `${insetLeft}px`);
      node.style.setProperty('--morph-radius', radius);
      node.style.setProperty('--dialog-shift-x', `${shiftX}px`);
      node.style.setProperty('--dialog-shift-y', `${shiftY}px`);
    },
    [ref]
  );

  return (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={setNode}
      className={cn(
        'dialog-content fixed left-[50%] top-[50%] z-50 grid max-h-[90vh] w-[calc(100%-1.5rem)] max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto rounded-3xl border border-border/80 bg-card p-4 shadow-[0_28px_70px_-24px_rgba(6,34,24,0.45)] ring-1 ring-black/[0.03] dark:ring-white/[0.05] sm:p-6',
        className
      )}
      {...props}
    >
      {children}
      {!hideDefaultClose && (
        <DialogPrimitive.Close className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground opacity-80 ring-offset-background transition-[background-color,opacity,transform] duration-150 hover:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-95 disabled:pointer-events-none print:hidden no-print">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-balance text-lg font-semibold leading-tight tracking-tight text-foreground',
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

