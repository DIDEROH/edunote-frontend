import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CalendarCheck, CheckCircle2, ChevronDown, GraduationCap, Info, RotateCcw } from "lucide-react";
import { api } from "../../utils/AxiosClient";
import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../providers/ConfirmProvider";
import useNavbarRefresh from "../../hooks/useNavbarRefresh";
import PageHeader from "../../components/elements/PageHeader";
import LoadingSkeleton from "../../components/LoadingSkeletoon";

const PROMOTE = "promote";
const REPEAT = "repeat";
const LEAVE = "leave";

/*
 * Choix d'un élève :
 * - "promote" : classe supérieure prévue pour sa classe (ou départ si aucune) ;
 * - "repeat"  : redouble dans sa classe ;
 * - "leave"   : quitte l'établissement ;
 * - "to:<id>" : classe choisie pour lui ;
 * - ""        : à décider (pas de moyenne annuelle).
 */
const proposalOf = (student) => student.proposal ?? "";

const draftKey = (schoolId, yearId) => `edunote_transition_${schoolId}_${yearId}`;

const readDraft = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch {
    return null;
  }
};

const writeDraft = (key, value) => {
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch {
    // Stockage indisponible (navigation privée) : le brouillon n'est simplement pas gardé
  }
};

const label = (classroom) => classroom?.short_name || classroom?.name || "";

/** Destination d'un élève : { to: id | null, kind: promote | repeat | leave | null (à décider) } */
function resolveChoice(student, choice, classesById, targets) {
  const current = classesById[student.classroom_id];

  if (choice === PROMOTE) {
    const target = targets[student.classroom_id] ?? null;
    return target ? { to: target, kind: PROMOTE } : { to: null, kind: LEAVE };
  }
  if (choice === REPEAT) {
    return current?.active ? { to: current.id, kind: REPEAT } : { to: null, kind: null };
  }
  if (choice === LEAVE) return { to: null, kind: LEAVE };
  if (choice?.startsWith("to:")) {
    const target = classesById[Number(choice.slice(3))];
    if (!target?.active) return { to: null, kind: null };
    return { to: target.id, kind: target.level_index > (current?.level_index ?? 0) ? PROMOTE : REPEAT };
  }
  return { to: null, kind: null };
}

// Passage tout juste effectué (aucune note encore saisie) : récapitulatif et annulation
const isJustDone = (data) => {
  const last = data?.last_transition;
  return Boolean(last && !last.undone_at && last.can_undo && last.summary?.to_year_name === data.from_year.name);
};

const countKinds = (items) => items.reduce(
  (acc, item) => ({ ...acc, [item.kind ?? "undecided"]: acc[item.kind ?? "undecided"] + 1 }),
  { promote: 0, repeat: 0, leave: 0, undecided: 0 },
);

/**
 * Passage à l'année suivante (chef d'établissement) : décision pour chaque
 * élève (classe supérieure, redoublement, départ), proposée d'après sa moyenne
 * annuelle, puis création de la nouvelle année, réinscriptions et reprise des
 * affectations. Annulable tant qu'aucune note n'est saisie dans la nouvelle année.
 */
export default function YearTransition() {
  const { school, refreshUser } = useAuth();
  const confirm = useConfirm();
  const [data, setData] = useState(null);
  const [targets, setTargets] = useState({});
  const [choices, setChoices] = useState({});
  const [step, setStep] = useState("decide");
  const [name, setName] = useState("");
  const [copyAssignments, setCopyAssignments] = useState(true);
  const [openClasses, setOpenClasses] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Données du serveur + brouillon : les choix déjà faits sont gardés
  const apply = useCallback((preview) => {
    const draft = readDraft(draftKey(school?.id, preview.from_year.id));
    setData(preview);
    setTargets((current) => Object.fromEntries(preview.classes.map((c) => [
      c.id,
      c.id in current ? current[c.id] : draft?.targets && c.id in draft.targets ? draft.targets[c.id] : c.default_target,
    ])));
    setChoices((current) => Object.fromEntries(preview.students.map((s) => [
      s.enrollment_id,
      current[s.enrollment_id] ?? draft?.choices?.[s.enrollment_id] ?? proposalOf(s),
    ])));
    setName((current) => current || preview.suggested_name);
  }, [school?.id]);

  const load = useCallback(() => api.get("/school/year-transition").then(({ data }) => apply(data)), [apply]);

  useEffect(() => {
    let ignore = false;
    api.get("/school/year-transition")
      .then(({ data }) => { if (!ignore) apply(data); })
      .catch((error) => toast.error(error.message));
    return () => { ignore = true; };
  }, [apply]);

  useNavbarRefresh(step === "decide" ? load : null);

  // Brouillon des décisions (gardé si on quitte la page avant de valider)
  useEffect(() => {
    if (data && step === "decide" && !isJustDone(data)) writeDraft(draftKey(school?.id, data.from_year.id), { targets, choices });
  }, [data, step, targets, choices, school?.id]);

  const classesById = useMemo(() => Object.fromEntries((data?.classes ?? []).map((c) => [c.id, c])), [data]);

  const resolved = useMemo(() => Object.fromEntries((data?.students ?? []).map((s) => [
    s.enrollment_id,
    resolveChoice(s, choices[s.enrollment_id] ?? "", classesById, targets),
  ])), [data, choices, classesById, targets]);

  const totals = useMemo(() => countKinds(Object.values(resolved)), [resolved]);

  if (!data) return <LoadingSkeleton />;

  const last = data.last_transition;
  const justDone = isJustDone(data);

  const undo = async (transition) => {
    const { from_year_name: from, to_year_name: to } = transition.summary;
    if (!(await confirm(`Les élèves réinscrits dans ${to} et les affectations reprises seront supprimés ; ${from} redeviendra l'année en cours.`, { title: "Annuler le passage" }))) return;
    try {
      const { data: response } = await api.post(`/school/year-transitions/${transition.id}/undo`);
      toast.success(response.message);
      setChoices({});
      setTargets({});
      setName("");
      setStep("decide");
      refreshUser().catch(() => {});
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (justDone) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Passage à l'année suivante" subtitle={`${last.summary.from_year_name} → ${last.summary.to_year_name}`} />
        <TransitionDone transition={last} onUndo={() => undo(last)} />
      </div>
    );
  }

  const students = data.students;
  const classes = data.classes.filter((c) => c.students_count > 0);
  const withAverage = students.filter((s) => s.average !== null).length;
  const undecided = totals.undecided;

  const setChoice = (enrollmentId, value) => setChoices((current) => ({ ...current, [enrollmentId]: value }));
  const setClassChoices = (classroomId, valueOf) => setChoices((current) => {
    const next = { ...current };
    students.filter((s) => s.classroom_id === classroomId).forEach((s) => { next[s.enrollment_id] = valueOf(s); });
    return next;
  });

  const submit = async () => {
    const enrolled = totals.promote + totals.repeat;
    if (!(await confirm(
      `${enrolled} élève(s) seront inscrits dans ${name}, qui deviendra l'année en cours. Vous pourrez annuler tant qu'aucune note n'y aura été saisie.`,
      { title: "Valider le passage" },
    ))) return;

    setSubmitting(true);
    try {
      const { data: response } = await api.post("/school/year-transition", {
        name,
        copy_assignments: copyAssignments,
        decisions: students.map((s) => ({ enrollment_id: s.enrollment_id, classroom_id: resolved[s.enrollment_id].to ?? null })),
      });
      toast.success(response.message);
      writeDraft(draftKey(school?.id, data.from_year.id), null);
      refreshUser().catch(() => {});
      await load();
      setStep("decide");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-4">
      <PageHeader title="Passage à l'année suivante" subtitle={`${data.from_year.name} → ${name || data.suggested_name} : admis, redoublants et départs de vos élèves.`} />

      <Steps step={step} />

      {students.length === 0 ? (
        <section className="surface p-6 text-sm text-base-content/70">
          Aucun élève n'est inscrit en {data.from_year.name}. Pour commencer une nouvelle année sans élèves, créez-la dans{" "}
          <Link to="/calendar" className="font-medium text-primary">Calendrier</Link>.
        </section>
      ) : step === "decide" ? (
        <>
          <section className="flex gap-3 rounded-md bg-info/10 p-4 text-sm text-base-content/80">
            <Info size={18} className="mt-0.5 shrink-0 text-info" />
            <div className="space-y-1">
              <p>
                Les décisions sont proposées d'après la moyenne annuelle : <strong>10 et plus</strong>, l'élève passe en classe supérieure ;
                sinon, il redouble. Modifiez-les librement selon le conseil de classe.
              </p>
              <p className="text-base-content/60">
                {withAverage} élève(s) sur {students.length} ont une moyenne (calculée sur les trimestres dont les bulletins ont été générés).
                {withAverage < students.length && " Les autres sont « à décider »."}
              </p>
            </div>
          </section>

          <div className="space-y-3">
            {classes.map((classroom) => (
              <ClassDecisions
                key={classroom.id}
                classroom={classroom}
                classes={data.classes}
                classesById={classesById}
                students={students.filter((s) => s.classroom_id === classroom.id)}
                termsCount={data.terms_count}
                target={targets[classroom.id] ?? null}
                onTarget={(value) => setTargets((current) => ({ ...current, [classroom.id]: value }))}
                choices={choices}
                resolved={resolved}
                onChoice={setChoice}
                onAllPromote={() => setClassChoices(classroom.id, () => PROMOTE)}
                onProposals={() => setClassChoices(classroom.id, proposalOf)}
                open={Boolean(openClasses[classroom.id])}
                onToggle={() => setOpenClasses((current) => ({ ...current, [classroom.id]: !current[classroom.id] }))}
              />
            ))}
          </div>

          <div className="surface sticky bottom-24 z-10 flex flex-col gap-3 p-4 shadow-2xl shadow-black/50 sm:flex-row sm:items-center sm:justify-between lg:bottom-4">
            <Totals totals={totals} />
            <button type="button" disabled={undecided > 0} onClick={() => setStep("confirm")}
              className="ui-btn ui-btn-primary">
              {undecided > 0 ? `${undecided} élève(s) à décider` : "Continuer"} {undecided === 0 && <ArrowRight size={15} />}
            </button>
          </div>
        </>
      ) : (
        <ConfirmStep
          data={data}
          classes={classes}
          classesById={classesById}
          resolved={resolved}
          totals={totals}
          name={name}
          onName={setName}
          copyAssignments={copyAssignments}
          onCopyAssignments={setCopyAssignments}
          submitting={submitting}
          onBack={() => setStep("decide")}
          onSubmit={submit}
        />
      )}
    </div>
  );
}

function Steps({ step }) {
  const items = [["decide", "Décisions"], ["confirm", "Vérification et validation"]];

  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs font-medium">
      {items.map(([key, text], index) => (
        <li key={key} className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 ${step === key ? "bg-white text-night shadow-sm" : "bg-white/8 text-white/60 ring-1 ring-white/10"}`}>
          <span>{index + 1}.</span> {text}
        </li>
      ))}
    </ol>
  );
}

function Totals({ totals }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs font-medium">
      <span className="rounded-sm bg-success/10 px-2 py-1 text-success">{totals.promote} passent</span>
      <span className="rounded-sm bg-warning/10 px-2 py-1 text-warning">{totals.repeat} redoublent</span>
      <span className="rounded-sm bg-base-300 px-2 py-1 text-base-content/70">{totals.leave} quittent</span>
      {totals.undecided > 0 && <span className="rounded-sm bg-error/10 px-2 py-1 text-error">{totals.undecided} à décider</span>}
    </div>
  );
}

function ClassDecisions({ classroom, classes, classesById, students, termsCount, target, onTarget, choices, resolved, onChoice, onAllPromote, onProposals, open, onToggle }) {
  const active = classes.filter((c) => c.active);
  const higher = active.filter((c) => c.level_index > classroom.level_index);
  const sameLevel = active.filter((c) => c.level_index === classroom.level_index && c.id !== classroom.id);
  const nextLevelMissing = higher.length > 0 && !higher.some((c) => c.level_index === classroom.level_index + 1);
  const targetClass = classesById[target];
  const totals = countKinds(students.map((s) => resolved[s.enrollment_id]));

  return (
    <section className="surface">
      <div className="space-y-3 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-base-content">{classroom.name}</h2>
            <p className="text-xs text-base-content/50">{students.length} élève(s)</p>
          </div>
          <Totals totals={totals} />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <label className="block space-y-1.5 md:w-80">
            <span className="text-xs font-medium text-base-content/60">Classe des admis</span>
            <select value={target ?? ""} onChange={(e) => onTarget(e.target.value ? Number(e.target.value) : null)}
              className="ui-field w-full">
              <option value="">Aucune : les admis quittent l'établissement</option>
              {higher.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onProposals}
              className="ui-btn ui-btn-soft ui-btn-sm">
              Selon les moyennes
            </button>
            <button type="button" onClick={onAllPromote}
              className="ui-btn ui-btn-soft ui-btn-sm">
              Tous admis
            </button>
            <button type="button" onClick={onToggle} aria-expanded={open}
              className="ui-btn bg-primary/10 text-primary ui-btn-sm hover:bg-primary/15">
              {open ? "Masquer les élèves" : "Voir les élèves"} <ChevronDown size={14} className={open ? "rotate-180" : ""} />
            </button>
          </div>
        </div>

        {nextLevelMissing && !target && (
          <p className="text-xs font-medium text-warning">Aucune classe du niveau suivant n'est ouverte : choisissez la classe des admis, ou laissez-les quitter l'établissement.</p>
        )}
        {totals.undecided > 0 && !open && (
          <p className="text-xs font-medium text-error">{totals.undecided} élève(s) sans moyenne : ouvrez la liste pour décider.</p>
        )}
      </div>

      {open && (
        <ul className="space-y-1 px-2 pb-2">
          {students.map((student) => {
            const choice = choices[student.enrollment_id] ?? "";
            return (
              <li key={student.enrollment_id} className="grid grid-cols-1 items-center gap-2 rounded-xl bg-base-100 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_7.5rem_15rem] ring-1 ring-base-300/60">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-base-content">{student.name}</p>
                  <p className="font-mono text-xs text-base-content/50">{student.matricule}</p>
                </div>
                <div className="whitespace-nowrap text-sm">
                  {student.average === null ? (
                    <span className="text-base-content/40">Sans moyenne</span>
                  ) : (
                    <span className={student.average >= 10 ? "font-semibold text-success" : "font-semibold text-error"}>
                      {student.average.toFixed(2)}
                      {student.terms < termsCount && <span className="ml-1 text-xs font-normal text-base-content/40">({student.terms}/{termsCount} trim.)</span>}
                    </span>
                  )}
                </div>
                <select value={choice} onChange={(e) => onChoice(student.enrollment_id, e.target.value)} aria-label={`Décision pour ${student.name}`}
                  className={`ui-field py-2 ${choice === "" ? "ui-field-error text-error" : ""}`}>
                  {choice === "" && <option value="" disabled>À décider</option>}
                  <optgroup label="Admis">
                    <option value={PROMOTE}>{targetClass ? `Passe en ${label(targetClass)}` : "Admis, quitte l'établissement"}</option>
                    {higher.filter((c) => c.id !== target || choice === `to:${c.id}`).map((c) => (
                      <option key={c.id} value={`to:${c.id}`}>Passe en {label(c)}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Redoublement">
                    {classroom.active && <option value={REPEAT}>Redouble en {label(classroom)}</option>}
                    {sameLevel.map((c) => <option key={c.id} value={`to:${c.id}`}>Redouble en {label(c)}</option>)}
                  </optgroup>
                  <option value={LEAVE}>Quitte l'établissement</option>
                </select>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ConfirmStep({ data, classes, classesById, resolved, totals, name, onName, copyAssignments, onCopyAssignments, submitting, onBack, onSubmit }) {
  const existing = data.target_year && data.target_year.name === name.replace(/\s+/g, "");
  const enrolled = totals.promote + totals.repeat;

  const rows = classes.map((classroom) => {
    const items = data.students.filter((s) => s.classroom_id === classroom.id).map((s) => resolved[s.enrollment_id]);
    const destinations = Object.entries(items.reduce((acc, item) => {
      if (item.to) acc[item.to] = (acc[item.to] ?? 0) + 1;
      return acc;
    }, {})).map(([id, count]) => `${label(classesById[id])} (${count})`);
    return { classroom, totals: countKinds(items), destinations };
  });

  return (
    <div className="space-y-4">
      <section className="surface space-y-4 p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/15"><CalendarCheck size={18} /></div>
          <h2 className="text-base font-semibold text-base-content">Nouvelle année</h2>
        </div>
        <label className="block space-y-1.5 sm:w-64">
          <span className="text-xs font-medium text-base-content/60">Année (ex : {data.suggested_name})</span>
          <input value={name} onChange={(e) => onName(e.target.value)} className="ui-field w-full" />
        </label>
        <p className="text-xs text-base-content/60">
          {existing
            ? `${data.target_year.name} existe déjà dans votre calendrier : elle sera utilisée${data.target_year.enrollments_count ? ` (les ${data.target_year.enrollments_count} élève(s) déjà inscrits ne seront pas inscrits une seconde fois)` : ""}.`
            : "Elle sera créée avec 3 trimestres et 6 séquences, modifiables ensuite dans « Calendrier »."}
        </p>
        {data.assignments_count > 0 && (
          <label className="flex cursor-pointer items-start gap-3 text-sm text-base-content">
            <input type="checkbox" className="checkbox checkbox-primary checkbox-sm mt-0.5" checked={copyAssignments} onChange={(e) => onCopyAssignments(e.target.checked)} />
            <span>
              Reprendre les {data.assignments_count} affectation(s) des enseignants
              <span className="block text-xs text-base-content/50">Même enseignant, même classe, même matière. Les enseignants partis ne sont pas repris.</span>
            </span>
          </label>
        )}
      </section>

      <section className="surface space-y-3 p-5 md:p-6">
        <h2 className="text-base font-semibold text-base-content">Récapitulatif</h2>
        <div className="space-y-2">
          {rows.map(({ classroom, totals: t, destinations }) => (
            <div key={classroom.id} className="flex flex-col gap-1 rounded-xl bg-base-100 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between ring-1 ring-base-300/60">
              <span className="font-medium text-base-content">{classroom.name}</span>
              <span className="text-xs text-base-content/60">
                {t.promote} passent · {t.repeat} redoublent · {t.leave} quittent
                {destinations.length > 0 && <span className="block md:inline md:before:content-['_—_']">vers {destinations.join(", ")}</span>}
              </span>
            </div>
          ))}
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-base-content/70">
          <li>{enrolled} élève(s) seront inscrits dans {name} ; {totals.leave} ne seront pas réinscrits.</li>
          <li>{name} deviendra l'année en cours : inscriptions, notes et bulletins porteront sur elle.</li>
          <li>Les notes et bulletins de {data.from_year.name} sont conservés.</li>
          <li>Vous pourrez annuler le passage tant qu'aucune note n'aura été saisie dans {name}.</li>
        </ul>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" onClick={onBack}
          className="ui-btn ui-btn-soft">
          <ArrowLeft size={15} /> Modifier les décisions
        </button>
        <button type="button" onClick={onSubmit} disabled={submitting || !name.trim()}
          className="ui-btn ui-btn-primary">
          <GraduationCap size={16} /> {submitting ? "Passage en cours..." : "Valider le passage"}
        </button>
      </div>
    </div>
  );
}

function TransitionDone({ transition, onUndo }) {
  const s = transition.summary;

  return (
    <section className="surface space-y-5 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-success/10 text-success"><CheckCircle2 size={18} /></div>
        <div>
          <h2 className="text-base font-semibold text-base-content">{s.to_year_name} est l'année en cours</h2>
          <p className="mt-0.5 text-sm text-base-content/60">
            Passage effectué le {new Date(transition.created_at).toLocaleDateString("fr-FR")}{transition.user ? ` par ${transition.user}` : ""}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat value={s.promoted} text="passent en classe supérieure" />
        <Stat value={s.repeated} text="redoublent" />
        <Stat value={s.left} text="quittent l'établissement" />
        <Stat value={s.assignments} text="affectation(s) reprises" />
      </div>
      {s.skipped > 0 && <p className="text-xs text-base-content/60">{s.skipped} élève(s) déjà inscrits dans {s.to_year_name} n'ont pas été inscrits une seconde fois.</p>}

      <div className="space-y-2 text-sm">
        <p className="font-medium text-base-content">Pour bien commencer {s.to_year_name} :</p>
        <div className="flex flex-wrap gap-2">
          <Link to="/students" className="ui-btn ui-btn-primary ui-btn-sm">Inscrire les nouveaux élèves</Link>
          <Link to="/director/teachers" className="ui-btn ui-btn-soft ui-btn-sm">Vérifier les affectations</Link>
          <Link to="/calendar" className="ui-btn ui-btn-soft ui-btn-sm">Vérifier le calendrier</Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-base-100 p-4 sm:flex-row sm:items-center sm:justify-between ring-1 ring-base-300/60">
        <p className="text-xs text-base-content/60">Une erreur ? Le passage peut être annulé tant qu'aucune note n'a été saisie dans {s.to_year_name}.</p>
        <button type="button" onClick={onUndo}
          className="ui-btn ui-btn-danger ui-btn-sm shrink-0">
          <RotateCcw size={13} /> Annuler le passage
        </button>
      </div>
    </section>
  );
}

function Stat({ value, text }) {
  return (
    <div className="rounded-xl bg-base-100 p-4 ring-1 ring-base-300/60">
      <p className="text-lg font-semibold text-base-content">{value}</p>
      <p className="text-xs text-base-content/60">{text}</p>
    </div>
  );
}
