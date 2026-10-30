import { m } from "motion/react";
import { CalendarDays, CalendarRange, Fingerprint, GraduationCap, Hash, Mail, MapPin, Phone, School, UserRound, VenusAndMars } from "lucide-react";
import { formatDate } from "../../utils/FormatDate";
import { fadeUp } from "../motion/variants";

/** État vide : panneau clair, icône dans une pastille, message */
function Card5({ children, icon: Icon }) {
  return (
    <m.div initial="hidden" animate="show" variants={fadeUp} className="surface px-6 py-16 text-center">
      {Icon && (
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-linear-to-br from-primary/10 to-glow-cyan/15 text-primary ring-1 ring-primary/10">
          <Icon size={26} />
        </span>
      )}
      <h3 className="mx-auto max-w-md text-sm font-medium text-base-content/60">{children}</h3>
    </m.div>
  );
}

/** Fiche d'identité de l'élève */
function StudentCard({ student }) {
  if (!student) {
    return <div className="surface p-8 text-center text-sm text-base-content/50">Aucune information disponible</div>;
  }

  return (
    <m.div initial="hidden" animate="show" variants={fadeUp} className="surface w-full overflow-hidden">
      {/* Bandeau dégradé derrière la photo */}
      <div className="h-20 bg-linear-to-br from-primary via-violet-600 to-glow-cyan/80" />
      <div className="-mt-12 px-5 pb-5">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="grid size-24 place-items-center overflow-hidden rounded-full bg-base-100 ring-4 ring-white shadow-lg">
              {student.photo ? (
                <img src={student.photo} alt={`${student.first_name} ${student.last_name}`} className="h-full w-full object-cover" />
              ) : (
                <GraduationCap size={34} className="text-base-content/30" />
              )}
            </div>
            <span className={`absolute right-0.5 bottom-0.5 grid size-7 place-items-center rounded-full text-[11px] font-semibold text-white ring-2 ring-white ${student.gender === "M" ? "bg-primary" : "bg-accent"}`}>
              {student.gender}
            </span>
          </div>

          <h2 className="mt-3 text-lg leading-tight font-semibold tracking-tight uppercase">{student.first_name}</h2>
          <p className="text-sm font-medium tracking-wide text-base-content/60 uppercase">{student.last_name}</p>

          <span className="ui-chip mt-3 bg-base-100 font-mono text-base-content/70 ring-1 ring-base-300">
            <Fingerprint size={12} /> {student.matricule || "N/A"}
          </span>
        </div>

        <div className="mt-5 grid gap-2">
          <DetailItem icon={CalendarDays} title="Date de naissance" value={formatDate(student.birth_date)} />
          {student.birth_place && <DetailItem icon={MapPin} title="Lieu de naissance" value={student.birth_place} />}
          <DetailItem icon={VenusAndMars} title="Genre" value={student.gender === "M" ? "Masculin" : "Féminin"} />
        </div>

        {student.contact && (
          <div className="mt-5 rounded-2xl bg-base-100 p-4 ring-1 ring-base-300/70">
            <div className="flex items-center gap-2 text-xs font-medium text-base-content/50">
              <Phone size={12} /> Contact du parent
            </div>
            <div className="mt-1 text-base font-semibold break-all">{student.contact}</div>
            <a href={`tel:${student.contact}`} className="ui-btn ui-btn-primary ui-btn-sm mt-3">
              <Phone size={14} /> Appeler
            </a>
          </div>
        )}
      </div>
    </m.div>
  );
}

// Ligne d'information de la fiche
const DetailItem = ({ icon: Icon, title, value }) => (
  <div className="flex items-start gap-3 rounded-2xl bg-base-100 p-3 ring-1 ring-base-300/60">
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-primary ring-1 ring-base-300">
      <Icon size={16} />
    </span>
    <div className="min-w-0 flex-1">
      <div className="eyebrow text-base-content/45">{title}</div>
      <div className="mt-0.5 text-sm font-medium break-words">{value}</div>
    </div>
  </div>
);

const STATUS_CHIPS = {
  active: ["Validée", "bg-success/10 text-success"],
  pending: ["En attente", "bg-warning/10 text-warning"],
  rejected: ["Refusée", "bg-error/10 text-error"],
  suspended: ["Suspendue", "bg-error/10 text-error"],
};

/** Fiche d'un établissement (consultation par EduNote) */
function SchoolCard({ data }) {
  if (!data) return null;
  const director = data.director_membership?.user;
  const [statusLabel, statusClass] = STATUS_CHIPS[data.status] ?? [data.status, "bg-base-300 text-base-content/60"];

  return (
    <m.div initial="hidden" animate="show" variants={fadeUp} className="surface w-full overflow-hidden">
      <div className="h-20 bg-linear-to-br from-primary via-violet-600 to-glow-cyan/80" />
      <div className="-mt-10 px-5 pb-5">
        <div className="flex flex-col items-center text-center">
          <span className="grid size-20 place-items-center overflow-hidden rounded-2xl bg-white ring-4 ring-white shadow-lg">
            {data.logo ? <img src={data.logo} alt="" className="h-full w-full object-cover" /> : <School size={30} className="text-primary" />}
          </span>
          <h2 className="mt-3 text-lg leading-tight font-semibold tracking-tight">{data.name}</h2>
          {data.motto && <p className="mt-1 text-sm text-base-content/55 italic">« {data.motto} »</p>}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <span className={`ui-chip ${statusClass}`}>{statusLabel}</span>
            {data.code && <span className="ui-chip bg-base-100 font-mono text-base-content/70 ring-1 ring-base-300"><Hash size={11} /> {data.code}</span>}
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          {director && <DetailItem icon={UserRound} title="Chef d'établissement" value={`${director.last_name ?? ""} ${director.first_name ?? ""}`.trim()} />}
          {data.city && <DetailItem icon={MapPin} title="Ville" value={[data.city, data.address].filter(Boolean).join(" — ")} />}
          {data.phone && <DetailItem icon={Phone} title="Téléphone" value={data.phone} />}
          {data.email && <DetailItem icon={Mail} title="E-mail" value={data.email} />}
          {data.active_year && <DetailItem icon={CalendarRange} title="Année en cours" value={data.active_year.name} />}
          {data.created_at && <DetailItem icon={CalendarDays} title="Inscrite le" value={formatDate(data.created_at)} />}
        </div>
      </div>
    </m.div>
  );
}

export { Card5, SchoolCard, StudentCard };
