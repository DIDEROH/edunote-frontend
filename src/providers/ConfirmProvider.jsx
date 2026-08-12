import { createContext, useContext, useState } from "react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    message: "",
    title: "",
    resolve: null,
  });

  // Fonction confirm globale (Promise)
  const confirm = (message, options = {}) =>
    new Promise((resolve) => {
      setState({
        open: true,
        message,
        title: options.title || "Confirmation",
        resolve,
      });
    });

  // Fermer et retourner résultat
  const handleClose = (result) => {
    setState((prev) => {
      if (prev.resolve) prev.resolve(result);
      return { ...prev, open: false, message: "", resolve: null };
    });
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {state.open && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-md rounded-3xl border border-base-300 bg-base-100 shadow-2xl">

            {/* Icône */}
            <div className="flex justify-center mb-5">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-error/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-error"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Titre */}
            <h3 className="text-center text-xl font-bold text-base-content">
              {state.title}
            </h3>

            {/* Message */}
            <p className="mt-3 text-center text-base-content/70 leading-relaxed">
              {state.message}
            </p>

            {/* Boutons */}
            <div className="mt-8 flex gap-3">
              <button
                className="btn btn-outline flex-1 rounded-xl"
                onClick={() => handleClose(false)}
              >
                Annuler
              </button>

              <button
                className="btn btn-error flex-1 rounded-xl text-white"
                onClick={() => handleClose(true)}
              >
                Confirmer
              </button>
            </div>
          </div>

          <form method="dialog" className="modal-backdrop bg-black/40 backdrop-blur-sm">
            <button onClick={() => handleClose(false)}>
              fermer
            </button>
          </form>
        </dialog>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
