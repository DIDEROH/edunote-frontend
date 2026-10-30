import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSkeletoon from "../components/LoadingSkeletoon";

/**
 * Bloque l'accès à un écran par URL directe si le rôle de l'utilisateur
 * connecté ne fait pas partie de `allow`. Le backend reste la seule
 * vraie barrière de sécurité (il refuse déjà les données), mais sans ce
 * garde, n'importe quel compte connecté pouvait ouvrir n'importe quel
 * écran réservé (menu simplement masqué côté React).
 *
 * - `permission` : droit de gestion requis dans l'école (directeur : tous ;
 *   modérateur : ceux accordés par le directeur) ;
 * - `directorOnly` : écran réservé au chef d'établissement.
 *
 * `roles` est toujours stocké en minuscules dans AuthContext.
 */
const RoleRoute = ({ allow, permission, directorOnly = false, children }) => {
  const { roles, loading, can, isSchoolDirector } = useAuth();

  if (loading) return <LoadingSkeletoon />;

  const allowed = Array.isArray(roles) && roles.some((role) => allow.includes(role))
    && (!permission || can(permission))
    && (!directorOnly || isSchoolDirector);

  return allowed ? children : <Navigate to="/403" replace />;
};

export default RoleRoute;
