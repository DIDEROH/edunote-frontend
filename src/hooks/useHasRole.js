import { useAuth } from "../context/AuthContext"; // 👈 Ajustez le chemin vers votre AuthContext

export function useHasRole(role) {
  // 1. Protection SSR pour éviter les erreurs hors du navigateur
  if (typeof window === 'undefined') {
    return false;
  }

  // 2. On récupère directement le tableau des rôles réactif du contexte React
  const { roles } = useAuth();

  // 3. Vérification sécurisée
  return Array.isArray(roles) && roles.includes(role);
}
