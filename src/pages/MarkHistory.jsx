import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, History, Search, WifiOff, X } from "lucide-react";
import { api } from "../utils/AxiosClient";
import useNavbarRefresh from "../hooks/useNavbarRefresh";
import usePrintable from "../utils/usePrintable";
import PageHeader from "../components/elements/PageHeader";
import LoadingSkeleton from "../components/LoadingSkeletoon";
import PrintableTable from "../components/print/PrintableTable";

const TYPES = [
  ["all", "Toutes"],
  ["created", "Saisies"],
  ["updated", "Modifications"],
  ["deleted", "Suppressions"],
];

const TYPE_CHIPS = {
  created: { label: "Saisie", className: "bg-info/10 text-info" },
  updated: { label: "Modification", className: "bg-warning/10 text-warning" },
  deleted: { label: "Suppression", className: "bg-error/10 text-error" },
};

const ROLE_CHIPS = {
  teacher: { label: "Enseignant", className: "bg-base-300 text-base-content/70" },
  // Note changée par la direction, et non par l'enseignant de la matière
  director: { label: "Direction", className: "bg-accent/10 text-accent" },
};

const EMPTY_SELECTION = { classroom_id: "", subject_id: "", term_id: "", user_id: "", type: "all" };

const formatDate = (value) => (value ? new Date(value).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "");
const formatMark = (value) => (value === null || value === undefined ? "—" : Number(value).toFixed(2));
const assignmentKey = (a) => `${a.school_id}-${a.classroom_id}-${a.subject_id}`;
const periodOf = (row) => [row.term, row.is_skill ? `Compétence : ${row.period}` : row.period].filter(Boolean).join(" · ");

/**
 * Historique des notes : qui a saisi, modifié ou effacé une note, et quand.
 * Direction (droit « Bulletins ») : toute l'école ; enseignant : ses classes et matières.
 */
export default function MarkHistory() {
  const { setNavbarActions } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const studentId = searchParams.get("student_id");
  const studentName = searchParams.get("student_name");
  const [filters, setFilters] = useState(null);
  const [yearId, setYearId] = useState(null); // null : année en cours
  const [selection, setSelection] = useState(EMPTY_SELECTION);
  const [assignment, setAssignment] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null); // { key, data, meta }
  const { printRef, print } = usePrintable("Historique des notes");

  useEffect(() => {
    let ignore = false;
    api.get("/mark-history/filters", { params: yearId ? { academic_year_id: yearId } : {} })
      .then(({ data }) => { if (!ignore) setFilters(data); })
      .catch((error) => toast.error(error.message));
    return () => { ignore = true; };
  }, [yearId]);

  // Recherche d'élève : envoyée après une courte pause de frappe
  useEffect(() => {
    const next = searchInput.trim();
    if (next === search) return undefined;
    const timer = setTimeout(() => {
      setSearch(next);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  const teacherAssignment = filters?.mode === "teacher"
    ? filters.assignments.find((a) => assignmentKey(a) === assignment) ?? filters.assignments[0]
    : null;

  // Paramètres de la requête ; la clé sert à savoir si l'affichage est à jour
  const requestKey = useMemo(() => {
    if (!filters) return null;
    const base = { type: selection.type, search: search || undefined, student_id: studentId || undefined, page };
    if (filters.mode === "teacher") {
      if (!teacherAssignment) return null;
      const { school_id, classroom_id, subject_id } = teacherAssignment;
      return JSON.stringify({ ...base, school_id, classroom_id, subject_id });
    }
    return JSON.stringify({
      ...base,
      academic_year_id: filters.academic_year_id,
      classroom_id: selection.classroom_id || undefined,
      subject_id: selection.subject_id || undefined,
      term_id: selection.term_id || undefined,
      user_id: selection.user_id || undefined,
    });
  }, [filters, selection, search, studentId, page, teacherAssignment]);

  const fetchHistory = (key) => api.get("/mark-history", { params: JSON.parse(key) })
    .then(({ data }) => setResult({ key, ...data }))
    .catch((error) => {
      setResult({ key, data: [], meta: null });
      throw error;
    });

  useEffect(() => {
    if (!requestKey) return undefined;
    let ignore = false;
    api.get("/mark-history", { params: JSON.parse(requestKey) })
      .then(({ data }) => { if (!ignore) setResult({ key: requestKey, ...data }); })
      .catch((error) => {
        if (ignore) return;
        setResult({ key: requestKey, data: [], meta: null });
        toast.error(error.message);
      });
    return () => { ignore = true; };
  }, [requestKey]);

  useNavbarRefresh(requestKey ? () => fetchHistory(requestKey) : null);

  useEffect(() => {
    setNavbarActions({ onPrint: print });
    return () => setNavbarActions({});
  }, [setNavbarActions, print]);

  if (!filters) return <LoadingSkeleton />;

  const rows = result?.data ?? [];
  const meta = result?.meta;
  const loading = result?.key !== requestKey;

  const choose = (field) => (event) => {
    setSelection((current) => ({ ...current, [field]: event.target.value }));
    setPage(1);
  };

  const clearStudent = () => {
    setSearchParams({});
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PrintableTable
        ref={printRef}
        title="Historique des notes"
        meta={[
          { label: "Changements", value: meta?.total ?? rows.length },
          ...(meta && meta.last_page > 1 ? [{ label: "Page", value: `${meta.current_page}/${meta.last_page}` }] : []),
        ]}
        columns={[
          { key: "date", label: "Date" },
          { key: "student", label: "Élève" },
          { key: "matricule", label: "Matricule" },
          { key: "classroom", label: "Classe" },
          { key: "subject", label: "Matière" },
          { key: "period", label: "Période" },
          { key: "change", label: "Note" },
          { key: "author", label: "Auteur" },
        ]}
        rows={rows.map((row) => ({
          id: row.id,
          date: formatDate(row.created_at) + (row.offline_saved_at ? ` (hors ligne : ${formatDate(row.offline_saved_at)})` : ""),
          student: row.student?.name,
          matricule: row.student?.matricule,
          classroom: row.classroom,
          subject: row.subject,
          period: periodOf(row),
          change: `${formatMark(row.old_mark)} → ${formatMark(row.new_mark)}${row.after_closure ? " (après clôture)" : ""}`,
          author: `${row.author} (${ROLE_CHIPS[row.author_role]?.label ?? row.author_role})`,
        }))}
      />

      <PageHeader title="Historique des notes" subtitle="Qui a saisi, modifié ou effacé une note, et quand." />

      <section className="surface space-y-4 p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filters.mode === "school" ? (
            <>
              <Select label="Année scolaire" value={filters.academic_year_id} onChange={(e) => { setYearId(Number(e.target.value)); setSelection(EMPTY_SELECTION); setPage(1); }}>
                {filters.years.map((y) => <option key={y.id} value={y.id}>{y.name}{y.is_active ? " (en cours)" : ""}</option>)}
              </Select>
              <Select label="Classe" value={selection.classroom_id} onChange={choose("classroom_id")}>
                <option value="">Toutes les classes</option>
                {filters.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select label="Matière" value={selection.subject_id} onChange={choose("subject_id")}>
                <option value="">Toutes les matières</option>
                {filters.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <Select label="Trimestre" value={selection.term_id} onChange={choose("term_id")}>
                <option value="">Tous les trimestres</option>
                {filters.terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
              <Select label="Auteur" value={selection.user_id} onChange={choose("user_id")}>
                <option value="">Tous les auteurs</option>
                {filters.authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </>
          ) : (
            <Select label="Classe et matière" value={teacherAssignment ? assignmentKey(teacherAssignment) : ""} onChange={(e) => { setAssignment(e.target.value); setPage(1); }}>
              {filters.assignments.length === 0 && <option value="">Aucune classe affectée</option>}
              {filters.assignments.map((a) => (
                <option key={assignmentKey(a)} value={assignmentKey(a)}>{a.classroom_name} — {a.subject_name}{filters.assignments.some((b) => b.school_id !== a.school_id) ? ` (${a.school_name})` : ""}</option>
              ))}
            </Select>
          )}

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-base-content/60">Élève</span>
            <span className="flex items-center gap-2 rounded-xl bg-base-100 px-3 py-2.5 ring-1 ring-base-300/60">
              <Search size={15} className="text-base-content/40" />
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Nom ou matricule"
                className="w-full bg-transparent text-sm outline-none" />
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {TYPES.map(([value, text]) => (
            <button key={value} type="button" onClick={() => { setSelection((current) => ({ ...current, type: value })); setPage(1); }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${selection.type === value ? "bg-primary text-primary-content" : "bg-base-100 text-base-content/70 hover:bg-base-300"}`}>
              {text}
            </button>
          ))}
          {studentId && (
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              Élève : {studentName || `n° ${studentId}`}
              <button type="button" onClick={clearStudent} title="Voir tous les élèves" className="rounded-sm hover:bg-primary/15"><X size={13} /></button>
            </span>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-base-content/60">
        <span>{meta ? `${meta.total} changement(s)` : ""}</span>
        {filters.since && <span>Historique conservé depuis le {new Date(filters.since).toLocaleDateString("fr-FR")}</span>}
      </div>

      {filters.mode === "teacher" && filters.assignments.length === 0 ? (
        <Empty text="Vous n'avez aucune classe affectée cette année." />
      ) : !result ? (
        <LoadingSkeleton />
      ) : rows.length === 0 ? (
        <Empty text={filters.since ? "Aucun changement de note pour ces critères." : "L'historique commence avec la prochaine note saisie ou modifiée."} />
      ) : (
        <div className={`space-y-3 transition-opacity duration-150 ${loading ? "opacity-60" : ""}`}>
          {/* Téléphone : cartes */}
          <ul className="space-y-2 md:hidden">
            {rows.map((row) => (
              <li key={row.id} className="surface space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-base-content">{row.student?.name}</p>
                    <p className="text-xs text-base-content/50">{row.classroom} · {row.subject}</p>
                  </div>
                  <TypeChip type={row.type} afterClosure={row.after_closure} />
                </div>
                <Change row={row} />
                <p className="text-xs text-base-content/60">{periodOf(row)}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/60">
                  <span>{formatDate(row.created_at)}</span>
                  <Author row={row} />
                </div>
                <Offline row={row} />
              </li>
            ))}
          </ul>

          {/* Ordinateur : tableau */}
          <div className="hidden overflow-x-auto rounded-md bg-base-200 md:block">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-base-content/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Élève</th>
                  <th className="px-4 py-3 font-medium">Classe et matière</th>
                  <th className="px-4 py-3 font-medium">Période</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                  <th className="px-4 py-3 font-medium">Auteur</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id} className={index % 2 ? "bg-zebra" : ""}>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-base-content/70">
                      {formatDate(row.created_at)}
                      <Offline row={row} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="block font-medium text-base-content">{row.student?.name}</span>
                      <span className="font-mono text-xs text-base-content/50">{row.student?.matricule}</span>
                    </td>
                    <td className="px-4 py-3 align-top text-base-content/70">
                      <span className="block">{row.classroom}</span>
                      <span className="text-xs text-base-content/50">{row.subject}</span>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-base-content/70">{periodOf(row)}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col items-start gap-1">
                        <TypeChip type={row.type} afterClosure={row.after_closure} />
                        <Change row={row} />
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top"><Author row={row} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between gap-3">
              <button type="button" disabled={meta.current_page <= 1} onClick={() => setPage((p) => p - 1)}
                className="ui-btn ui-btn-soft ui-btn-sm">
                <ChevronLeft size={14} /> Précédent
              </button>
              <span className="text-xs text-base-content/60">Page {meta.current_page} sur {meta.last_page}</span>
              <button type="button" disabled={meta.current_page >= meta.last_page} onClick={() => setPage((p) => p + 1)}
                className="ui-btn ui-btn-soft ui-btn-sm">
                Suivant <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-base-content/60">{label}</span>
      <select value={value} onChange={onChange} className="ui-field w-full">
        {children}
      </select>
    </label>
  );
}

function TypeChip({ type, afterClosure = false }) {
  const chip = TYPE_CHIPS[type];
  return (
    <span className="inline-flex shrink-0 flex-wrap gap-1">
      <span className={`ui-chip ${chip.className}`}>{chip.label}</span>
      {/* Changement fait alors que la saisie de la séquence était clôturée */}
      {afterClosure && <span className="ui-chip bg-accent/10 text-accent">Après clôture</span>}
    </span>
  );
}

function Change({ row }) {
  if (row.type === "created") return <span className="font-semibold text-base-content">{formatMark(row.new_mark)}</span>;
  if (row.type === "deleted") {
    return (
      <span className="text-sm">
        <span className="text-base-content/50 line-through">{formatMark(row.old_mark)}</span>
        <span className="ml-1.5 text-xs text-error">effacée</span>
      </span>
    );
  }
  return (
    <span className="text-sm">
      <span className="text-base-content/50 line-through">{formatMark(row.old_mark)}</span>
      <span className="mx-1.5 text-base-content/40">→</span>
      <span className="font-semibold text-base-content">{formatMark(row.new_mark)}</span>
    </span>
  );
}

function Author({ row }) {
  const chip = ROLE_CHIPS[row.author_role] ?? ROLE_CHIPS.teacher;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className="text-sm text-base-content">{row.author}</span>
      <span className={`ui-chip text-[10px] ${chip.className}`}>{chip.label}</span>
    </span>
  );
}

function Offline({ row }) {
  if (!row.offline_saved_at) return null;
  return (
    <span className="mt-1 flex items-center gap-1 text-[11px] text-base-content/50" title="Heure de l'appareil au moment de la saisie ; la date principale est celle de la synchronisation.">
      <WifiOff size={11} /> Saisie hors ligne le {formatDate(row.offline_saved_at)}
    </span>
  );
}

function Empty({ text }) {
  return (
    <div className="surface flex flex-col items-center gap-3 p-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/15"><History size={18} /></div>
      <p className="text-sm text-base-content/60">{text}</p>
    </div>
  );
}
