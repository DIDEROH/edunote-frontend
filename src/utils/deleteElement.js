import { api } from './AxiosClient';
import { toast } from 'sonner';

/**
 * Fonction globale de suppression
 * @param {string} ressource - Le nom de la ressource (ex: 'schools')
 * @param {string|number} id - L'identifiant à supprimer
 * @param {function} showConfirm - Le hook de confirmation passé depuis le composant
 * @param {object} callbacks - Les fonctions de cycle de vie (onStart, onSuccess, onFinally)
 */
export async function deleteElement(ressource, id, message, showConfirm, { onStart, onSuccess, onFinally } = {}) {
  showConfirm({
    title: "Supprimer",
    message: `Voulez-vous vraiment supprimer ${message} ?`,
    onSuccess: async () => {
      if (onStart) onStart(); // Remplace l()
      try {
        // Utilisation de la variable dynamic 'ressource' au lieu de 'schools' en dur
        const { data } = await api.delete(`/${ressource}/${id}`);
        toast.success(data.message || "Supprimé avec succès !");
        if (onSuccess) onSuccess(); // Remplace f()
      } catch (err) {
        toast.error(err.response?.data?.message || "Erreur lors de la suppression");
      } finally {
        if (onFinally) onFinally(); // Remplace lf()
      }
    },
    onError: () => {
        toast.info("Merci d'avoir changé d'avis 😊");
    }
  });
}
