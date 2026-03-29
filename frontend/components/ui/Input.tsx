"use client";

import { type InputHTMLAttributes } from "react";
import { FormError } from "@/components/ui/FormError";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string[];
};

export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-1 ${
          error && error.length > 0
            ? "border-red-500 focus:ring-red-500"
            : "border-zinc-300 dark:border-zinc-600"
        } bg-white dark:bg-zinc-800 dark:text-zinc-100 ${className}`}
        {...props}
      />
      <FormError messages={error} />
    </div>
  );
}
