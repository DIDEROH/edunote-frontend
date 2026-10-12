/**
 * État de connexion partagé entre AxiosClient (qui le met à jour) et
 * l'interface (bandeau hors ligne, compteur de synchronisation).
 *
 * navigator.onLine ne suffit pas : on peut avoir du réseau sans joindre
 * le serveur (coupure côté hébergeur, Wi-Fi sans internet...). On retient
 * donc aussi le résultat du dernier appel à l'API.
 */
export const CONNECTIVITY_EVENT = "edunote:connectivity";
export const OUTBOX_EVENT = "edunote:outbox-changed";

const USER_KEY = "user_data_edunote";

let serverReachable = true;

export function setServerReachable(reachable) {
  if (serverReachable === reachable) return;
  serverReachable = reachable;
  window.dispatchEvent(new Event(CONNECTIVITY_EVENT));
}

export const isServerReachable = () => serverReachable;

export const isOnline = () => (typeof navigator === "undefined" ? true : navigator.onLine);

// Identifiant de l'utilisateur connecté (pour cloisonner la file d'attente par compte)
export function getCurrentUserId() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null")?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Erreur réseau = la requête n'a pas obtenu de réponse du serveur
 * (hors ligne, serveur injoignable, délai dépassé).
 */
export function isNetworkError(error) {
  return Boolean(error?.isNetworkError) || (!error?.response && (
    error?.code === "ERR_NETWORK" ||
    error?.code === "ECONNABORTED" ||
    error?.message === "Network Error"
  ));
}
