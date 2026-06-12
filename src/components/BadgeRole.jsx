import { ROLE_CONFIG, DEFAULT_ROLE } from "../constants/roles";

const BadgeRole = ({ role }) => {
  // On récupère la config. Si le rôle n'existe pas, on prend le défaut.
  const config = ROLE_CONFIG[role?.toUpperCase()] || DEFAULT_ROLE;

  return (
    <span className={`px-2 py-1 inline-block m-1 rounded-full font-medium ${config.color}`}>
      {config.icon} {config.label}
    </span>
  );
};

export default BadgeRole;