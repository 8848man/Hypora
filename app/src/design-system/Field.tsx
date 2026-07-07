import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import "./Field.css";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextField({ label, id, className, ...rest }: TextFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="ds-field">
      <label className="ds-field__label" htmlFor={fieldId}>
        {label}
      </label>
      <input id={fieldId} className={["ds-field__input", className].filter(Boolean).join(" ")} {...rest} />
    </div>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function TextArea({ label, hint, id, className, ...rest }: TextAreaProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="ds-field">
      <label className="ds-field__label" htmlFor={fieldId}>
        {label}
      </label>
      {hint && <p className="ds-field__hint">{hint}</p>}
      <textarea
        id={fieldId}
        className={["ds-field__textarea", className].filter(Boolean).join(" ")}
        rows={4}
        {...rest}
      />
    </div>
  );
}
