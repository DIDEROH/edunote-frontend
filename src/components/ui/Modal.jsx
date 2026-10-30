import { X } from "lucide-react";

/**
 * Fenêtre modale au style EduNote : fond assombri, boîte plate
 * `bg-base-200`, plein écran sur mobile.
 */
export default function Modal({ open, title, subtitle, icon: Icon, onClose, children, footer, size = "max-w-lg" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`flex h-full w-full flex-col overflow-hidden bg-base-200 sm:h-auto sm:max-h-[90vh] sm:rounded-md ${size}`}>
        <div className="flex items-start justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon size={18} />
              </div>
            )}
            <div>
              <h2 className="text-base font-semibold text-base-content">{title}</h2>
              {subtitle && <p className="mt-0.5 text-xs text-base-content/50">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-base-content/50 transition-colors duration-150 hover:bg-base-300 hover:text-base-content"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>

        {footer && <div className="flex flex-wrap items-center justify-end gap-3 p-6 pt-0">{footer}</div>}
      </div>
    </div>
  );
}
