import { useEffect, useState, useSyncExternalStore } from "react";
import { pendingRequests, subscribeRequests } from "../../utils/requestActivity";

/**
 * Bande fine et lumineuse en haut de l'écran tant qu'une requête est en cours.
 * N'apparaît qu'après un court délai : rien ne clignote pour une réponse immédiate.
 */
export default function TopProgress({ delay = 250 }) {
  const busy = useSyncExternalStore(subscribeRequests, () => pendingRequests() > 0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(busy), busy ? delay : 120);
    return () => clearTimeout(timer);
  }, [busy, delay]);

  return visible ? <div className="top-progress" role="progressbar" aria-label="Chargement en cours" /> : null;
}
