import { Button } from "./Button";
import "./ConfirmDialog.css";

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="ds-dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="ds-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ds-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="ds-dialog-title" className="ds-dialog__title">
          {title}
        </h3>
        <p className="ds-dialog__description">{description}</p>
        <div className="ds-dialog__actions">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
