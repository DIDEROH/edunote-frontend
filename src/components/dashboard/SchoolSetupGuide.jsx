import { useState } from "react";
import { Link } from "react-router-dom";
import { m } from "motion/react";
import { fadeUp, stagger } from "../motion/variants";
import { ArrowRight, Check, ChevronDown, Lock, Rocket } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const MISSING_LABELS = { logo: "logo", motto: "devise", address: "adresse", phone: "téléphone" };

/**
 * Étapes de la mise en route, dans l'ordre conseillé. L'avancement (`done`,
 * `counts`, `blocked_by`) vient de l'API (GET /school/setup) ; ici : textes,
 * page à ouvrir et droit nécessaire pour y travailler.
 */
const STEPS = {
  profile: {
    title: "Fiche de l'établissement",
    description: "Ajoutez votre logo et vérifiez la devise, l'adresse et le téléphone : ils sont imprimés sur les bulletins.",
    to: "/my-school",
    directorOnly: true,
    detail: (c) => (c.missing.length ? `À compléter : ${c.missing.map((f) => MISSING_LABELS[f] ?? f).join(", ")}` : "Fiche complète"),
  },
  calendar: {
    title: "Calendrier",
    description: "Vérifiez l'année en cours, ses trimestres et ses séquences (noms imprimés sur les bulletins).",
    to: "/calendar",
    permission: "calendar",
    detail: (c) => (c.year ? `${c.year} : ${c.terms} trimestre(s), ${c.sequences} séquence(s)` : "Aucune année en cours"),
  },
  classes: {
    title: "Classes",
    description: "Choisissez les classes ouvertes dans votre établissement.",
    to: "/my-classes",
    permission: "classes",
    detail: (c) => `${c.classes} classe(s) choisie(s)`,
  },
  subjects: {
    title: "Matières et coefficients",
    description: "Pour chaque classe, indiquez les matières enseignées et leur coefficient.",
    to: "/my-classes",
    permission: "classes",
    detail: (c) => `${c.configured} classe(s) sur ${c.classes} configurée(s) · ${c.subjects} matière(s) au total`,
  },
  skills: {
    title: "Compétences",
    description: "Votre établissement évalue par compétences : définissez-les pour chaque matière de chaque classe.",
    to: "/skills",
    permission: "classes",
    detail: (c) => `${c.covered} matière(s) sur ${c.total} avec leurs compétences`,
  },
  staff: {
    title: "Personnel",
    description: "Invitez vos enseignants par WhatsApp. Vous pouvez aussi nommer des modérateurs pour vous aider.",
    to: "/staff",
    permission: "staff",
    detail: (c) => `${c.teachers} enseignant(s)` + (c.pending_invitations ? ` · ${c.pending_invitations} invitation(s) en attente` : ""),
  },
  assignments: {
    title: "Affectations",
    description: "Attribuez à chaque matière de chaque classe l'enseignant qui saisira ses notes.",
    to: "/director/teachers",
    permission: "assignments",
    detail: (c) => `${c.covered} matière(s) sur ${c.total} ont un enseignant`,
  },
  students: {
    title: "Élèves",
    description: "Inscrivez vos élèves un par un, ou importez-les depuis un fichier Excel.",
    to: "/students",
    permission: "students",
    detail: (c) => `${c.students} élève(s) inscrit(s) · ${c.classes_with_students} classe(s) sur ${c.classes} avec des élèves`,
  },
};

const collapsedKey = (schoolId) => `edunote_setup_collapsed_${schoolId}`;

const readCollapsed = (schoolId) => {
  try {
    return localStorage.getItem(collapsedKey(schoolId)) === "1";
  } catch {
    return false;
  }
};

/**
 * Assistant de mise en route du tableau de bord : guide un nouveau directeur
 * (ou ses modérateurs) étape par étape. Disparaît quand tout est terminé.
 */
export default function SchoolSetupGuide({ setup }) {
  const { can, isSchoolDirector, school } = useAuth();
  const [collapsed, setCollapsed] = useState(() => readCollapsed(school?.id));

  if (!setup || setup.is_complete) return null;

  const steps = setup.steps.filter((step) => STEPS[step.key]);
  const next = steps.find((step) => !step.done && step.blocked_by.length === 0);
  const percent = Math.round((setup.completed / setup.total) * 100);

  const toggle = () => {
    setCollapsed((value) => {
      try {
        localStorage.setItem(collapsedKey(school?.id), value ? "0" : "1");
      } catch {
        // Stockage indisponible (navigation privée) : on garde l'état pour cette visite
      }
      return !value;
    });
  };

  return (
    <m.section initial="hidden" animate="show" variants={fadeUp} className="surface space-y-4 p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-primary to-violet-600 text-white shadow-lg shadow-primary/30">
            <Rocket size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-base-content">Mise en route de votre établissement</h2>
            <p className="mt-0.5 text-sm text-base-content/60">
              {setup.completed} étape(s) terminée(s) sur {setup.total}. Suivez-les dans l'ordre : vos enseignants pourront ensuite saisir les notes.
            </p>
          </div>
        </div>
        <button type="button" onClick={toggle} aria-expanded={!collapsed} title={collapsed ? "Afficher les étapes" : "Réduire"}
          className="ui-icon-btn shrink-0">
          <ChevronDown size={18} className={`transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-base-300">
          <m.div className="h-full rounded-full bg-linear-to-r from-primary via-glow-indigo to-glow-cyan" initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <span className="text-xs font-medium text-base-content/60">{percent} %</span>
      </div>

      {collapsed ? (
        next && (
          <p className="text-sm text-base-content/70">
            Étape suivante : <Link to={STEPS[next.key].to} className="font-medium text-primary">{STEPS[next.key].title}</Link>
          </p>
        )
      ) : (
        <m.ol variants={stagger(0.05, 0.1)} initial="hidden" animate="show" className="space-y-2">
          {steps.map((step, index) => (
            <SetupStep key={step.key} step={step} number={index + 1} isNext={step === next}
              allowed={STEPS[step.key].directorOnly ? isSchoolDirector : can(STEPS[step.key].permission)} />
          ))}
        </m.ol>
      )}
    </m.section>
  );
}

function SetupStep({ step, number, isNext, allowed }) {
  const config = STEPS[step.key];
  const blocked = !step.done && step.blocked_by.length > 0;

  const badge = step.done
    ? "bg-success/10 text-success"
    : isNext ? "bg-primary text-primary-content" : "bg-base-300 text-base-content/50";

  return (
    <m.li variants={fadeUp} className={`flex flex-col gap-3 rounded-2xl p-4 ring-1 sm:flex-row sm:items-center ${isNext ? "bg-primary/5 ring-primary/25" : "bg-base-100 ring-base-300/70"}`}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badge}`}>
          {step.done ? <Check size={14} /> : blocked ? <Lock size={12} /> : number}
        </span>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${step.done ? "text-base-content/60" : "text-base-content"}`}>{config.title}</p>
          {!step.done && <p className="mt-0.5 text-sm text-base-content/60">{config.description}</p>}
          <p className="mt-1 text-xs text-base-content/50">{config.detail(step.counts)}</p>
          {blocked && (
            <p className="mt-1 text-xs font-medium text-warning">
              À faire après : {step.blocked_by.map((key) => STEPS[key]?.title ?? key).join(", ")}
            </p>
          )}
        </div>
      </div>

      {allowed ? (
        <Link to={config.to}
          className={`ui-btn ui-btn-sm shrink-0 ${isNext ? "ui-btn-primary" : "ui-btn-soft"}`}>
          {step.done ? "Revoir" : isNext ? "Commencer" : "Ouvrir"} <ArrowRight size={13} />
        </Link>
      ) : (
        <span className="ui-chip shrink-0 bg-base-300 text-base-content/55">
          {config.directorOnly ? "Réservé au directeur" : "Droit non accordé"}
        </span>
      )}
    </m.li>
  );
}
