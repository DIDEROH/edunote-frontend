import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";

/**
 * Service worker (application disponible hors ligne) et installation de la PWA.
 */
export const INSTALL_EVENT = "edunote:install-available";

let deferredInstallPrompt = null;

export function registerPwa() {
  if (typeof window === "undefined") return;

  // Chrome/Edge/Android : on garde l'invite d'installation pour la proposer
  // depuis le menu utilisateur plutôt qu'au chargement de la page.
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    window.dispatchEvent(new Event(INSTALL_EVENT));
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    window.dispatchEvent(new Event(INSTALL_EVENT));
  });

  const updateServiceWorker = registerSW({
    // Mise à jour proposée (et non imposée) pour ne pas interrompre une saisie en cours
    onNeedRefresh() {
      toast.info("Une nouvelle version d'EduNote est disponible.", {
        duration: Infinity,
        action: {
          label: "Mettre à jour",
          onClick: () => updateServiceWorker(true),
        },
      });
    },
    onOfflineReady() {
      toast.success("EduNote est prêt à fonctionner hors ligne.");
    },
  });
}

export const canInstall = () => deferredInstallPrompt !== null;

export async function promptInstall() {
  if (!deferredInstallPrompt) return false;

  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  window.dispatchEvent(new Event(INSTALL_EVENT));

  return outcome === "accepted";
}
