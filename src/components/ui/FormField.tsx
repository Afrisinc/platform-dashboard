import { ReactNode } from "react";
import { Input } from "@/components/ui/input";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  children?: ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: "text" | "email" | "tel" | "number" | "textarea";
  placeholder?: string;
  disabled?: boolean;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  children,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children || (type === "textarea" ? (
        <textarea
          id={htmlFor}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border rounded-md text-sm disabled:bg-gray-50"
          rows={3}
        />
      ) : (
        <Input
          id={htmlFor}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
