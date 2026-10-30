import { createContext, useContext, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { popIn } from "../components/motion/variants";

const ConfirmContext = createContext(null);

// Action destructrice : bouton et icône en rouge
const DANGER = /supprim|annul|retir|déconnex|refus|efface/i;

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, message: "", title: "" });
  const resolver = useRef(null);

  // Fonction confirm globale (Promise)
  const confirm = (message, options = {}) =>
    new Promise((resolve) => {
      resolver.current = resolve;
      setState({ open: true, message, title: options.title || "Confirmation" });
    });

  // Fermer et retourner le résultat
  const handleClose = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setState((prev) => ({ ...prev, open: false }));
  };

  const danger = DANGER.test(state.title);
  const Icon = danger ? AlertTriangle : HelpCircle;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AnimatePresence>
        {state.open && (
          <m.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-night/60 p-4 backdrop-blur-sm"
            role="alertdialog"
            aria-modal="true"
            aria-label={state.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => event.target === event.currentTarget && handleClose(false)}
          >
            <m.div variants={popIn} initial="hidden" animate="show" exit="exit" className="surface w-full max-w-md p-6 text-center">
              <div className={`mx-auto grid size-14 place-items-center rounded-2xl ${danger ? "bg-error/10 text-error" : "bg-primary/10 text-primary"}`}>
                <Icon size={26} />
              </div>
              <h3 className="mt-4 text-base font-semibold">{state.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-base-content/65">{state.message}</p>

              <div className="mt-6 flex flex-col-reverse justify-center gap-2.5 sm:flex-row">
                <button type="button" autoFocus={danger} className="ui-btn ui-btn-soft" onClick={() => handleClose(false)}>
                  Annuler
                </button>
                <button type="button" autoFocus={!danger} className={`ui-btn ${danger ? "ui-btn-danger-solid" : "ui-btn-primary"}`} onClick={() => handleClose(true)}>
                  Confirmer
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
