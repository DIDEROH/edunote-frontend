import {
  FaUserCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaVenusMars,
  FaUserShield,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";

export default function UserCard({ user }) {

  if (!user) {
    return (
      <div className="rounded-md bg-base-200 p-6">
        <p className="text-base-content/60 text-center text-sm">
          Aucune information utilisateur.
        </p>
      </div>
    );
  }

  const role = user?.roles?.[0]?.name || user.role || "Utilisateur";

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-";

  return (
    <div className="overflow-hidden rounded-md bg-base-200">
      {/* Cover */}
      <div className="relative h-20 bg-primary" />

      <div className="px-6 pb-6">
        <div className="-mt-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-base-100">
            <FaUserCircle className="text-3xl text-base-content/40" />
          </div>
        </div>

        {/* Nom */}
        <div className="mt-3 text-center">
          <h2 className="text-base font-semibold text-base-content">
            {user.first_name} {user.last_name}
          </h2>

          <p className="mt-0.5 text-sm text-base-content/60">{role}</p>

          <div className="mt-3 flex justify-center gap-2">
            <span className="rounded-sm bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {role}
            </span>

            <span className="flex items-center gap-1 rounded-sm bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              <FaCheckCircle size={11} />
              Vérifié
            </span>
          </div>
        </div>

        {/* Informations */}
        <div className="grid grid-cols-1 gap-3 pt-6 sm:grid-cols-2 xl:grid-cols-1">
          <InfoItem icon={<FaEnvelope />} label="Adresse email" value={user.email} />
          <InfoItem icon={<FaPhoneAlt />} label="Téléphone" value={user.phone} />
          <InfoItem icon={<FaMapMarkerAlt />} label="Adresse" value={user.address} />
          <InfoItem icon={<FaBirthdayCake />} label="Date de naissance" value={formatDate(user.birth_date)} />
          <InfoItem icon={<FaVenusMars />} label="Genre" value={user.gender === "M" ? "Masculin" : "Féminin"} />
          <InfoItem icon={<FaUserShield />} label="Rôle système" value={role} />
          <InfoItem icon={<FaCalendarAlt />} label="Compte créé le" value={formatDate(user.created_at)} />
        </div>

        {/* Statut */}
        <div className="mt-6 rounded-md bg-base-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-base-content/50">Statut du compte</p>
              <h3 className="mt-0.5 text-sm font-semibold text-success">Compte actif</h3>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <FaCheckCircle className="text-lg text-success" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-md bg-base-100 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-base-300 text-base-content/60">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-base-content/50">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm text-base-content">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}
