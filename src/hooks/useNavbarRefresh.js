import { useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";

/**
 * Bouton « Actualiser » de la barre du haut : relance les requêtes de la page
 * sans recharger la page ni remonter ses composants (filtres, saisies et
 * position de défilement sont conservés).
 *
 * refresh : fonction appelée au clic. Si elle renvoie une promesse, l'icône
 *           tourne jusqu'à sa fin ; si la promesse échoue, son message est
 *           affiché. Passer null pour masquer le bouton (ex. formulaire ouvert).
 *
 * La fonction la plus récente est toujours appelée (elle voit donc les
 * filtres et la page courante) sans réenregistrer le bouton à chaque rendu.
 */
export default function useNavbarRefresh(refresh) {
  const { setNavbarRefresh } = useOutletContext();
  const refreshRef = useRef(refresh);
  const enabled = typeof refresh === "function";

  useEffect(() => {
    refreshRef.current = refresh;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    setNavbarRefresh(() => () => refreshRef.current?.());
    return () => setNavbarRefresh(null);
  }, [enabled, setNavbarRefresh]);
}
