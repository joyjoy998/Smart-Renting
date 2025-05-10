import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

type AsTag = "p" | "div" | "span";

type Props<T extends AsTag> = React.ComponentProps<T> & {
  as?: T;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}
export function DialogTrigger({ children }: { children: React.ReactNode }) {
  return <DialogPrimitive.Trigger asChild>{children}</DialogPrimitive.Trigger>;
}
export function DialogContent({
  className,
  title,
  description,
  children,
}: {
  className?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0" />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[1002]">
        <DialogPrimitive.Content
          className={cn(
            "bg-white bg-background p-6 rounded-lg shadow-lg w-full max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl max-h-[90vh] overflow-y-auto relative",
            "dark:ring-1 dark:ring-blue-500/20 dark:ring-opacity-30",
            className
          )}
          aria-describedby={description ? "dialog-description" : undefined}
        >
          <DialogPrimitive.Title className="text-lg font-semibold">
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description
              id="dialog-description"
              className="text-sm  text-gray-500  dark:text-gray-300"
            >
              {description}
            </DialogPrimitive.Description>
          )}
          {children}
          <DialogPrimitive.Close className="absolute top-3 right-3 text-gray-500  dark:text-gray-300 hover:text-gray-700">
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <DialogPrimitive.Title className="text-lg font-semibold">
      {children}
    </DialogPrimitive.Title>
  );
}

export function DialogDescription<T extends AsTag = "p">({
  as,
  className,
  children,
  ...props
}: Props<T>) {
  const Comp = as || "span";

  return (
    <DialogPrimitive.Description asChild>
      <Comp
        className={cn("text-sm text-gray-500", className)}
        {...(props as any)}
      >
        {children}
      </Comp>
    </DialogPrimitive.Description>
  );
}
