"use client";

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/forms/field-error";

const NONE_VALUE = "__none__";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  /** Tampilkan opsi "Tanpa folder" dengan nilai string kosong. */
  showNone?: boolean;
  noneLabel?: string;
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = "Pilih…",
  disabled,
  showNone,
  noneLabel = "Tanpa folder",
}: SelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const raw: string = typeof field.value === "string" ? field.value : "";
        const selected = raw === "" ? (showNone ? NONE_VALUE : "") : raw;

        return (
          <div className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Select
              value={selected}
              onValueChange={(value) => field.onChange(value === NONE_VALUE ? "" : value)}
              disabled={disabled}
            >
              <SelectTrigger id={name} className="w-full" aria-invalid={!!fieldState.error}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {showNone && <SelectItem value={NONE_VALUE}>{noneLabel}</SelectItem>}
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={fieldState.error?.message} />
          </div>
        );
      }}
    />
  );
}
