"use client";

import type { SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@ba33/ui-web";

const controlClassName =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function WorkflowField({
  children,
  hint,
  label,
}: Readonly<{
  children: React.ReactNode;
  hint?: string;
  label: string;
}>) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function WorkflowSelect({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlClassName, className)} {...props} />;
}

export function WorkflowTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function ActionFeedback({
  message,
  tone = "default",
}: Readonly<{
  message: string;
  tone?: "default" | "destructive" | "success";
}>) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        tone === "destructive" &&
          "border-destructive/30 bg-destructive/5 text-destructive",
        tone === "success" && "border-primary/30 bg-primary/5 text-primary",
        tone === "default" && "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      {message}
    </div>
  );
}
