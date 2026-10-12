import { useEffect, useState } from "react";
import { INSTALL_EVENT, canInstall, promptInstall } from "../utils/pwa";

// Indique si l'application peut être installée et expose l'action d'installation
export default function useInstallPrompt() {
  const [installable, setInstallable] = useState(canInstall());

  useEffect(() => {
    const update = () => setInstallable(canInstall());
    window.addEventListener(INSTALL_EVENT, update);
    return () => window.removeEventListener(INSTALL_EVENT, update);
  }, []);

  return { installable, install: promptInstall };
}
