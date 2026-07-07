import "./Alert.css";

type Tone = "danger" | "warning" | "success";

export function Alert({ tone = "danger", children }: { tone?: Tone; children: string }) {
  return (
    <div className={`ds-alert ds-alert--${tone}`} role="alert">
      {children}
    </div>
  );
}
