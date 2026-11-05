"use client";

import { useId } from "react";
import { classNames } from "@/lib/format";

const CONTROL =
  "w-full rounded-lg border border-hair-strong bg-surface px-3.5 text-body-sm text-ink placeholder:text-graphite-light transition-colors hover:border-graphite-light focus-visible:border-navy disabled:bg-sand/50 disabled:text-graphite";

function FieldShell({
  id,
  label,
  hint,
  error,
  required: isRequired,
  optional,
  children,
  className
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={classNames("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline gap-2 text-caption font-medium text-ink">
        {label}
        {isRequired && <span className="text-danger">*</span>}
        {optional && <span className="text-caption text-graphite-light">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="text-caption text-graphite">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="flex items-start gap-1.5 text-caption font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

interface BaseProps {
  label: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
  className?: string;
}

export function TextField({
  label,
  hint,
  error,
  optional,
  className,
  inputClassName,
  id,
  required,
  ...rest
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement> & { inputClassName?: string }) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required} optional={optional} className={className}>
      <input
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={classNames(CONTROL, "h-11", inputClassName, error && "border-danger focus-visible:border-danger")}
        {...rest}
      />
    </FieldShell>
  );
}

/** Indian mobile entry with a fixed +91 prefix and a 48px hit target. */
export function PhoneField({
  label,
  hint,
  error,
  optional,
  className,
  id,
  required,
  ...rest
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required} optional={optional} className={className}>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-body-sm text-graphite">
          +91
        </span>
        <input
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={classNames(CONTROL, "h-12 pl-12", error && "border-danger focus-visible:border-danger")}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}

export function TextArea({
  label,
  hint,
  error,
  optional,
  className,
  id,
  rows = 4,
  ...rest
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={classNames(CONTROL, "py-2.5 leading-relaxed", error && "border-danger")}
        {...rest}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  optional,
  className,
  id,
  options,
  placeholder,
  ...rest
}: BaseProps & { options: { value: string; label: string }[]; placeholder?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} optional={optional} className={className}>
      <select
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={classNames(CONTROL, "h-11 appearance-none bg-[length:0.75rem] pr-9", error && "border-danger")}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 4.5 6 8.5l4-4' fill='none' stroke='%2369675F' stroke-width='1.4'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.875rem center"
        }}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  hint,
  error,
  className,
  id,
  ...rest
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className={classNames("flex flex-col gap-1", className)}>
      <div className="flex items-start gap-2.5">
        <input
          id={fieldId}
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded-[2px] border border-hair-strong bg-surface transition-colors checked:border-blue checked:bg-blue checked:bg-[length:0.7rem] checked:bg-[position:center] checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20d=%27M2.5%206.2%204.8%208.5%209.5%203.8%27%20fill=%27none%27%20stroke=%27%23FFFFFF%27%20stroke-width=%271.6%27/%3E%3C/svg%3E')]"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...rest}
        />
        <label htmlFor={fieldId} className="cursor-pointer text-body-sm text-ink">
          {label}
        </label>
      </div>
      {hint && !error && <p className="pl-6.5 text-caption text-graphite">{hint}</p>}
      {error && (
        <p id={`${fieldId}-error`} role="alert" className="pl-6.5 text-caption font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function RadioCard({
  name,
  value,
  checked,
  title,
  description,
  meta,
  disabled,
  onChange
}: {
  name: string;
  value: string;
  checked: boolean;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={classNames(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors",
        checked ? "border-blue bg-blue-wash" : "border-hair bg-surface hover:border-hair-strong",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="mt-1 size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-hair-strong bg-surface transition-colors checked:border-blue checked:bg-[radial-gradient(circle,rgb(var(--c-blue))_0_45%,transparent_45%)]"
      />
      <span className="flex flex-1 flex-col gap-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-body-sm font-medium text-ink">{title}</span>
          {meta && <span className="tabular text-caption text-graphite">{meta}</span>}
        </span>
        {description && <span className="text-caption leading-relaxed text-graphite">{description}</span>}
      </span>
    </label>
  );
}
