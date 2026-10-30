import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, CalendarPlus, CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
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
  const { refreshUser } = useAuth();
  const confirm = useConfirm();
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [newYearOpen, setNewYearOpen] = useState(false);
  const [rename, setRename] = useState(null); // { type: 'term' | 'sequence', item }

  const load = useCallback(() => api.get("/academic-years").then(({ data }) => setData(data)), []);

  useEffect(() => {
    let ignore = false;
    api.get("/academic-years")
      .then(({ data }) => { if (!ignore) setData(data); })
      .catch((error) => toast.error(error.message));
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

  const removeSequence = async (sequence) => {
    if (!(await confirm(`« ${sequence.name} » sera supprimée (impossible si des notes y sont déjà saisies).`, { title: "Supprimer la séquence" }))) return;
    run(() => api.delete(`/sequences/${sequence.id}`));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Calendrier" subtitle="Années scolaires, trimestres et séquences de votre établissement." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-3 rounded-md bg-base-200 p-6 lg:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-base-content">Années scolaires</h2>
            <button type="button" onClick={() => setNewYearOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-content transition-colors duration-150 hover:brightness-95">
              <CalendarPlus size={14} /> Nouvelle année
            </button>
          </div>

          {years.map((year) => (
            <div key={year.id}
              className={`flex items-center justify-between gap-2 rounded-md p-3 transition-colors duration-150 ${selected?.id === year.id ? "bg-primary/10" : "bg-base-100 hover:bg-base-300"}`}>
              <button type="button" onClick={() => setSelectedId(year.id)} className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-medium text-base-content">{year.name}</span>
                <span className="block text-xs text-base-content/50">{year.enrollments_count} élève(s) inscrit(s)</span>
              </button>
              {year.is_active ? (
                <span className="inline-flex items-center gap-1 rounded-sm bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                  <CheckCircle2 size={12} /> En cours
                </span>
              ) : (
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => activate(year)}
                    className="rounded-sm bg-base-300 px-2 py-1 text-xs font-medium text-base-content/70 transition-colors duration-150 hover:text-primary">
                    Activer
                  </button>
                  {year.enrollments_count === 0 && (
                    <button type="button" onClick={() => removeYear(year)} title="Supprimer"
                      className="rounded-md p-1.5 text-base-content/40 transition-colors duration-150 hover:bg-error/10 hover:text-error">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="space-y-4 rounded-md bg-base-200 p-6 lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="rounded-md bg-primary/10 p-1.5 text-primary"><CalendarDays size={16} /></div>
            <div>
              <h2 className="text-sm font-semibold text-base-content">Trimestres et séquences — {selected?.name}</h2>
              <p className="text-xs text-base-content/50">Les noms apparaissent sur les bulletins et dans la saisie des notes.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {(selected?.terms || []).map((term) => (
              <div key={term.id} className="space-y-2 rounded-md bg-base-100 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-base-content">{term.name}</span>
                  <button type="button" onClick={() => setRename({ type: "term", item: term })} title="Renommer"
                    className="rounded-md p-1.5 text-base-content/40 transition-colors duration-150 hover:bg-base-300 hover:text-primary">
                    <Pencil size={13} />
                  </button>
                </div>
                {term.sequences.map((sequence) => (
                  <div key={sequence.id} className="flex items-center justify-between gap-2 rounded-sm bg-base-200 px-3 py-2 text-sm text-base-content/80">
                    <span className="truncate">{sequence.name}</span>
                    <span className="flex shrink-0 gap-0.5">
                      <button type="button" onClick={() => setRename({ type: "sequence", item: sequence })} title="Renommer"
                        className="rounded-md p-1 text-base-content/40 transition-colors duration-150 hover:text-primary"><Pencil size={12} /></button>
                      <button type="button" onClick={() => removeSequence(sequence)} title="Supprimer"
                        className="rounded-md p-1 text-base-content/40 transition-colors duration-150 hover:text-error"><Trash2 size={12} /></button>
                    </span>
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
          <button type="button" onClick={onClose} className="rounded-md bg-base-100 px-5 py-2.5 text-sm font-medium text-base-content hover:bg-base-300">Annuler</button>
          <button type="button" onClick={() => onCreate({ name: value, activate })}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-content hover:brightness-95">Créer</button>
        </>
      }>
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-base-content/60">Année (ex : 2026-2027)</span>
          <input value={value} onChange={(e) => setName(e.target.value)} className="w-full rounded-md bg-base-100 px-4 py-3 text-sm outline-none" />
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-base-content">
          <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={activate} onChange={(e) => setActivate(e.target.checked)} />
          En faire l'année en cours
        </label>
      </div>
    </Modal>
  );
}

function RenameModal({ title, value, onClose, onSave }) {
  const [name, setName] = useState(value);

  return (
    <Modal open onClose={onClose} icon={Pencil} title={title}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-md bg-base-100 px-5 py-2.5 text-sm font-medium text-base-content hover:bg-base-300">Annuler</button>
          <button type="button" onClick={() => onSave(name)} disabled={!name.trim()}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-content hover:brightness-95 disabled:opacity-50">Enregistrer</button>
        </>
      }>
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md bg-base-100 px-4 py-3 text-sm outline-none" />
    </Modal>
  );
}
