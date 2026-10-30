import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Ban, Building2, CheckCircle2, Crown, Eye, Mail, MessageCircle, Phone, RotateCcw, Trash2, XCircle } from "lucide-react";
import { api } from "../../utils/AxiosClient";
import { useConfirm } from "../../providers/ConfirmProvider";
import useNavbarRefresh from "../../hooks/useNavbarRefresh";
import PageHeader from "../../components/elements/PageHeader";
import LoadingSkeleton from "../../components/LoadingSkeletoon";
import { Card5 } from "../../components/ui/CardsComponents";
import Modal from "../../components/ui/Modal";

const TABS = [
  { status: "pending", label: "Inscriptions à valider" },
  { status: "active", label: "Actives" },
  { status: "suspended", label: "Suspendues" },
  { status: "rejected", label: "Refusées" },
];

const STATUS_CHIP = {
  pending: "bg-warning/10 text-warning",
  active: "bg-success/10 text-success",
  suspended: "bg-error/10 text-error",
  rejected: "bg-base-300 text-base-content/60",
};

/**
 * Espace EduNote : validation des nouveaux établissements, suspension,
 * changement de directeur. Chaque école se gère ensuite elle-même.
 */
export default function Schools() {
  const confirm = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "pending";
  const [schools, setSchools] = useState(null);
  const [search, setSearch] = useState("");
  const [notify, setNotify] = useState(null); // message WhatsApp à envoyer au directeur
  const [reasonFor, setReasonFor] = useState(null); // { school, action: 'reject' | 'suspend' }
  const [directorFor, setDirectorFor] = useState(null);

  const load = useCallback(() => api.get("/schools").then(({ data }) => setSchools(data)), []);

  useEffect(() => {
    let ignore = false;
    api.get("/schools")
      .then(({ data }) => { if (!ignore) setSchools(data); })
      .catch((error) => toast.error(error.message));
    return () => { ignore = true; };
  }, []);

  useNavbarRefresh(load);

  const act = async (request) => {
    try {
      const { data } = await request();
      toast.success(data.message);
      if (data.notify) setNotify(data.notify);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const approve = async (school) => {
    if (!(await confirm(`« ${school.name} » pourra être gérée par ${school.director?.first_name ?? "son directeur"} : classes, personnel, élèves, bulletins.`, { title: "Valider l'établissement" }))) return;
    act(() => api.post(`/admin/schools/${school.id}/approve`));
  };

  const reactivate = async (school) => {
    if (!(await confirm(`Le personnel de « ${school.name} » retrouvera l'accès à l'établissement.`, { title: "Réactiver" }))) return;
    act(() => api.post(`/admin/schools/${school.id}/reactivate`));
  };

  const remove = async (school) => {
    if (!(await confirm(`« ${school.name} » et toutes ses données seront définitivement supprimées.`, { title: "Supprimer l'établissement" }))) return;
    act(() => api.delete(`/schools/${school.id}`));
  };

  if (!schools) return <LoadingSkeleton />;

  const counts = Object.fromEntries(TABS.map(({ status: s }) => [s, schools.filter((school) => school.status === s).length]));
  const term = search.trim().toLowerCase();
  const visible = schools.filter((school) => school.status === status
    && (!term || [school.name, school.code, school.city, school.director?.last_name, school.director?.first_name].some((v) => v?.toLowerCase().includes(term))));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Établissements"
        subtitle="Validez les nouvelles inscriptions ; chaque école gère ensuite elle-même ses classes, son personnel et ses bulletins."
        onSearch={setSearch}
        searchPlaceholder="Rechercher une école, un directeur..."
      />

      <div className="flex gap-1 overflow-x-auto bg-base-200 p-1 rounded-full ring-1 ring-base-300/70">
        {TABS.map((tab) => (
          <button key={tab.status} type="button" onClick={() => setSearchParams({ status: tab.status })}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${status === tab.status ? "bg-white text-night shadow-sm" : "text-base-content/60 hover:text-base-content"}`}>
            {tab.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${tab.status === "pending" && counts.pending ? "bg-warning text-white" : "bg-base-300 text-base-content/60"}`}>
              {counts[tab.status]}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card5 icon={Building2}>{status === "pending" ? "Aucune inscription en attente." : "Aucun établissement."}</Card5>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((school) => (
            <article key={school.id} className="surface flex flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-base-100">
                  {school.logo ? <img src={school.logo} alt="" className="h-full w-full object-cover" /> : <Building2 size={22} className="text-base-content/30" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-base-content">{school.name}</h3>
                  <p className="text-xs text-base-content/50">{school.code} · {school.city || "Ville non renseignée"}</p>
                  <span className={`ui-chip mt-1.5 ${STATUS_CHIP[school.status]}`}>{school.status_label}</span>
                </div>
              </div>

              <div className="space-y-1 rounded-xl bg-base-100 p-3 text-xs text-base-content/70 ring-1 ring-base-300/60">
                <p className="font-medium text-base-content">
                  <Crown size={12} className="mr-1 inline text-secondary" />
                  {school.director ? `${school.director.last_name} ${school.director.first_name}` : "Aucun directeur"}
                </p>
                {school.director?.phone && <p className="flex items-center gap-1.5"><Phone size={11} />{school.director.phone}</p>}
                {school.director?.email && <p className="flex items-center gap-1.5 truncate"><Mail size={11} />{school.director.email}</p>}
                <p className="pt-1 text-base-content/50">
                  Inscrite le {new Date(school.created_at).toLocaleDateString("fr-FR")}
                  {school.status === "active" && ` · ${school.students_count} élève(s) · ${school.teachers_count} enseignant(s)`}
                </p>
              </div>

              {school.rejection_reason && school.status !== "active" && (
                <p className="text-xs text-base-content/60"><span className="font-medium">Motif : </span>{school.rejection_reason}</p>
              )}

              <div className="mt-auto flex flex-wrap gap-2">
                {(school.status === "pending" || school.status === "rejected") && (
                  <ActionButton icon={CheckCircle2} tone="primary" onClick={() => approve(school)}>Valider</ActionButton>
                )}
                {school.status === "pending" && (
                  <ActionButton icon={XCircle} onClick={() => setReasonFor({ school, action: "reject" })}>Refuser</ActionButton>
                )}
                {school.status === "active" && (
                  <>
                    <Link to={`/schools/${school.id}`} className="ui-btn ui-btn-soft ui-btn-sm">
                      <Eye size={14} /> Détails
                    </Link>
                    <ActionButton icon={Ban} onClick={() => setReasonFor({ school, action: "suspend" })}>Suspendre</ActionButton>
                  </>
                )}
                {school.status === "suspended" && (
                  <ActionButton icon={RotateCcw} tone="primary" onClick={() => reactivate(school)}>Réactiver</ActionButton>
                )}
                {(school.status === "active" || school.status === "suspended") && (
                  <ActionButton icon={Crown} onClick={() => setDirectorFor(school)}>Changer de directeur</ActionButton>
                )}
                {school.status === "rejected" && (
                  <ActionButton icon={Trash2} tone="error" onClick={() => remove(school)}>Supprimer</ActionButton>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {reasonFor && (
        <ReasonModal
          action={reasonFor.action}
          school={reasonFor.school}
          onClose={() => setReasonFor(null)}
          onConfirm={async (reason) => {
            setReasonFor(null);
            await act(() => api.post(`/admin/schools/${reasonFor.school.id}/${reasonFor.action}`, { reason }));
          }}
        />
      )}

      {directorFor && <DirectorModal school={directorFor} onClose={() => setDirectorFor(null)} onChanged={load} />}

      <Modal open={Boolean(notify)} onClose={() => setNotify(null)} icon={MessageCircle} title="Prévenir le directeur"
        subtitle={notify?.phone ? `Par WhatsApp au ${notify.phone}` : "Par WhatsApp"}>
        <p className="whitespace-pre-wrap rounded-xl bg-base-100 p-4 text-xs leading-relaxed text-base-content/70 ring-1 ring-base-300/60">{notify?.message}</p>
        <a href={notify?.whatsapp_url} target="_blank" rel="noreferrer" onClick={() => setNotify(null)}
          className="ui-btn ui-btn-success mt-4">
          <MessageCircle size={16} /> Envoyer sur WhatsApp
        </a>
      </Modal>
    </div>
  );
}

function ActionButton({ icon: Icon, tone, onClick, children }) {
  const tones = {
    primary: "bg-primary text-primary-content hover:brightness-95",
    error: "bg-error/10 text-error hover:bg-error/15",
  };

  return (
    <button type="button" onClick={onClick}
      className={`ui-btn ui-btn-sm ${tones[tone] ?? "ui-btn-soft"}`}>
      <Icon size={14} /> {children}
    </button>
  );
}

function ReasonModal({ action, school, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const reject = action === "reject";

  return (
    <Modal open onClose={onClose} icon={reject ? XCircle : Ban} title={reject ? "Refuser l'inscription" : "Suspendre l'établissement"} subtitle={school.name}
      footer={
        <>
          <button type="button" onClick={onClose} className="ui-btn ui-btn-soft">Annuler</button>
          <button type="button" disabled={reject && !reason.trim()} onClick={() => onConfirm(reason.trim() || null)}
            className="ui-btn ui-btn-danger-solid">
            {reject ? "Refuser" : "Suspendre"}
          </button>
        </>
      }>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-base-content/60">Motif {reject ? "(communiqué au directeur)" : "(facultatif)"}</span>
        <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)}
          className="ui-field w-full" placeholder={reject ? "ex : informations incomplètes, établissement introuvable..." : ""} />
      </label>
      {!reject && <p className="mt-3 text-xs text-base-content/50">Le personnel n'aura plus accès à l'établissement jusqu'à sa réactivation. Ses données sont conservées.</p>}
    </Modal>
  );
}

function DirectorModal({ school, onClose, onChanged }) {
  const [members, setMembers] = useState(null);
  const [mode, setMode] = useState("member");
  const [userId, setUserId] = useState("");
  const [outsider, setOutsider] = useState({ name: "", phone: "" });
  const [result, setResult] = useState(null);

  useEffect(() => {
    let ignore = false;
    api.get(`/admin/schools/${school.id}/members`)
      .then(({ data }) => { if (!ignore) setMembers(data.filter((m) => !m.roles.includes("director"))); })
      .catch((error) => toast.error(error.message));
    return () => { ignore = true; };
  }, [school.id]);

  const submit = async () => {
    try {
      const payload = mode === "member" ? { user_id: Number(userId) } : { name: outsider.name || null, phone: outsider.phone || null };
      const { data } = await api.post(`/admin/schools/${school.id}/director`, payload);
      toast.success(data.message);
      onChanged();
      if (data.whatsapp_url) setResult(data);
      else onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Modal open onClose={onClose} icon={Crown} title="Changer de directeur" subtitle={school.name}
      footer={!result && (
        <>
          <button type="button" onClick={onClose} className="ui-btn ui-btn-soft">Annuler</button>
          <button type="button" onClick={submit} disabled={mode === "member" && !userId}
            className="ui-btn ui-btn-primary">
            {mode === "member" ? "Nommer directeur" : "Créer le lien"}
          </button>
        </>
      )}>
      {result ? (
        <div className="space-y-4">
          <p className="text-sm text-base-content/70">Envoyez ce lien au nouveau chef d'établissement : il prendra la direction en l'ouvrant (valable 7 jours).</p>
          <p className="break-all rounded-xl bg-base-100 p-3 text-xs text-base-content/70 ring-1 ring-base-300/60">{result.link}</p>
          <a href={result.whatsapp_url} target="_blank" rel="noreferrer"
            className="ui-btn ui-btn-success">
            <MessageCircle size={16} /> Envoyer sur WhatsApp
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex rounded-xl bg-base-100 p-1 ring-1 ring-base-300/60">
            {[["member", "Un membre de l'école"], ["outsider", "Une autre personne"]].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setMode(value)}
                className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all duration-200 ${mode === value ? "bg-white text-primary shadow-sm ring-1 ring-base-300" : "text-base-content/50"}`}>
                {label}
              </button>
            ))}
          </div>
          {mode === "member" ? (
            members === null ? <LoadingSkeleton /> : members.length === 0 ? (
              <p className="text-sm text-base-content/60">Aucun autre membre dans cet établissement : invitez une autre personne.</p>
            ) : (
              <select value={userId} onChange={(e) => setUserId(e.target.value)} className="ui-field w-full">
                <option value="">Choisir une personne...</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>{m.user.last_name} {m.user.first_name} — {m.user.email}</option>
                ))}
              </select>
            )
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input value={outsider.name} onChange={(e) => setOutsider({ ...outsider, name: e.target.value })} placeholder="Nom (facultatif)"
                className="ui-field" />
              <input value={outsider.phone} onChange={(e) => setOutsider({ ...outsider, phone: e.target.value })} placeholder="WhatsApp (facultatif)" inputMode="tel"
                className="ui-field" />
            </div>
          )}
          <p className="text-xs text-base-content/50">L'ancien directeur reste dans l'établissement comme modérateur avec tous les droits ; le nouveau pourra les lui retirer.</p>
        </div>
      )}
    </Modal>
  );
}
