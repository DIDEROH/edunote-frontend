import { useAuth } from "../context/AuthContext";

export function useHasRole(requiredRole) {
  const { roles, loading } = useAuth();

  if (loading || !roles || !Array.isArray(roles)) return false;

  // Fonction de sécurité pour extraire le texte du rôle
  const getRoleName = (role) => {
    if (typeof role === "string") return role;
    if (role && typeof role === "object" && role.name) return role.name;
    return ""; // Retourne vide si le format est inconnu
  };

  const checkRole = (targetRole) => {
    return roles.some(userRole => 
      getRoleName(userRole).toLowerCase() === targetRole.toLowerCase()
    );
  };

  if (Array.isArray(requiredRole)) {
    return requiredRole.some(role => checkRole(role));
  }

  return checkRole(requiredRole);
}