import { toast } from "sonner";
import axiosClient from "../AxiosClient";
import { listOutbox, removeEntry } from "./outbox";
import { CONNECTIVITY_EVENT, OUTBOX_EVENT, getCurrentUserId, isNetworkError, isOnline, isServerReachable } from "./status";

/**
 * Envoi de la file d'attente hors ligne dès que le réseau revient.
 */
const RETRY_INTERVAL = 60 * 1000;

let syncing = false;

export const isSyncing = () => syncing;

export async function flushOutbox() {
  const userId = getCurrentUserId();
  if (syncing || !isOnline() || !userId) return;

  const entries = await listOutbox(userId);
  if (entries.length === 0) return;

  syncing = true;
  window.dispatchEvent(new Event(OUTBOX_EVENT));

  let sent = 0;
  const rejected = [];

  try {
    for (const entry of entries) {
      try {
        await axiosClient.request({
          method: entry.method,
          url: entry.url,
          data: entry.data,
          offlineCache: false,
        });

        await removeEntry(entry.id);
        // La saisie est en base : le brouillon local de cette grille n'a plus lieu d'être
        if (entry.meta?.draftKey) localStorage.removeItem(entry.meta.draftKey);
        sent++;
      } catch (error) {
        // Toujours injoignable, ou session expirée : on réessaiera plus tard (après reconnexion)
        if (isNetworkError(error) || error.status === 401) break;

        // Refus définitif du serveur (droits, validation...) : on retire l'entrée pour
        // ne pas bloquer la file. Le brouillon local est conservé pour correction.
        await removeEntry(entry.id);
        rejected.push(`${entry.label} : ${error.message}`);
      }
    }
  } finally {
    syncing = false;
    window.dispatchEvent(new Event(OUTBOX_EVENT));
  }

  if (sent > 0) {
    toast.success(sent > 1
      ? `${sent} enregistrements faits hors ligne ont été synchronisés.`
      : "L'enregistrement fait hors ligne a été synchronisé.");
  }

  rejected.forEach((message) => toast.error(`Synchronisation refusée — ${message}`, { duration: 10000 }));
}

/**
 * Déclenche la synchronisation au démarrage, au retour du réseau, quand
 * le serveur redevient joignable, et périodiquement tant qu'il reste
 * des éléments en attente. Renvoie la fonction de nettoyage.
 */
export function startAutoSync() {
  const trigger = () => {
    flushOutbox();
  };

  const onConnectivity = () => {
    if (isServerReachable()) trigger();
  };

  window.addEventListener("online", trigger);
  window.addEventListener(CONNECTIVITY_EVENT, onConnectivity);
  const interval = setInterval(trigger, RETRY_INTERVAL);
  trigger();

  return () => {
    window.removeEventListener("online", trigger);
    window.removeEventListener(CONNECTIVITY_EVENT, onConnectivity);
    clearInterval(interval);
  };
}
