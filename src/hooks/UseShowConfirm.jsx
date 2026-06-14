// src/useShowConfirm.js
import { useConfirm } from "../providers/ConfirmProvider";

export default function useShowConfirm() {
  const confirm = useConfirm();

  /**
   * showConfirm(options)
   * @param {Object} options
   * @param {string} options.title - Titre du modal
   * @param {string} options.message - Message du modal
   * @param {Function} [options.onSuccess] - Fonction appelée si l'utilisateur confirme
   * @param {Function} [options.onError] - Fonction appelée si l'utilisateur annule
   */
  const showConfirm = async ({ title, message, onSuccess, onError }) => {
    const ok = await confirm(message, { title });

    if (ok) {
      onSuccess?.();
    } else {
      onError?.();
    }
  };

  return showConfirm;
}
