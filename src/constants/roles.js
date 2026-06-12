export const ROLE_CONFIG = {
  ADMIN: { 
    label: "Administrateur", 
    color: "bg-red-100 text-red-800 border-red-200", 
    icon: "🛡️" 
  },
  MODERATOR: { 
    label: "Modérateur", 
    color: "bg-orange-100 text-orange-800 border-orange-200", 
    icon: "⚖️" 
  },
  TEACHER: { 
    label: "Enseignant", 
    color: "bg-blue-100 text-blue-800 border-blue-200", 
    icon: "👨‍🏫" 
  },
  DIRECTOR: { 
    label: "Directeur", 
    color: "bg-purple-100 text-purple-800 border-purple-200", 
    icon: "🎓" 
  },
};

// Par sécurité, si un rôle est inconnu, on peut renvoyer TEACHER ou un état neutre
export const DEFAULT_ROLE = { 
  label: "Utilisateur", 
  color: "bg-gray-100 text-gray-800", 
  icon: "👤" 
};
