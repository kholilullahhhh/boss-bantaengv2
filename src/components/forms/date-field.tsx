"use client";

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/forms/field-error";

interface DateFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  disabled?: boolean;
  required?: boolean;
}

export function DateField<T extends FieldValues>({
  control,
  name,
  label,
  disabled,
  required,
}: DateFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </Label>
          <Input
            id={name}
            type="date"
            disabled={disabled}
            aria-invalid={!!fieldState.error}
            {...field}
            value={typeof field.value === "string" ? field.value : ""}
          />
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}
