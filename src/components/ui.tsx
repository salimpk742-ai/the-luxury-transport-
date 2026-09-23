import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "line" | "whatsapp" | "ghost" | "danger";
};

const buttonVariant = {
  primary: "bg-pine text-paper hover:bg-pine-deep",
  line: "border border-line bg-card text-ink hover:bg-sand",
  whatsapp: "bg-whatsapp text-paper",
  ghost: "text-ink hover:bg-sand",
  danger: "bg-danger text-paper",
};

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariant[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

const control = "h-12 w-full rounded-2xl border border-line bg-card px-3 text-sm text-ink outline-none";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(control, props.className)} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(control, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("w-full rounded-2xl border border-line bg-card px-3 py-3 text-sm text-ink outline-none", props.className)} />;
}

export function Mark({ name }: { name: string }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pine font-display text-lg leading-none text-paper">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function Monogram({ name, className }: { name: string; className?: string }) {
  const letters = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
  return (
    <span className={cn("grid place-items-center rounded-2xl bg-foam font-medium text-pine", className)}>
      {letters || "M"}
    </span>
  );
}
