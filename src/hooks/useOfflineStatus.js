import { useEffect, useState } from "react";
import { pendingCount } from "../utils/offline/outbox";
import { CONNECTIVITY_EVENT, OUTBOX_EVENT, isOnline, isServerReachable } from "../utils/offline/status";
import { flushOutbox, isSyncing } from "../utils/offline/sync";

/**
 * État hors ligne pour l'interface : connexion, serveur joignable,
 * nombre d'enregistrements en attente de synchronisation.
 */
export default function useOfflineStatus() {
  const [online, setOnline] = useState(isOnline());
  const [reachable, setReachable] = useState(isServerReachable());
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(isSyncing());

  useEffect(() => {
    const updateOnline = () => setOnline(isOnline());
    const updateReachable = () => setReachable(isServerReachable());
    const refreshOutbox = () => {
      pendingCount().then((count) => {
        setPending(count);
        setSyncing(isSyncing());
      });
    };

    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    window.addEventListener(CONNECTIVITY_EVENT, updateReachable);
    window.addEventListener(OUTBOX_EVENT, refreshOutbox);
    refreshOutbox();

    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
      window.removeEventListener(CONNECTIVITY_EVENT, updateReachable);
      window.removeEventListener(OUTBOX_EVENT, refreshOutbox);
    };
  }, []);

  return {
    online,
    reachable,
    offline: !online || !reachable,
    pending,
    syncing,
    sync: flushOutbox,
  };
}
