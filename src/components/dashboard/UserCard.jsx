import { motion } from "framer-motion";
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
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xl p-6">
        <p className="text-slate-500 text-center">
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -5 }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
    >
      {/* Cover */}
      <div className="relative h-32 bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-500">
        <div className="absolute inset-0 bg-black/10" />

        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white shadow-xl">
            <FaUserCircle className="text-7xl text-slate-500" />
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-16">
        {/* Nom */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">
            {user.first_name} {user.last_name}
          </h2>

          <p className="mt-1 text-slate-500">{role}</p>

          <div className="mt-4 flex justify-center gap-2">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              {role}
            </span>

            <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              <FaCheckCircle />
              Vérifié
            </span>
          </div>
        </div>

        {/* Informations */}
        <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-1">
          <InfoItem
            icon={<FaEnvelope />}
            label="Adresse email"
            value={user.email}
          />

          <InfoItem
            icon={<FaPhoneAlt />}
            label="Téléphone"
            value={user.phone}
          />

          <InfoItem
            icon={<FaMapMarkerAlt />}
            label="Adresse"
            value={user.address}
          />

          <InfoItem
            icon={<FaBirthdayCake />}
            label="Date de naissance"
            value={formatDate(user.birth_date)}
          />

          <InfoItem
            icon={<FaVenusMars />}
            label="Genre"
            value={user.gender === "M" ? "Masculin" : "Féminin"}
          />

          <InfoItem
            icon={<FaUserShield />}
            label="Rôle système"
            value={role}
          />

          <InfoItem
            icon={<FaCalendarAlt />}
            label="Compte créé le"
            value={formatDate(user.created_at)}
          />
        </div>

        {/* Statut */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Statut du compte</p>

              <h3 className="mt-1 text-xl font-bold">Compte actif</h3>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
              <FaCheckCircle className="text-2xl" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 transition-all duration-300 hover:bg-slate-100">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-slate-700">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}