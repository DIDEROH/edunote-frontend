import { useEffect } from "react";
import { AnimatePresence, m } from "motion/react";
import { X } from "lucide-react";
import { popIn } from "../motion/variants";

/**
 * Fenêtre modale : panneau clair sur un voile flouté, ouverture animée,
 * plein écran sur téléphone. Échap ferme la fenêtre.
 */
export default function Modal({ open, title, subtitle, icon: Icon, onClose, children, footer, size = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-night/60 p-0 backdrop-blur-sm sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
        >
          <m.div
            variants={popIn}
            initial="hidden"
            animate="show"
            exit="exit"
            className={`surface flex h-full w-full flex-col overflow-hidden rounded-none sm:h-auto sm:max-h-[90vh] sm:rounded-2xl ${size}`}
          >
            <div className="flex items-start justify-between gap-4 p-6 pb-4">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-primary/15 to-glow-cyan/15 text-primary ring-1 ring-primary/15">
                    <Icon size={19} />
                  </div>
                )}
                <div>
                  <h2 className="text-base font-semibold">{title}</h2>
                  {subtitle && <p className="mt-0.5 text-xs text-base-content/55">{subtitle}</p>}
                </div>
              </div>
              <button type="button" onClick={onClose} className="ui-icon-btn ui-icon-btn-sm -mt-1 -mr-2" aria-label="Fermer">
                <X size={17} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>

            {footer && <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-base-300 bg-base-100/60 px-6 py-4">{footer}</div>}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
