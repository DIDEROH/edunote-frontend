import { ROLE_CONFIG, DEFAULT_ROLE } from "../constants/roles";

const BadgeRole = ({ role }) => {
  // On récupère la config. Si le rôle n'existe pas, on prend le défaut.
  const config = ROLE_CONFIG[role?.toUpperCase()] || DEFAULT_ROLE;

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 m-1 rounded-sm bg-base-300 text-xs font-medium text-base-content">
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default BadgeRole;