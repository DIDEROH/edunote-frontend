import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, CalendarDays, CalendarPlus, CheckCircle2, GraduationCap, LockKeyhole, MessageCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { formatSchoolDate, formatSchoolDateTime, toSchoolDateInput, todaySchoolDateInput } from "../../utils/schoolTime";
import { api } from "../../utils/AxiosClient";
import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../providers/ConfirmProvider";
import useNavbarRefresh from "../../hooks/useNavbarRefresh";
import PageHeader from "../../components/elements/PageHeader";
import LoadingSkeleton from "../../components/LoadingSkeletoon";
import Modal from "../../components/ui/Modal";

/**
 * Calendrier de l'établissement : années scolaires (une seule en cours),
 * trimestres et séquences. Chaque école gère le sien.
 */
export default function Calendar() {
  const { refreshUser, isSchoolDirector } = useAuth();
  const confirm = useConfirm();
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [newYearOpen, setNewYearOpen] = useState(false);
  const [rename, setRename] = useState(null); // { type: 'term' | 'sequence', item }
  const [closing, setClosing] = useState(null); // séquence dont on règle la clôture
  const [requests, setRequests] = useState(null); // demandes de correction des enseignants

  const load = useCallback(() => Promise.all([
    api.get("/academic-years").then(({ data }) => setData(data)),
    api.get("/mark-unlocks").then(({ data }) => setRequests(data)),
  ]), []);

  useEffect(() => {
    let ignore = false;
    api.get("/academic-years")
      .then(({ data }) => { if (!ignore) setData(data); })
      .catch((error) => toast.error(error.message));
    api.get("/mark-unlocks")
      .then(({ data }) => { if (!ignore) setRequests(data); })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useNavbarRefresh(load);

  const run = async (request) => {
    try {
      const { data: response } = await request();
      if (response?.message) toast.success(response.message);
      await load();
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  if (!data) return <LoadingSkeleton />;

  const years = data.data || [];
  const selected = years.find((y) => y.id === selectedId) || data.active_year || years[0];

  const activate = async (year) => {
    if (!(await confirm(`Les inscriptions, notes et bulletins porteront désormais sur ${year.name}.`, { title: "Changer d'année en cours" }))) return;
    if (await run(() => api.patch(`/academic-years/${year.id}/activate`))) refreshUser().catch(() => {});
  };

  const removeYear = async (year) => {
    if (!(await confirm(`L'année ${year.name}, ses trimestres et ses séquences seront supprimés.`, { title: "Supprimer l'année" }))) return;
    if (await run(() => api.delete(`/academic-years/${year.id}`))) setSelectedId(null);
  };

  const addSequence = (term) => run(() => api.post("/sequences", { term_id: term.id, name: `Séquence ${term.sequences.length + 1}` }));

  // Année sans trimestres, ou trimestre sans séquence : calendrier par défaut à compléter
  const terms = selected?.terms || [];
  const incomplete = Boolean(selected) && (terms.length < 3 || terms.some((term) => term.sequences.length === 0));
  const completeCalendar = () => run(() => api.post(`/academic-years/${selected.id}/complete`));

  const removeSequence = async (sequence) => {
    if (!(await confirm(`« ${sequence.name} » sera supprimée (impossible si des notes y sont déjà saisies).`, { title: "Supprimer la séquence" }))) return;
    run(() => api.delete(`/sequences/${sequence.id}`));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Calendrier" subtitle="Années scolaires, trimestres et séquences de votre établissement." />

      {/* Fin d'année : réinscription des élèves dans l'année suivante (chef d'établissement) */}
      {isSchoolDirector && (
        <Link to="/year-transition"
          className="flex flex-col gap-3 rounded-md bg-base-200 p-4 transition-colors duration-150 hover:bg-base-300 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/15"><GraduationCap size={18} /></span>
            <span>
              <span className="block text-sm font-semibold text-base-content">Fin d'année scolaire</span>
              <span className="block text-xs text-base-content/60">Faites passer vos élèves dans l'année suivante : admis, redoublants et départs.</span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">Passage à l'année suivante <ArrowRight size={13} /></span>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="surface space-y-3 p-6 lg:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-base-content">Années scolaires</h2>
            <button type="button" onClick={() => setNewYearOpen(true)}
              className="ui-btn ui-btn-primary ui-btn-sm">
              <CalendarPlus size={14} /> Nouvelle année
            </button>
          </div>

          {years.map((year) => (
            <div key={year.id}
              className={`flex items-center justify-between gap-2 rounded-xl p-3 ring-1 transition-colors duration-150 ${selected?.id === year.id ? "bg-primary/8 ring-primary/30" : "bg-base-100 ring-base-300/60 hover:bg-base-300"}`}>
              <button type="button" onClick={() => setSelectedId(year.id)} className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-medium text-base-content">{year.name}</span>
                <span className="block text-xs text-base-content/50">{year.enrollments_count} élève(s) inscrit(s)</span>
              </button>
              {year.is_active ? (
                <span className="ui-chip bg-success/10 text-success">
                  <CheckCircle2 size={12} /> En cours
                </span>
              ) : (
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => activate(year)}
                    className="ui-btn ui-btn-soft ui-btn-sm">
                    Activer
                  </button>
                  {year.enrollments_count === 0 && (
                    <button type="button" onClick={() => removeYear(year)} title="Supprimer"
                      className="ui-icon-btn ui-icon-btn-sm hover:text-error">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="surface space-y-4 p-6 lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-primary/8 p-1.5 text-primary ring-1 ring-primary/15"><CalendarDays size={16} /></div>
            <div>
              <h2 className="text-sm font-semibold text-base-content">Trimestres et séquences — {selected?.name}</h2>
              <p className="text-xs text-base-content/50">Les noms apparaissent sur les bulletins et dans la saisie des notes.</p>
            </div>
          </div>

          {incomplete && (
            <div className="flex flex-col gap-3 rounded-md bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-base-content/80">
                {terms.length === 0
                  ? "Cette année n'a encore ni trimestres ni séquences : les enseignants ne peuvent pas saisir de notes."
                  : "Certains trimestres n'ont pas encore de séquences."}
              </p>
              <button type="button" onClick={completeCalendar}
                className="ui-btn ui-btn-primary ui-btn-sm shrink-0">
                <Plus size={14} /> {terms.length === 0 ? "Créer les trimestres et séquences" : "Créer les séquences manquantes"}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {terms.map((term) => (
              <div key={term.id} className="space-y-2 rounded-xl bg-base-100 p-4 ring-1 ring-base-300/60">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-base-content">{term.name}</span>
                  <button type="button" onClick={() => setRename({ type: "term", item: term })} title="Renommer"
                    className="ui-icon-btn ui-icon-btn-sm hover:text-primary">
                    <Pencil size={13} />
                  </button>
                </div>
                {term.sequences.map((sequence) => (
                  <div key={sequence.id} className="rounded-xl bg-base-200 px-3 py-2 text-sm text-base-content/80 ring-1 ring-base-300/60">
                    <div className="flex items-center justify-between gap-1">
                      <span className="min-w-0 font-medium break-words text-base-content">{sequence.name}</span>
                      <span className="-mr-1.5 flex shrink-0">
                        <button type="button" onClick={() => setClosing(sequence)} title="Clôture de la saisie"
                          className="ui-icon-btn size-7 hover:text-primary"><LockKeyhole size={12} /></button>
                        <button type="button" onClick={() => setRename({ type: "sequence", item: sequence })} title="Renommer"
                          className="ui-icon-btn size-7 hover:text-primary"><Pencil size={12} /></button>
                        <button type="button" onClick={() => removeSequence(sequence)} title="Supprimer"
                          className="ui-icon-btn size-7 hover:text-error"><Trash2 size={12} /></button>
                      </span>
                    </div>
                    <ClosureStatus sequence={sequence} />
                  </div>
                ))}
                <button type="button" onClick={() => addSequence(term)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  <Plus size={12} /> Ajouter une séquence
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <UnlockRequests requests={requests} onDecided={load} />

      {closing && (
        <ClosureModal
          sequence={closing}
          onClose={() => setClosing(null)}
          onSave={async (payload) => {
            if (await run(() => api.put(`/sequences/${closing.id}/closure`, payload))) setClosing(null);
          }}
        />
      )}

      <NewYearModal open={newYearOpen} suggested={data.suggested_name} onClose={() => setNewYearOpen(false)}
        onCreate={async (payload) => {
          if (await run(() => api.post("/academic-years", payload))) {
            setNewYearOpen(false);
            refreshUser().catch(() => {});
          }
        }} />

      {rename && (
        <RenameModal
          title={rename.type === "term" ? "Renommer le trimestre" : "Renommer la séquence"}
          value={rename.item.name}
          onClose={() => setRename(null)}
          onSave={async (name) => {
            const url = rename.type === "term" ? `/terms/${rename.item.id}` : `/sequences/${rename.item.id}`;
            if (await run(() => api.put(url, { name }))) setRename(null);
          }}
        />
      )}
    </div>
  );
}

function NewYearModal({ open, suggested, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [activate, setActivate] = useState(false);
  const value = name || suggested || "";

  return (
    <Modal open={open} onClose={onClose} icon={CalendarPlus} title="Nouvelle année scolaire"
      subtitle="Créée avec 3 trimestres et 6 séquences, modifiables ensuite"
      footer={
        <>
          <button type="button" onClick={onClose} className="ui-btn ui-btn-soft">Annuler</button>
          <button type="button" onClick={() => onCreate({ name: value, activate })}
            className="ui-btn ui-btn-primary">Créer</button>
        </>
      }>
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-base-content/60">Année (ex : 2026-2027)</span>
          <input value={value} onChange={(e) => setName(e.target.value)} className="ui-field w-full" />
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-base-content">
          <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={activate} onChange={(e) => setActivate(e.target.checked)} />
          En faire l'année en cours
        </label>
      </div>
    </Modal>
  );
}

/** État de la saisie d'une séquence */
function ClosureStatus({ sequence }) {
  if (sequence.is_closed) return <span className="block text-[11px] font-medium text-error">Saisie clôturée</span>;
  if (sequence.entry_deadline) {
    return <span className="block text-[11px] font-medium text-warning">Saisie jusqu'au {formatSchoolDate(sequence.entry_deadline)}</span>;
  }
  return <span className="block text-[11px] text-base-content/40">Saisie ouverte</span>;
}

/** Date limite, clôture immédiate ou réouverture de la saisie d'une séquence */
function ClosureModal({ sequence, onClose, onSave }) {
  const [date, setDate] = useState(toSchoolDateInput(sequence.entry_deadline));
  const today = todaySchoolDateInput();
  const futureDate = date && date >= today ? date : null;

  const status = sequence.is_closed
    ? sequence.closed_at
      ? `Saisie clôturée le ${formatSchoolDateTime(sequence.closed_at)}.`
      : `Saisie clôturée depuis la date limite du ${formatSchoolDate(sequence.entry_deadline)}.`
    : sequence.entry_deadline
      ? `Saisie ouverte jusqu'au ${formatSchoolDate(sequence.entry_deadline)} inclus.`
      : "Saisie ouverte, sans date limite.";

  return (
    <Modal open onClose={onClose} icon={LockKeyhole} title={`Clôture de la saisie — ${sequence.name}`} subtitle={status}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="ui-btn ui-btn-soft">Annuler</button>
          {sequence.is_closed ? (
            <button type="button" onClick={() => onSave({ entry_deadline: futureDate, closed: false })}
              className="ui-btn ui-btn-primary">
              {futureDate ? `Rouvrir jusqu'au ${formatSchoolDate(`${futureDate}T12:00:00Z`)}` : "Rouvrir la saisie"}
            </button>
          ) : (
            <>
              <button type="button" onClick={() => onSave({ entry_deadline: toSchoolDateInput(sequence.entry_deadline) || null, closed: true })}
                className="ui-btn ui-btn-danger">
                Clôturer maintenant
              </button>
              <button type="button" onClick={() => onSave({ entry_deadline: date || null, closed: false })}
                className="ui-btn ui-btn-primary">
                Enregistrer la date
              </button>
            </>
          )}
        </div>
      }>
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-base-content/60">Date limite de saisie</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="ui-field w-full" />
        </label>
        {date && (
          <button type="button" onClick={() => setDate("")} className="text-xs font-medium text-primary">Retirer la date limite</button>
        )}
        <p className="text-xs leading-relaxed text-base-content/60">
          Les enseignants saisissent et corrigent leurs notes jusqu'à la fin de cette journée (heure du Cameroun). Ensuite, chaque correction
          demande l'accord de la direction : les bulletins restent stables. Le chef d'établissement peut toujours corriger lui-même ; chaque
          changement reste dans l'historique des notes.
        </p>
      </div>
    </Modal>
  );
}

/** Demandes de correction des enseignants après la clôture : autoriser pour une durée, ou refuser */
function UnlockRequests({ requests, onDecided }) {
  const [hours, setHours] = useState({});
  const [refusing, setRefusing] = useState(null);
  const [response, setResponse] = useState("");
  const [notice, setNotice] = useState(null); // dernière décision : lien WhatsApp vers l'enseignant
  const sectionRef = useRef(null);

  // Arrivée depuis le tableau de bord (#corrections)
  useEffect(() => {
    if (requests && window.location.hash === "#corrections") sectionRef.current?.scrollIntoView({ block: "start" });
  }, [requests]);

  if (!requests || (requests.pending.length === 0 && requests.recent.length === 0)) return null;

  const decide = async (request, action, body) => {
    try {
      const { data } = await api.post(`/mark-unlocks/${request.id}/${action}`, body);
      toast.success(data.message);
      setNotice({ teacher: request.teacher, message: data.message, whatsappUrl: data.whatsapp_url });
      setRefusing(null);
      setResponse("");
      await onDecided();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section ref={sectionRef} id="corrections" className="surface space-y-4 p-6">
      <div className="flex items-center gap-2.5">
        <div className="rounded-xl bg-primary/8 p-1.5 text-primary ring-1 ring-primary/15"><LockKeyhole size={16} /></div>
        <div>
          <h2 className="text-sm font-semibold text-base-content">Demandes de correction de notes</h2>
          <p className="text-xs text-base-content/50">Après la clôture d'une séquence, les enseignants vous demandent l'autorisation de corriger leurs notes.</p>
        </div>
      </div>

      {notice && (
        <div className="flex flex-col gap-3 rounded-md bg-success/10 p-4 text-sm text-base-content/80 sm:flex-row sm:items-center sm:justify-between">
          <span>{notice.message}</span>
          {notice.whatsappUrl && (
            <a href={notice.whatsappUrl} target="_blank" rel="noreferrer"
              className="ui-btn ui-btn-success ui-btn-sm shrink-0">
              <MessageCircle size={14} /> Prévenir {notice.teacher} par WhatsApp
            </a>
          )}
        </div>
      )}

      {requests.pending.length === 0 ? (
        <p className="text-sm text-base-content/60">Aucune demande en attente.</p>
      ) : (
        <ul className="space-y-2">
          {requests.pending.map((request) => (
            <li key={request.id} className="space-y-3 rounded-xl bg-base-100 p-4 ring-1 ring-base-300/60">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-base-content">{request.teacher}</p>
                  <p className="text-xs text-base-content/60">{request.classroom} — {request.subject} · {request.sequence}{request.term ? ` (${request.term})` : ""}</p>
                </div>
                <span className="text-xs text-base-content/50">{formatSchoolDateTime(request.requested_at)}</span>
              </div>
              <p className="rounded-md bg-base-200 px-3 py-2 text-sm italic text-base-content/80">« {request.reason} »</p>

              {refusing === request.id ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input value={response} onChange={(e) => setResponse(e.target.value)} maxLength={255} autoFocus
                    placeholder="Motif du refus (facultatif)" className="ui-field w-full" />
                  <button type="button" onClick={() => decide(request, "refuse", { response: response.trim() || null })}
                    className="ui-btn ui-btn-danger-solid ui-btn-sm shrink-0">Confirmer le refus</button>
                  <button type="button" onClick={() => setRefusing(null)}
                    className="ui-btn ui-btn-soft ui-btn-sm shrink-0">Annuler</button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <select value={hours[request.id] ?? 24} onChange={(e) => setHours((h) => ({ ...h, [request.id]: Number(e.target.value) }))}
                    aria-label="Durée de l'autorisation" className="ui-field text-xs">
                    <option value={24}>Pendant 24 heures</option>
                    <option value={72}>Pendant 3 jours</option>
                    <option value={168}>Pendant 7 jours</option>
                  </select>
                  <button type="button" onClick={() => decide(request, "approve", { hours: hours[request.id] ?? 24 })}
                    className="ui-btn ui-btn-primary ui-btn-sm">Autoriser</button>
                  <button type="button" onClick={() => { setRefusing(request.id); setResponse(""); }}
                    className="ui-btn ui-btn-danger ui-btn-sm">Refuser</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {requests.recent.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-base-content/60">Dernières décisions</p>
          <ul className="space-y-1">
            {requests.recent.map((request) => (
              <li key={request.id} className="flex flex-col gap-1 rounded-xl bg-base-100 px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between ring-1 ring-base-300/60">
                <span className="text-base-content/70">
                  <span className="font-medium text-base-content">{request.teacher}</span> · {request.classroom} — {request.subject} · {request.sequence}
                </span>
                <span className={request.status === "approved" ? "text-success" : "text-error"}>
                  {request.status === "approved"
                    ? `${request.active ? "Autorisée jusqu'au" : "Autorisation terminée le"} ${formatSchoolDateTime(request.expires_at)}`
                    : `Refusée le ${formatSchoolDateTime(request.decided_at)}`}
                  {request.decided_by ? ` par ${request.decided_by}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function RenameModal({ title, value, onClose, onSave }) {
  const [name, setName] = useState(value);

  return (
    <Modal open onClose={onClose} icon={Pencil} title={title}
      footer={
        <>
          <button type="button" onClick={onClose} className="ui-btn ui-btn-soft">Annuler</button>
          <button type="button" onClick={() => onSave(name)} disabled={!name.trim()}
            className="ui-btn ui-btn-primary">Enregistrer</button>
        </>
      }>
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className="ui-field w-full" />
    </Modal>
  );
}
