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
  LuClock3,
  LuX,
  LuTrash2,
  LuPencil,
} from "react-icons/lu";
import verifFunction from "../../utils/verifFunction";
import { Calendar, Fingerprint, MapPin, Phone, User } from "lucide-react";
import { formatDate } from "../../utils/FormatDate";
import { FaCalendarAlt, FaFingerprint, FaMapMarkerAlt, FaPhoneAlt, FaUserGraduate, FaVenusMars } from "react-icons/fa";

function Card1(props) {
    const Icon = props?.data?.icon;
    return (
        <div
            key={props.data.id}
            className="animate-bento-card group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-accent/40 hover:bg-white/[0.08]"
            >
            {/* Glow */}
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div
                className={`absolute -top-20 right-0 h-40 w-40 rounded-full bg-gradient-to-r ${props.data.color} blur-3xl opacity-40`}
                />
            </div>

            {/* Icon */}
            <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${props.data.color} shadow-lg`}
            >
                {Icon && <Icon size={24} color="#fff" />}
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold line-clamp-1">{props.data.title}</h3>

            <p className="mt-4 mb-6 leading-relaxed text-gray-400 line-clamp-3 text-sm">
                {props.data.description}
            </p>

            {/* Button */}
            {props.btn}

        </div>
    )
}

function Card2(props) {
  return (
    <div
        className=" group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-left transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/30 hover:bg-white/[0.05]"
        >
        
        {/* Hover Glow */}
        <div className=" absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className={` absolute right-0 top-0 h-40 w-40 rounded-full blur-3xl
            ${
                props?.glow === "cyan"
                ? "bg-cyan-500/30"
                : props?.glow === "violet"
                ? "bg-violet-500/30"
                : "bg-pink-500/30"
            }
            `} />
        </div>

        {/* Number */}
        {
            props.number && (
                <div className=" mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0B1120] text-xl font-black text-white">
                    {props.number}
                </div>
            )
        }


        <h3 className=" text-xl font-bold text-white">
            {props?.title}
        </h3>

        <p className=" mt-4 text-sm leading-relaxed text-white/60">
            {props?.desc}
        </p>

        {props.btn}
    </div>
  )
}

function Card3(props) {
    return (
    <div
      className=" group relative overflow-hidden rounded-[1.8rem] border border-base-content/10 bg-base-100/70 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-info/30 hover:shadow-2xl hover:shadow-info/10 animate-slide-right"
    >
      
      {/* Neon Glow Hover */}
      <div className=" absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none
      ">    
            <div className=" absolute -top-20 right-0 h-40 w-40 rounded-full bg-info/20 blur-3xl" />
            <div className=" absolute bottom-0 left-0 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        {/* Image Container */}
        <div className="relative overflow-hidden">
            
            <div className=" relative aspect-video overflow-hidden bg-base-300 ">
            
            {/* Overlay Gradient */}
            <div className=" absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

            {/* Animated Background */}
            <div className=" absolute inset-0 bg-gradient-to-br from-base-300 to-base-200 transition-transform duration-700 group-hover:scale-110" />

            {/* Image */}
            <img src={props.image || "/bg_secondary.webp"} alt="Photo du site web" className=" relative z-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />

            {/* Floating Language Badge */}
            <div className=" absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-100/70 px-4 py-2 backdrop-blur-xl">
                
                <div className=" h-2.5 w-2.5 rounded-full bg-info shadow-[0_0_12px] shadow-info " />

                <span className=" text-[11px] font-bold uppercase tracking-[0.2em] text-base-content/80">
                {props.language}
                </span>
            </div>
            </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 md:p-7">
            
            {/* Title */}
            <h3 className="text-xl font-black leading-tight text-base-content transition-all duration-300 group-hover:text-info md:text-2xl">
                {props.title}
            </h3>

            {/* Divider */}
            <div className="mt-4 h-[2px] w-16 rounded-full bg-gradient-to-r from-info to-secondary transition-all duration-500 group-hover:w-28" />

            {/* Description */}
            <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-base-content/70 md:text-[15px]">
                {props.description}
            </p>

            {/* Footer */}
            <div className="mt-7 flex items-center justify-between">
            
                {/* Small Status */}
                {
                    props.active && (
                        <div className="flex items-center gap-2 text-xs font-medium text-base-content/50">
                            <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_10px] shadow-success" />
                            {props.active}
                        </div>
                    )
                }

                {/* CTA */}
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
    <div className="flex items-center gap-3 rounded-xl border border-base-content/10 bg-white p-4 shadow-xl shadow-primary/5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {Icone && (<Icone size={30} />)}
        </div>
        <div>
            <h4 className="text-sm font-semibold text-base-content/80 uppercase">{title}</h4>
            <p className="text-base-content text-xs">{subtitle}</p>
        </div>
    </div>
  )
}

function Card5({ children, icon: Icon }) { // Syntaxe plus propre pour renommer icon en Icon
    return (
        <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            {/* On affiche l'icône UNIQUEMENT si elle est définie */}
            {Icon && <Icon size={48} className="mx-auto text-slate-200 mb-4" />}
            
            <h3 className="text-slate-800 font-black uppercase tracking-[2px] text-sm">
                {children}
            </h3>
        </div>
    );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="
          flex h-10 w-10 shrink-0 items-center justify-center
          rounded-2xl bg-white text-blue-600
        "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-700">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function SchoolCard({ data }) {
  return (
    <div
      className="
        w-full overflow-hidden
        rounded-2xl
        border border-slate-200/80
        bg-base-100
        shadow-sm
      "
    >
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-700 px-6 py-8 text-white sm:px-8">
        {/* Décor */}
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 left-0 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <div
            className="
              flex h-24 w-24 shrink-0 items-center justify-center
              overflow-hidden rounded-3xl
              border border-white/20
              bg-white/15
              backdrop-blur-md
            "
          >
            {data?.logo ? (
              <img
                src={data?.logo}
                alt={data?.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <LuBuilding2 size={38} className="text-white" />
            )}
          </div>

          <div className="min-w-0 text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-2">
              {data?.name}
            </h2>
            <h2 className="text-lg font-black tracking-tight sm:text-xl">
              {data?.code}
            </h2>
            <p className="mt-2 text-sm italic text-white/80 sm:text-base">
              « {data?.motto} »
            </p>

          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2 lg:grid-cols-1">
        
        {/* Établissement */}
        <section className=" p-5">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Établissement
          </h3>

          <div className="space-y-4">
            <InfoItem
              icon={<LuMapPin size={18} />}
              label="Ville"
              value={data?.city}
            />

            <InfoItem
              icon={<LuPhone size={18} />}
              label="Téléphone"
              value={data?.phone}
            />

            <InfoItem
              icon={<LuMail size={18} />}
              label="Email"
              value={data?.email}
            />

            <InfoItem
              icon={<LuMapPinned size={18} />}
              label="Adresse"
              value={data?.address}
            />
          </div>
        </section>

        {/* Responsable */}
        {
          data?.active_director && (
            <section className="p-5">
              <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-indigo-700">
                Responsable
              </h3>

              <div className="space-y-4">
                <InfoItem
                  icon={<LuUserRound size={18} />}
                  label="Nom"
                  value={data?.active_director?.first_name + " " +data?.active_director?.first_name }
                />

                <InfoItem
                  icon={<LuPhone size={18} />}
                  label="Téléphone"
                  value={data?.active_director?.phone}
                />

                <InfoItem
                  icon={<LuMail size={18} />}
                  label="Email"
                  value={data?.active_director?.email}
                />

                <InfoItem
                  icon={<LuHouse size={18} />}
                  label="Adresse"
                  value={data?.active_director?.address}
                />
              </div>
            </section>
          )
        }
      </div>

    </div>
  );
}


function UserCard({ children, user }) {
  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`;

  const fullName = `${user.first_name} ${user.last_name}`;

  const mainRole = user.roles?.[0]?.name || user.role || "Utilisateur";

  return (
    <div className="w-full overflow-hidden rounded-xl bg-white">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-6 py-8 text-white sm:px-8">
        {/* Effets décoratifs */}
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row">
          {/* Avatar */}
          <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/20 bg-white/15 text-3xl font-bold uppercase backdrop-blur-md">
            {initials}
          </div>

          {/* Identité */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <h2 className="truncate text-3xl font-bold tracking-tight">
                {fullName}
              </h2>

              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                <LuShieldCheck size={14} />
                {mainRole}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur-sm">
                {user.gender === "M" ? "Homme" : "Femme"}
              </span>

              {user.email_verified_at && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-100">
                  <LuBadgeCheck size={14} />
                  Email vérifié
                </span>
              )}
            </div>
          </div>

          <div className="py-2 px-4 rounded-3xl gap-4 bg-slate-50 flex justify-center items-center md:justify-start z-20">
            {children}
          </div>
        </div>

      </div>

      

      {/* Contenu */}
      <div className="grid gap-5 py-5 sm:p-6 lg:grid-cols-2">
        {/* Coordonnées */}
        <section className=" p-5">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Coordonnées
          </h3>

          <div className="space-y-4">
            <InfoItem
              icon={<LuMail size={18} />}
              label="Email"
              value={user.email}
            />

            <InfoItem
              icon={<LuPhone size={18} />}
              label="Téléphone"
              value={user.phone}
            />

            <InfoItem
              icon={<LuMapPinned size={18} />}
              label="Adresse"
              value={user.address}
            />
          </div>
        </section>

        {/* Informations personnelles */}
        <section className="p-5">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-indigo-700">
            Informations personnelles
          </h3>

          <div className="space-y-4">
            <InfoItem
              icon={<LuCalendarDays size={18} />}
              label="Date de naissance"
              value={new Date(user.birth_date).toLocaleDateString("fr-FR")}
            />

            <InfoItem
              icon={<LuMapPin size={18} />}
              label="Lieu de naissance"
              value={user.birth_place}
            />

            <InfoItem
              icon={<LuUserRound size={18} />}
              label="Identifiant"
              value={`#${user.id}`}
            />

            <InfoItem
              icon={<LuClock3 size={18} />}
              label="Créé le"
              value={new Date(user.created_at).toLocaleDateString("fr-FR")}
            />
          </div>
        </section>
      </div>

      {/* Rôles */}
      {user.roles?.length > 0 && (
        <div className="border-t border-slate-200 px-5 py-5 sm:px-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
            Permissions
          </h3>

          <div className="flex flex-wrap gap-3">
            {user.roles.map((role) => (
              <span
                key={role.id}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700"
              >
                <LuShieldCheck size={14} />
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
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
        Aucune information disponible
      </div>
    );

  return (
    <div className="group relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* décoration */}
      <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-indigo-100/50 blur-3xl" />
      <div className="absolute -left-12 bottom-0 h-28 w-28 rounded-full bg-sky-100/40 blur-2xl" />

      <div className="relative p-5">

        {/* Header */}
        <div className="flex flex-col items-center text-center">

          <div className="relative">

            <div className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 p-1 shadow-lg">

              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100">

                {student.photo ?   (
                  <img
                    src={student.photo}
                    alt={student.first_name + " " + student.last_name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105 "
                  />
                ) : (
                  <FaUserGraduate className="text-4xl text-slate-300" />
                )}

              </div>
            </div>

            <div
              className={`absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white text-xs font-bold text-white shadow-lg ${
                student.gender === "M"
                  ? "bg-blue-500"
                  : "bg-pink-500"
              }`}
            >
              {student.gender}
            </div>
          </div>

          <h2 className="mt-4 break-words text-xl font-black uppercase leading-tight text-slate-800">
            {student.first_name}
          </h2>

          <p className="break-words text-sm font-semibold uppercase tracking-wide text-indigo-600">
            {student.last_name}
          </p>

          <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[11px] font-bold tracking-widest text-white">

            <FaFingerprint className="text-indigo-400" />

            {student.matricule || "N/A"}

          </span>

        </div>

        {/* Infos */}

        <div className="mt-6 grid gap-3">

          <DetailItem
            icon={<FaCalendarAlt />}
            title="Date de naissance"
            value={formatDate(student.birth_date)}
          />

          {student.birth_place && (
            <DetailItem
              icon={<FaMapMarkerAlt />}
              title="Lieu de naissance"
              value={student.birth_place}
            />
          )}

          <DetailItem
            icon={<FaVenusMars />}
            title="Genre"
            value={
              student.gender === "M"
                ? "Masculin"
                : "Féminin"
            }
          />

        </div>

        {/* Contact */}

        {student.contact && (

          <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">

              <FaPhoneAlt />

              Contact du parent

            </div>

            <div className="mt-2 break-all text-lg font-bold text-slate-800">
              {student.contact}
            </div>

            <a
              href={`tel:${student.contact}`}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 active:scale-95"
            >
              <FaPhoneAlt />

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
  <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-indigo-100 hover:shadow-md">

    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-lg text-indigo-600">
      {icon}
    </div>

    <div className="min-w-0 flex-1">

      <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </div>

      <div className="mt-1 break-words text-sm font-semibold text-slate-700">
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
    StudentCard
}