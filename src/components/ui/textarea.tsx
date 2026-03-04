import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxCharacters?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, maxCharacters, id, value, defaultValue, onChange, ...props }, ref) => {
    const inputId = id || React.useId();
    const [charCount, setCharCount] = React.useState(() => {
      const initial = (value ?? defaultValue ?? "") as string;
      return initial.length;
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    React.useEffect(() => {
      if (value !== undefined) {
        setCharCount(String(value).length);
      }
    }, [value]);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          className={cn(
            "min-h-[80px] w-full rounded-md border border-border bg-navy-900 px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 transition-colors resize-y",
            "focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
            className
          )}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          maxLength={maxCharacters}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        <div className="flex items-center justify-between">
          {error ? (
            <p id={`${inputId}-error`} className="text-xs text-red-500">
              {error}
            </p>
          ) : (
            <span />
          )}
          {maxCharacters !== undefined && (
            <p
              className={cn(
                "text-xs text-slate-600",
                charCount > maxCharacters * 0.9 && "text-amber-400",
                charCount >= maxCharacters && "text-red-500"
              )}
            >
              {charCount}/{maxCharacters}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
