import React, { createContext, useContext, useState } from "react";

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

      {/* Modal DaisyUI */}
      {state.open && (
        <dialog open className="modal modal-open">
          <div className="modal-box rounded-xl">
            <h3 className="font-bold text-lg mb-3">{state.title}</h3>
            <p className="text-sm mb-6">{state.message}</p>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => handleClose(false)}>
                Annuler
              </button>
              <button className="btn btn-error" onClick={() => handleClose(true)}>
                Confirmer
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => handleClose(false)}>fermer</button>
          </form>
        </dialog>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
