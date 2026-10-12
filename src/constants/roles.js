export const ROLE_CONFIG = {
  ADMIN: {
    label: "Administrateur",
    dot: "bg-error",
  },
  MODERATOR: {
    label: "Assistant d'établissement",
    dot: "bg-warning",
  },
  TEACHER: {
    label: "Enseignant",
    dot: "bg-info",
  },
  DIRECTOR: {
    label: "Chef d'établissement",
    dot: "bg-secondary",
  },
  STUDENT: {
    label: "Élève",
    dot: "bg-accent",
  },
  USER: {
    label: "Utilisateur",
    dot: "bg-base-content/30",
  },
};

// Par sécurité, si un rôle est inconnu, on peut renvoyer un état neutre
export const DEFAULT_ROLE = {
  label: "Utilisateur",
  dot: "bg-base-content/30",
};

export const getRoleConfig = (roleName) => ROLE_CONFIG[roleName?.toUpperCase()] || DEFAULT_ROLE;
