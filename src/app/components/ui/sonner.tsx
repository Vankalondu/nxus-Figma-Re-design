"use client";

import { useTheme } from "next-themes@0.4.6";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--surface-elevated)",
          "--normal-text": "var(--text-heading)",
          "--normal-border": "var(--border-default)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
