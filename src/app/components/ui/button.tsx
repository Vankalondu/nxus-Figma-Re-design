import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-border-focus focus-visible:ring-border-focus/50 focus-visible:ring-[3px] aria-invalid:ring-status-error/20 dark:aria-invalid:ring-status-error/40 aria-invalid:border-status-error",
  {
    variants: {
      variant: {
        default: "bg-brand-primary text-text-inverse hover:bg-brand-primary/90",
        destructive:
          "bg-status-error text-text-on-brand hover:bg-status-error/90 focus-visible:ring-status-error/20 dark:focus-visible:ring-status-error/40 dark:bg-status-error/60",
        outline:
          "border bg-surface-page text-text-heading hover:bg-surface-accent hover:text-text-heading dark:bg-border-input/30 dark:border-border-input dark:hover:bg-border-input/50",
        secondary:
          "bg-surface-canvas text-text-heading hover:bg-surface-canvas/80",
        ghost:
          "hover:bg-surface-accent hover:text-text-heading dark:hover:bg-surface-accent/50",
        link: "text-brand-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
