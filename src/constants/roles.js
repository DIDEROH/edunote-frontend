export const ROLE_CONFIG = {
  ADMIN: {
    label: "Administrateur",
    dot: "bg-error",
  },
  MODERATOR: {
    label: "Modérateur",
    dot: "bg-warning",
  },
  TEACHER: {
    label: "Enseignant",
    dot: "bg-info",
  },
  DIRECTOR: {
    label: "Directeur",
    dot: "bg-secondary",
  },
};

// Par sécurité, si un rôle est inconnu, on peut renvoyer un état neutre
export const DEFAULT_ROLE = {
  label: "Utilisateur",
  dot: "bg-base-content/30",
};
