"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BaseFieldProps {
  id: string;
  label: string;
  helperText?: string;
  error?: string;
  requiredMark?: boolean;
  containerClassName?: string;
}

export type FormInputProps = BaseFieldProps &
  React.InputHTMLAttributes<HTMLInputElement> & {
    trailingSlot?: React.ReactNode;
    leadingSlot?: React.ReactNode;
  };

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ id, label, helperText, error, requiredMark, className, trailingSlot, leadingSlot, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("space-y-1", containerClassName)}>
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
          {(props.required || requiredMark) && <span className="ml-1 text-destructive">*</span>}
        </label>
        <div
          className={cn(
            "flex items-center rounded-xl border border-border bg-background px-3 py-2 text-sm focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/40",
            error && "border-destructive/70 focus-within:border-destructive focus-within:ring-destructive/40",
            props.disabled && "opacity-70",
            className
          )}
        >
          {leadingSlot && <span className="mr-2 text-muted-foreground">{leadingSlot}</span>}
          <input
            id={id}
            ref={ref}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            {...props}
          />
          {trailingSlot && <span className="ml-2 text-muted-foreground">{trailingSlot}</span>}
        </div>
        {error ? (
          <p className="text-xs font-semibold text-destructive">{error}</p>
        ) : (
          helperText && <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);
FormInput.displayName = "FormInput";

export type FormSelectOption = {
  label: string;
  value: string | number;
};

export type FormSelectProps = BaseFieldProps &
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    options: FormSelectOption[];
    placeholder?: string;
  };

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ id, label, helperText, error, options, placeholder, requiredMark, className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("space-y-1", containerClassName)}>
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
          {(props.required || requiredMark) && <span className="ml-1 text-destructive">*</span>}
        </label>
        <div
          className={cn(
            "rounded-xl border border-border bg-background px-3 py-2 text-sm focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/40",
            error && "border-destructive/70 focus-within:border-destructive focus-within:ring-destructive/40",
            className
          )}
        >
          <select
            id={id}
            ref={ref}
            className="w-full bg-transparent text-foreground outline-none"
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error ? (
          <p className="text-xs font-semibold text-destructive">{error}</p>
        ) : (
          helperText && <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);
FormSelect.displayName = "FormSelect";

export type FormTextAreaProps = BaseFieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const FormTextArea = React.forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  ({ id, label, helperText, error, requiredMark, className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("space-y-1", containerClassName)}>
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
          {(props.required || requiredMark) && <span className="ml-1 text-destructive">*</span>}
        </label>
        <textarea
          id={id}
          ref={ref}
          className={cn(
            "min-h-[90px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40",
            error && "border-destructive/70 focus:border-destructive focus:ring-destructive/40",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs font-semibold text-destructive">{error}</p>
        ) : (
          helperText && <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);
FormTextArea.displayName = "FormTextArea";
