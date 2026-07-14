import type { InputHTMLAttributes } from "react";
import "./Checkbox.css";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Checkbox({ className, ...rest }: CheckboxProps) {
  return <input type="checkbox" className={["ds-checkbox", className].filter(Boolean).join(" ")} {...rest} />;
}
