import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { BookCheck, CalendarClock, ClipboardCheck, LockKeyhole, MessageCircle, UserX, Users } from "lucide-react";
import { api } from "../../utils/AxiosClient";
import { useAuth } from "../../context/AuthContext";
import useNavbarRefresh from "../../hooks/useNavbarRefresh";
import usePrintable from "../../utils/usePrintable";
import { formatSchoolDateTime } from "../../utils/schoolTime";
import PageHeader from "../../components/elements/PageHeader";
import LoadingSkeleton from "../../components/LoadingSkeletoon";
import PrintableTable from "../../components/print/PrintableTable";
import AreaChart from "../../components/charts/AreaChart";
import { ActivityBoard, Metric, MiniBar } from "../../components/dashboard/Board";

const STATUS = {
  complete: { label: "Complet", className: "bg-success/10 text-success" },
  partial: { label: "En cours", className: "bg-warning/10 text-warning" },
  empty: { label: "Rien saisi", className: "bg-error/10 text-error" },
  no_students: { label: "Aucun élève", className: "bg-base-300 text-base-content/60" },
  no_skills: { label: "Compétences à définir", className: "bg-base-300 text-base-content/60" },
};

const formatDateTime = (value) => (value ? new Date(value).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—");
const periodLabel = (p) => (p.term ? `${p.name} (${p.term})` : p.name);

/**
 * Suivi de la saisie des notes d'une séquence (ou d'un trimestre) :
 * avancement par enseignant et par classe, relances WhatsApp en un clic.
 */
export default function MarkProgress() {
  const { setNavbarActions } = useOutletContext();
  const { can } = useAuth();
  const [data, setData] = useState(null);
  const [periodId, setPeriodId] = useState(null); // null : période proposée par le serveur
  const [view, setView] = useState("teachers");
  const { printRef, print } = usePrintable("Suivi de la saisie des notes");

  const fetchReport = useCallback(
    (id) => api.get("/mark-progress", { params: id ? { period_id: id } : {} }).then(({ data }) => setData(data)),
    [],
  );

  useEffect(() => {
    let ignore = false;
    api.get("/mark-progress", { params: periodId ? { period_id: periodId } : {} })
      .then(({ data }) => { if (!ignore) setData(data); })
      .catch((error) => toast.error(error.message));
    return () => { ignore = true; };
  }, [periodId]);

  useNavbarRefresh(() => fetchReport(periodId));

  useEffect(() => {
    setNavbarActions({ onPrint: print });
    return () => setNavbarActions({});
  }, [setNavbarActions, print]);

  if (!data) return <LoadingSkeleton />;

  const { period, summary } = data;
  const loading = periodId !== null && data.period.id !== periodId;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PrintableTable
        ref={printRef}
        title={`Saisie des notes — ${periodLabel(period)}`}
        meta={[
          { label: "Notes saisies", value: `${summary.entered}/${summary.expected} (${summary.percent} %)` },
          { label: "Matières complètes", value: `${summary.complete}/${summary.pairs}` },
        ]}
        columns={[
          { key: "classroom", label: "Classe" },
          { key: "subject", label: "Matière" },
          { key: "teachers", label: "Enseignant(s)" },
          { key: "marks", label: "Notes" },
          { key: "status", label: "État" },
        ]}
        rows={data.classes.flatMap((c) => c.subjects.map((s) => ({
          id: `${c.id}-${s.subject_id}`,
          classroom: c.name,
          subject: s.subject,
          teachers: s.teachers.map((t) => t.name).join(", ") || "Aucun",
          marks: `${s.entered}/${s.expected}`,
          status: STATUS[s.status]?.label,
        })))}
      />

      <PageHeader title="Suivi de la saisie des notes" subtitle="Qui a saisi ses notes, qui doit encore le faire, et relance par WhatsApp en un clic." />

      <section className="surface flex flex-col gap-4 p-5 md:flex-row md:items-end md:justify-between">
        <label className="block space-y-1.5 md:w-80">
          <span className="text-xs font-medium text-base-content/60">{data.mode === "skill" ? "Trimestre" : "Séquence"}</span>
          <select value={period.id} onChange={(e) => setPeriodId(Number(e.target.value))}
            className="ui-field w-full">
            {data.periods.map((p) => (
              <option key={p.id} value={p.id}>{periodLabel(p)}{p.is_closed ? " — clôturée" : ""}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {period.is_closed ? (
            <span className="ui-chip bg-error/10 text-error"><LockKeyhole size={13} /> Saisie clôturée</span>
          ) : period.deadline ? (
            <span className="ui-chip bg-warning/10 text-warning"><CalendarClock size={13} /> Date limite : {formatSchoolDateTime(period.deadline)}</span>
          ) : (
            <span className="text-xs text-base-content/50">Sans date limite</span>
          )}
          {can("calendar") && (
            <Link to="/calendar" className="text-xs font-medium text-primary">{period.deadline || period.is_closed ? "Gérer la clôture" : "Fixer une date limite"}</Link>
          )}
        </div>
      </section>

      <div className={`space-y-5 transition-opacity duration-150 ${loading ? "opacity-60" : ""}`}>
        <ActivityBoard
          title={`Avancement — ${periodLabel(period)}`}
          subtitle="Part des notes saisies dans chaque classe"
          columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
          action={data.group_url && (
            <a href={data.group_url} target="_blank" rel="noreferrer" className="ui-btn ui-btn-success ui-btn-sm">
              <MessageCircle size={14} /> Message au groupe
            </a>
          )}
          chart={
            <AreaChart
              tone="dark"
              title="Notes saisies par classe"
              data={data.classes
                .map((c) => {
                  const expected = c.subjects.reduce((sum, x) => sum + x.expected, 0);
                  const entered = c.subjects.reduce((sum, x) => sum + x.entered, 0);
                  return { label: c.short_name || c.name, expected, value: expected > 0 ? Math.floor((entered * 100) / expected) : 0 };
                })
                .filter((c) => c.expected > 0)}
              series={[{ key: "value", label: "Notes saisies" }]}
              max={100}
              formatValue={(v) => `${Math.round(v)} %`}
              emptyText="Aucune note attendue pour cette période."
            />
          }
        >
          <Metric icon={ClipboardCheck} label="Notes saisies" value={summary.percent} format={(n) => `${n} %`} hint={`${summary.entered} sur ${summary.expected}`} />
          <Metric icon={BookCheck} label="Matières complètes" value={summary.complete} hint={`sur ${summary.pairs} matière(s)`} />
          <Metric icon={Users} label="Enseignants en retard" value={summary.teachers_late} tone={summary.teachers_late ? "attention" : "default"} />
          <Metric icon={UserX} label="Sans enseignant" value={summary.unassigned} tone={summary.unassigned ? "attention" : "default"}
            to={summary.unassigned > 0 && can("assignments") ? "/director/teachers" : undefined} hint={summary.unassigned > 0 ? "Affecter un enseignant" : "Toutes affectées"} />
          <Metric icon={CalendarClock} label="Saisie" value={period.is_closed ? "Clôturée" : period.deadline ? "Ouverte" : "Sans date"}
            hint={period.deadline && !period.is_closed ? `jusqu'au ${formatSchoolDateTime(period.deadline)}` : undefined} />
        </ActivityBoard>

        <div className="inline-flex gap-1 rounded-full bg-white/6 p-1 ring-1 ring-white/10">
          {[["teachers", "Par enseignant"], ["classes", "Par classe"]].map(([value, text]) => (
            <button key={value} type="button" onClick={() => setView(value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200 ${view === value ? "bg-white text-night shadow" : "text-white/65 hover:text-white"}`}>
              {text}
            </button>
          ))}
        </div>

        {data.classes.length === 0 ? (
          <div className="surface p-8 text-center text-sm text-base-content/60">
            Aucune matière configurée dans vos classes : commencez par « Classes et matières ».
          </div>
        ) : view === "teachers" ? (
          <TeacherList teachers={data.teachers} unassigned={data.unassigned} />
        ) : (
          <ClassList classes={data.classes} />
        )}
      </div>
    </div>
  );
}

function StatusChip({ status }) {
  const chip = STATUS[status] ?? STATUS.partial;
  return <span className={`ui-chip ${chip.className}`}>{chip.label}</span>;
}

function TeacherList({ teachers, unassigned }) {
  return (
    <div className="space-y-3">
      <div className="surface divide-y divide-base-300/70 overflow-hidden">
      {teachers.length === 0 && <p className="p-6 text-sm text-base-content/60">Aucun enseignant affecté à des classes avec des élèves.</p>}
      {teachers.map((teacher) => (
        <section key={teacher.id} className="space-y-3 p-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-base-content">{teacher.name}</p>
              <div className="mt-1.5 flex items-center gap-3">
                <span className="w-40"><MiniBar value={teacher.percent} tone={teacher.missing === 0 ? "success" : "primary"} /></span>
                <span className="text-xs text-base-content/60">{teacher.entered}/{teacher.expected} notes</span>
              </div>
            </div>
            {teacher.missing === 0 ? (
              <span className="ui-chip self-start bg-success/10 text-success sm:self-center">À jour</span>
            ) : teacher.reminder_url ? (
              <a href={teacher.reminder_url} target="_blank" rel="noreferrer"
                className="ui-btn ui-btn-success ui-btn-sm shrink-0">
                <MessageCircle size={14} /> Relancer par WhatsApp
              </a>
            ) : (
              <span className="self-start text-xs text-base-content/50 sm:self-center">Pas de téléphone enregistré</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {teacher.pairs.map((pair) => (
              <span key={`${pair.classroom}-${pair.subject}`} className="inline-flex items-center gap-2 rounded-xl bg-base-100 px-3 py-1.5 text-xs text-base-content/80 ring-1 ring-base-300/60">
                {pair.classroom} · {pair.subject}
                <span className="font-medium text-base-content">{pair.entered}/{pair.expected}</span>
                <StatusChip status={pair.status} />
              </span>
            ))}
          </div>
        </section>
      ))}
      </div>

      {unassigned.length > 0 && (
        <section className="space-y-2 rounded-2xl bg-error/10 p-4 ring-1 ring-error/25">
          <p className="text-sm font-semibold text-base-content">Sans enseignant affecté</p>
          <p className="text-xs text-base-content/70">Personne ne peut saisir ces notes tant qu'aucun enseignant n'y est affecté.</p>
          <div className="flex flex-wrap gap-2">
            {unassigned.map((pair) => (
              <span key={`${pair.classroom}-${pair.subject}`} className="rounded-xl bg-base-100 px-3 py-1.5 text-xs text-base-content/80 ring-1 ring-base-300/60">{pair.classroom} · {pair.subject}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ClassList({ classes }) {
  return (
    <div className="space-y-3">
      {classes.map((classroom) => {
        const expected = classroom.subjects.reduce((sum, s) => sum + s.expected, 0);
        const entered = classroom.subjects.reduce((sum, s) => sum + s.entered, 0);
        return (
          <section key={classroom.id} className="surface">
            <div className="flex flex-wrap items-center justify-between gap-2 p-4">
              <div>
                <h2 className="text-sm font-semibold text-base-content">{classroom.name}</h2>
                <p className="text-xs text-base-content/50">{classroom.students} élève(s)</p>
              </div>
              {expected > 0 && <span className="text-xs text-base-content/60">{entered}/{expected} notes ({Math.floor((entered * 100) / expected)} %)</span>}
            </div>
            <ul className="space-y-1 px-2 pb-2">
              {classroom.subjects.map((subject) => (
                <li key={subject.subject_id} className="grid grid-cols-1 items-center gap-2 rounded-xl bg-base-100 px-3 py-2.5 text-sm sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)_7rem_8.5rem_auto] ring-1 ring-base-300/60">
                  <span className="font-medium text-base-content">{subject.subject}</span>
                  <span className={subject.teachers.length ? "text-base-content/70" : "font-medium text-error"}>
                    {subject.teachers.map((t) => t.name).join(", ") || "Aucun enseignant"}
                  </span>
                  <span className="text-base-content/80">{subject.entered}/{subject.expected}</span>
                  <span className="text-xs text-base-content/50" title="Dernière saisie">{formatDateTime(subject.last_entry_at)}</span>
                  <span className="sm:justify-self-end"><StatusChip status={subject.status} /></span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
