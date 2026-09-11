import {
  LuBuilding2,
  LuMapPin,
  LuPhone,
  LuMail,
  LuUserRound,
  LuHouse,
  LuMapPinned,
  LuCalendarDays,
  LuBadgeCheck,
  LuShieldCheck,
  LuClock3
} from "react-icons/lu";
import {
    FaMale,
    FaFemale,
    FaGraduationCap,
} from "react-icons/fa";
import { formatDate } from "../../utils/FormatDate";
import { FaCalendarAlt, FaFingerprint, FaMapMarkerAlt, FaPhoneAlt, FaUserGraduate, FaVenusMars } from "react-icons/fa";




function ClassroomCards({ classrooms = [] }) {
    const max = Math.max(...classrooms.map(c => c.total), 1);

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-sm font-semibold text-base-content">Répartition des classes</h2>
                <p className="text-xs text-base-content/60">{classrooms.length} classes</p>
            </div>

            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
                {classrooms.map((room) => (
                    <div
                        key={room.classroom_id}
                        className="flex-none w-full max-w-72 rounded-md bg-base-200 p-5"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-sm text-base-content">{room.classroom_name}</h3>
                                <p className="text-xs text-base-content/60">Classe</p>
                            </div>
                            <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                                <FaGraduationCap size={18} />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-md bg-base-100 p-3 text-center">
                                <FaMale className="mx-auto text-base-content/50 mb-1" size={14} />
                                <div className="text-lg font-semibold text-base-content">{room.boys}</div>
                                <div className="text-xs text-base-content/60">Garçons</div>
                            </div>

                            <div className="rounded-md bg-base-100 p-3 text-center">
                                <FaFemale className="mx-auto text-base-content/50 mb-1" size={14} />
                                <div className="text-lg font-semibold text-base-content">{room.girls}</div>
                                <div className="text-xs text-base-content/60">Filles</div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex justify-between mb-1.5 text-xs">
                                <span className="text-base-content/60">Effectif</span>
                                <strong className="text-base-content">{room.total} élèves</strong>
                            </div>
                            <div className="h-1.5 rounded-sm bg-base-300 overflow-hidden">
                                <div
                                    style={{ width: `${(room.total / max) * 100}%` }}
                                    className="h-full rounded-sm bg-primary"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Card1(props) {
    const Icon = props?.data?.icon;
    return (
        <div
            key={props.data.id}
            className="group relative rounded-md bg-base-200 p-6"
            >
            {/* Icon */}
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                {Icon && <Icon size={20} />}
            </div>

            {/* Content */}
            <h3 className="text-sm font-semibold text-base-content line-clamp-1">{props.data.title}</h3>

            <p className="mt-2 mb-5 leading-relaxed text-base-content/60 line-clamp-3 text-sm">
                {props.data.description}
            </p>

            {/* Button */}
            {props.btn}

        </div>
    )
}

function Card2(props) {
  return (
    <div className="group relative rounded-md bg-base-200 p-6 text-left">

        {/* Number */}
        {
            props.number && (
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-base-300 text-sm font-semibold text-base-content">
                    {props.number}
                </div>
            )
        }

        <h3 className="text-sm font-semibold text-base-content">
            {props?.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-base-content/60">
            {props?.desc}
        </p>

        {props.btn}
    </div>
  )
}

function Card3(props) {
    return (
    <div className="group relative overflow-hidden rounded-md bg-base-200">

        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-base-300">
            <img src={props.image || "/bg_secondary.webp"} alt="Photo du site web" className="h-full w-full object-cover" />

            {props.language && (
                <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-md bg-base-200 px-3 py-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-base-content/70">
                        {props.language}
                    </span>
                </div>
            )}
        </div>

        {/* Content */}
        <div className="p-6">
            <h3 className="text-base font-semibold text-base-content">
                {props.title}
            </h3>

            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-base-content/60">
                {props.description}
            </p>

            <div className="mt-5 flex items-center justify-between">
                {props.active && (
                    <div className="flex items-center gap-2 text-xs text-base-content/50">
                        <div className="h-1.5 w-1.5 rounded-full bg-success" />
                        {props.active}
                    </div>
                )}

                {props?.btn}
            </div>
        </div>

    </div>
  )
}

function Card4(props) {
  const Icone = props.icon || "D";
  const title = props.title || "Titre";
  const subtitle = props.subtitle || "Sous-titre";
  return (
    <div className="flex items-center gap-3 rounded-md bg-base-200 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            {Icone && (<Icone size={20} />)}
        </div>
        <div>
            <h4 className="text-xs font-medium text-base-content/60 uppercase">{title}</h4>
            <p className="text-base-content text-sm">{subtitle}</p>
        </div>
    </div>
  )
}

function Card5({ children, icon: Icon }) {
    return (
        <div className="text-center py-20 bg-base-200 rounded-md">
            {Icon && <Icon size={40} className="mx-auto text-base-content/25 mb-3" />}

            <h3 className="text-base-content/60 font-medium text-sm">
                {children}
            </h3>
        </div>
    );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-base-100 text-primary">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-base-content/50">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-medium text-base-content">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function SchoolCard({ data }) {
  return (
    <div className="w-full overflow-hidden rounded-md bg-base-200">
      {/* Header */}
      <div className="bg-primary px-6 py-7 text-primary-content sm:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/15">
            {data?.logo ? (
              <img src={data?.logo} alt={data?.name} className="h-full w-full object-cover" />
            ) : (
              <LuBuilding2 size={32} />
            )}
          </div>

          <div className="min-w-0 text-center sm:text-left">
            <h2 className="text-xl font-semibold tracking-tight">
              {data?.name}
            </h2>
            <h2 className="text-sm font-medium opacity-80">
              {data?.code}
            </h2>
            <p className="mt-1 text-sm italic opacity-80">
              « {data?.motto} »
            </p>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2 lg:grid-cols-1">

        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-base-content/50">
            Établissement
          </h3>

          <div className="space-y-3">
            <InfoItem icon={<LuMapPin size={16} />} label="Ville" value={data?.city} />
            <InfoItem icon={<LuPhone size={16} />} label="Téléphone" value={data?.phone} />
            <InfoItem icon={<LuMail size={16} />} label="Email" value={data?.email} />
            <InfoItem icon={<LuMapPinned size={16} />} label="Adresse" value={data?.address} />
          </div>
        </section>

        {data?.active_director && (
          <section>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-base-content/50">
              Responsable
            </h3>

            <div className="space-y-3">
              <InfoItem
                icon={<LuUserRound size={16} />}
                label="Nom"
                value={data?.active_director?.first_name + " " +data?.active_director?.last_name }
              />
              <InfoItem icon={<LuPhone size={16} />} label="Téléphone" value={data?.active_director?.phone} />
              <InfoItem icon={<LuMail size={16} />} label="Email" value={data?.active_director?.email} />
              <InfoItem icon={<LuHouse size={16} />} label="Adresse" value={data?.active_director?.address} />
            </div>
          </section>
        )}
      </div>

    </div>
  );
}


function UserCard({ children, user }) {
  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`;
  const fullName = `${user.first_name} ${user.last_name}`;
  const mainRole = user.roles?.[0]?.name || user.role || "Utilisateur";

  return (
    <div className="w-full overflow-hidden rounded-md bg-base-200">
      {/* Header */}
      <div className="bg-primary px-6 py-7 text-primary-content sm:px-8">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="flex h-20 w-20 items-center justify-center rounded-md bg-white/15 text-2xl font-semibold uppercase">
            {initials}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <h2 className="truncate text-xl font-semibold tracking-tight">
                {fullName}
              </h2>

              <span className="inline-flex items-center justify-center gap-2 rounded-md bg-white/15 px-3 py-1 text-xs font-medium">
                <LuShieldCheck size={13} />
                {mainRole}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs">
                {user.gender === "M" ? "Homme" : "Femme"}
              </span>

              {user.email_verified_at && (
                <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-xs">
                  <LuBadgeCheck size={13} />
                  Email vérifié
                </span>
              )}
            </div>
          </div>

          {children && (
            <div className="py-2 px-3 rounded-md gap-3 bg-white/10 flex justify-center items-center md:justify-start">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="grid gap-5 py-5 sm:p-6 lg:grid-cols-2">
        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-base-content/50">
            Coordonnées
          </h3>

          <div className="space-y-3">
            <InfoItem icon={<LuMail size={16} />} label="Email" value={user.email} />
            <InfoItem icon={<LuPhone size={16} />} label="Téléphone" value={user.phone} />
            <InfoItem icon={<LuMapPinned size={16} />} label="Adresse" value={user.address} />
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-base-content/50">
            Informations personnelles
          </h3>

          <div className="space-y-3">
            <InfoItem
              icon={<LuCalendarDays size={16} />}
              label="Date de naissance"
              value={new Date(user.birth_date).toLocaleDateString("fr-FR")}
            />
            <InfoItem icon={<LuMapPin size={16} />} label="Lieu de naissance" value={user.birth_place} />
            <InfoItem icon={<LuUserRound size={16} />} label="Identifiant" value={`#${user.id}`} />
            <InfoItem
              icon={<LuClock3 size={16} />}
              label="Créé le"
              value={new Date(user.created_at).toLocaleDateString("fr-FR")}
            />
          </div>
        </section>
      </div>

      {/* Rôles */}
      {user.roles?.length > 0 && (
        <div className="px-5 py-5 sm:px-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-base-content/50">
            Permissions
          </h3>

          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span
                key={role.id}
                className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
              >
                <LuShieldCheck size={13} />
                {role.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function StudentCard({ student }) {
  if (!student)
    return (
      <div className="rounded-md bg-base-200 p-8 text-center text-sm text-base-content/50">
        Aucune information disponible
      </div>
    );

  return (
    <div className="w-full overflow-hidden rounded-md bg-base-200">
      <div className="p-5">

        {/* Header */}
        <div className="flex flex-col items-center text-center">

          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-base-300">
              {student.photo ? (
                <img
                  src={student.photo}
                  alt={student.first_name + " " + student.last_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaUserGraduate className="text-3xl text-base-content/30" />
              )}
            </div>

            <div
              className={`absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold text-white ${
                student.gender === "M" ? "bg-primary" : "bg-accent"
              }`}
            >
              {student.gender}
            </div>
          </div>

          <h2 className="mt-3 break-words text-base font-semibold uppercase leading-tight text-base-content">
            {student.first_name}
          </h2>

          <p className="break-words text-sm font-medium uppercase tracking-wide text-base-content/60">
            {student.last_name}
          </p>

          <span className="mt-2 inline-flex items-center gap-2 rounded-md bg-base-300 px-3 py-1.5 text-[11px] font-medium text-base-content/70">
            <FaFingerprint size={12} />
            {student.matricule || "N/A"}
          </span>

        </div>

        {/* Infos */}
        <div className="mt-5 grid gap-2">
          <DetailItem icon={<FaCalendarAlt />} title="Date de naissance" value={formatDate(student.birth_date)} />

          {student.birth_place && (
            <DetailItem icon={<FaMapMarkerAlt />} title="Lieu de naissance" value={student.birth_place} />
          )}

          <DetailItem
            icon={<FaVenusMars />}
            title="Genre"
            value={student.gender === "M" ? "Masculin" : "Féminin"}
          />
        </div>

        {/* Contact */}
        {student.contact && (
          <div className="mt-5 rounded-md bg-base-100 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-base-content/50">
              <FaPhoneAlt size={12} />
              Contact du parent
            </div>

            <div className="mt-1 break-all text-base font-semibold text-base-content">
              {student.contact}
            </div>

            <a
              href={`tel:${student.contact}`}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-content transition-colors duration-150 hover:brightness-95"
            >
              <FaPhoneAlt size={14} />
              Appeler maintenant
            </a>
          </div>
        )}

      </div>
    </div>
  );
}

// Petit composant interne pour la cohérence des lignes
const DetailItem = ({ icon, title, value }) => (
  <div className="flex items-start gap-3 rounded-md bg-base-100 p-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-base-300 text-base text-base-content/60">
      {icon}
    </div>

    <div className="min-w-0 flex-1">
      <div className="text-[11px] font-medium uppercase tracking-wide text-base-content/50">
        {title}
      </div>

      <div className="mt-0.5 break-words text-sm font-medium text-base-content">
        {value}
      </div>
    </div>
  </div>
);



export {
    Card1,
    Card2,
    Card3,
    Card4,
    Card5,
    SchoolCard,
    UserCard,
    StudentCard,
    ClassroomCards
}
