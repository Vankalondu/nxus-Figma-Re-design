import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-text-heading placeholder:text-text-body selection:bg-brand-primary selection:text-text-inverse dark:bg-border-input/30 border-border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-surface-input transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-border-focus focus-visible:ring-border-focus/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-status-error/20 dark:aria-invalid:ring-status-error/40 aria-invalid:border-status-error",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
