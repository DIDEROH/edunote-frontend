import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { Check, Copy, Crown, KeyRound, Link2, MessageCircle, Pencil, Phone, Mail, Trash2, UserPlus, Users, X } from "lucide-react";
import { api } from "../../utils/AxiosClient";
import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../providers/ConfirmProvider";
import useNavbarRefresh from "../../hooks/useNavbarRefresh";
import PageHeader from "../../components/elements/PageHeader";
import LoadingSkeleton from "../../components/LoadingSkeletoon";
import Modal from "../../components/ui/Modal";

const ROLE_CHIPS = {
  director: { label: "Chef d'établissement", className: "bg-secondary/10 text-secondary" },
  moderator: { label: "Modérateur", className: "bg-warning/10 text-warning" },
  teacher: { label: "Enseignant", className: "bg-info/10 text-info" },
};

const fullName = (user) => `${user?.last_name ?? ""} ${user?.first_name ?? ""}`.trim();

/**
 * Personnel de l'établissement : membres et rôles, invitations par WhatsApp,
 * droits des modérateurs (choisis par le chef d'établissement), transfert de la direction.
 */
export default function Staff() {
  const { setNavbarActions } = useOutletContext();
  const { refreshUser } = useAuth();
  const confirm = useConfirm();
  const [data, setData] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [passwordResult, setPasswordResult] = useState(null); // mot de passe provisoire à envoyer

  const load = useCallback(() => api.get("/school/members").then(({ data }) => setData(data)), []);

  useEffect(() => {
    let ignore = false;
    api.get("/school/members")
      .then(({ data }) => { if (!ignore) setData(data); })
      .catch((error) => toast.error(error.message));
    return () => { ignore = true; };
  }, []);

  useNavbarRefresh(load);

  const canStaff = Boolean(data?.can_manage_staff);
  const isDirector = Boolean(data?.is_director);

  useEffect(() => {
    setNavbarActions(canStaff ? { onAdd: () => setInviteOpen(true) } : {});
    return () => setNavbarActions({});
  }, [setNavbarActions, canStaff]);

  const run = async (request, success) => {
    try {
      const { data: response } = await request();
      toast.success(response?.message || success);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const remove = async (member) => {
    if (!(await confirm(`${fullName(member.user)} n'aura plus accès à l'établissement. Ses classes de l'année en cours lui seront retirées.`, { title: "Retirer du personnel" }))) return;
    run(() => api.delete(`/school/members/${member.user.id}`), "Personne retirée.");
  };

  const transfer = async (member) => {
    if (!(await confirm(`${fullName(member.user)} deviendra chef d'établissement. Vous resterez modérateur avec tous les droits.`, { title: "Confier la direction" }))) return;
    try {
      const { data: response } = await api.post("/school/transfer", { user_id: member.user.id });
      toast.success(response.message);
      await refreshUser();
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Compte sans e-mail : pas de code « mot de passe oublié », le directeur en crée un provisoire
  const resetPassword = async (member) => {
    if (!(await confirm(`${fullName(member.user)} recevra un mot de passe provisoire (à changer dans « Mon profil ») ; ses sessions ouvertes seront fermées.`, { title: "Nouveau mot de passe" }))) return;
    try {
      const { data: response } = await api.post(`/school/members/${member.user.id}/password`);
      setPasswordResult({ ...response, name: fullName(member.user) });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const revoke = async (invitation) => {
    if (!(await confirm("Le lien envoyé ne fonctionnera plus.", { title: "Annuler l'invitation" }))) return;
    run(() => api.delete(`/school/invitations/${invitation.id}`), "Invitation annulée.");
  };

  if (!data) return <LoadingSkeleton />;

  const labels = data.permission_labels || {};

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Personnel"
        subtitle="Invitez votre personnel par WhatsApp, choisissez leurs rôles et les droits de vos modérateurs."
      />

      <section className="surface p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-primary/8 p-1.5 text-primary ring-1 ring-primary/15"><Users size={16} /></div>
            <div>
              <h2 className="text-sm font-semibold text-base-content">Membres de l'établissement</h2>
              <p className="text-xs text-base-content/50">{data.members.length} personne(s)</p>
            </div>
          </div>
          {canStaff && (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="ui-btn ui-btn-primary ui-btn-sm"
            >
              <UserPlus size={14} /> Inviter par WhatsApp
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {data.members.map((member) => {
            const isMemberDirector = member.roles.includes("director");
            return (
              <article key={member.user.id} className="flex flex-col gap-3 rounded-xl bg-base-100 p-4 ring-1 ring-base-300/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-base-content">
                      {fullName(member.user)} {member.is_me && <span className="text-xs font-normal text-base-content/50">(vous)</span>}
                    </p>
                    <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-base-content/50">
                      {member.user.phone && <span className="inline-flex items-center gap-1"><Phone size={11} />{member.user.phone}</span>}
                      {member.user.email && <span className="inline-flex items-center gap-1 truncate"><Mail size={11} />{member.user.email}</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {(canStaff || isDirector) && !isMemberDirector && (
                      <>
                        <button type="button" title="Modifier les rôles" onClick={() => setEditing(member)}
                          className="ui-icon-btn ui-icon-btn-sm hover:text-primary">
                          <Pencil size={15} />
                        </button>
                        <button type="button" title="Retirer de l'établissement" onClick={() => remove(member)}
                          className="ui-icon-btn ui-icon-btn-sm hover:text-error">
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                    {isDirector && isMemberDirector && (
                      <button type="button" title="Être aussi enseignant" onClick={() => setEditing(member)}
                        className="ui-icon-btn ui-icon-btn-sm hover:text-primary">
                        <Pencil size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {member.roles.map((role) => (
                    <span key={role} className={`ui-chip ${ROLE_CHIPS[role]?.className ?? ""}`}>
                      {ROLE_CHIPS[role]?.label ?? role}
                    </span>
                  ))}
                </div>

                {member.roles.includes("moderator") && (
                  <p className="text-xs leading-relaxed text-base-content/60">
                    <span className="font-medium text-base-content/70">Droits : </span>
                    {member.permissions.length ? member.permissions.map((p) => labels[p] ?? p).join(" · ") : "consultation uniquement"}
                  </p>
                )}

                {isDirector && !isMemberDirector && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <button type="button" onClick={() => resetPassword(member)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-base-content/50 transition-colors duration-150 hover:text-primary">
                      <KeyRound size={13} /> Nouveau mot de passe
                    </button>
                    <button type="button" onClick={() => transfer(member)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-base-content/50 transition-colors duration-150 hover:text-secondary">
                      <Crown size={13} /> Lui confier la direction
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {canStaff && data.invitations.length > 0 && (
        <section className="surface p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="rounded-xl bg-primary/8 p-1.5 text-primary ring-1 ring-primary/15"><Link2 size={16} /></div>
            <div>
              <h2 className="text-sm font-semibold text-base-content">Invitations en attente</h2>
              <p className="text-xs text-base-content/50">Liens envoyés qui n'ont pas encore été utilisés</p>
            </div>
          </div>
          <div className="space-y-2">
            {data.invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between gap-3 rounded-xl bg-base-100 p-3 ring-1 ring-base-300/60">
                <div className="min-w-0 text-sm">
                  <span className="font-medium text-base-content">{invitation.name || "Sans nom"}</span>
                  {invitation.phone && <span className="ml-2 text-xs text-base-content/50">{invitation.phone}</span>}
                  <span className="block text-xs text-base-content/50">
                    {invitation.roles.map((r) => ROLE_CHIPS[r]?.label ?? r).join(" + ")} · expire le {new Date(invitation.expires_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <button type="button" onClick={() => revoke(invitation)} title="Annuler l'invitation"
                  className="ui-icon-btn ui-icon-btn-sm hover:text-error">
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <Modal open={Boolean(passwordResult)} onClose={() => setPasswordResult(null)} icon={KeyRound}
        title="Mot de passe provisoire" subtitle={passwordResult?.name}>
        <p className="whitespace-pre-wrap rounded-xl bg-base-100 p-4 text-xs leading-relaxed text-base-content/70 ring-1 ring-base-300/60">{passwordResult?.text}</p>
        <a href={passwordResult?.whatsapp_url} target="_blank" rel="noreferrer" onClick={() => setPasswordResult(null)}
          className="ui-btn ui-btn-success mt-4">
          <MessageCircle size={16} /> Envoyer sur WhatsApp
        </a>
        <p className="mt-3 text-xs text-base-content/50">Ce mot de passe ne sera plus affiché après fermeture de cette fenêtre.</p>
      </Modal>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} isDirector={isDirector} labels={labels} onInvited={load} />
      {editing && (
        <EditRolesModal member={editing} isDirector={isDirector} canStaff={canStaff} labels={labels}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await load(); }} />
      )}
    </div>
  );
}

/** Cases à cocher des droits d'un modérateur */
function PermissionsPicker({ labels, value, onChange }) {
  const toggle = (key) => onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);

  return (
    <div className="space-y-2">
      {Object.entries(labels).map(([key, label]) => (
        <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl bg-base-100 p-3 text-sm text-base-content transition-colors duration-150 hover:bg-base-300 ring-1 ring-base-300/60">
          <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={value.includes(key)} onChange={() => toggle(key)} />
          {label}
        </label>
      ))}
      <p className="text-xs text-base-content/50">Sans droit coché, le modérateur consulte seulement les données de l'établissement.</p>
    </div>
  );
}

function RoleToggle({ checked, onChange, label, hint, disabled }) {
  return (
    <label className={`flex items-start gap-3 rounded-xl p-3 ring-1 transition-colors duration-150 ${checked ? "bg-primary/8 ring-primary/30" : "bg-base-100 ring-base-300/60"} ${disabled ? "opacity-50" : "cursor-pointer hover:bg-base-300"}`}>
      <input type="checkbox" className="checkbox checkbox-primary checkbox-sm mt-0.5" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-sm font-medium text-base-content">{label}</span>
        <span className="block text-xs text-base-content/50">{hint}</span>
      </span>
    </label>
  );
}

function InviteModal({ open, onClose, isDirector, labels, onInvited }) {
  const [form, setForm] = useState({ name: "", phone: "", teacher: true, moderator: false, permissions: [] });
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const close = () => {
    setResult(null);
    setCopied(false);
    setForm({ name: "", phone: "", teacher: true, moderator: false, permissions: [] });
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    const roles = [form.teacher && "teacher", form.moderator && "moderator"].filter(Boolean);
    if (!roles.length) {
      toast.error("Choisissez au moins un rôle.");
      return;
    }
    setSending(true);
    try {
      const { data } = await api.post("/school/invitations", {
        roles,
        permissions: form.moderator ? form.permissions : [],
        name: form.name || null,
        phone: form.phone || null,
      });
      setResult(data);
      onInvited();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
    } catch {
      toast.error("Copie impossible : sélectionnez le lien à la main.");
    }
  };

  return (
    <Modal open={open} onClose={close} icon={UserPlus} title="Inviter un membre du personnel"
      subtitle="Un lien personnel, valable 7 jours, à envoyer par WhatsApp">
      {result ? (
        <div className="space-y-4">
          <div className="rounded-md bg-success/10 p-4 text-sm text-base-content/80">
            Invitation prête. Envoyez-la depuis votre téléphone : la personne crée son compte et rejoint directement votre établissement.
          </div>
          <p className="whitespace-pre-wrap rounded-xl bg-base-100 p-4 text-xs leading-relaxed text-base-content/70 ring-1 ring-base-300/60">{result.text}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href={result.whatsapp_url} target="_blank" rel="noreferrer"
              className="ui-btn ui-btn-success">
              <MessageCircle size={16} /> Envoyer sur WhatsApp
            </a>
            <button type="button" onClick={copy}
              className="ui-btn ui-btn-soft">
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copié" : "Copier le message"}
            </button>
          </div>
          <button type="button" onClick={() => { setResult(null); setCopied(false); }} className="text-xs font-medium text-primary">
            Inviter une autre personne
          </button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-base-content/60">Nom (facultatif)</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex : M. Ndongo"
                className="ui-field w-full" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-base-content/60">Numéro WhatsApp (facultatif)</span>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="6XX XX XX XX" inputMode="tel"
                className="ui-field w-full" />
            </label>
          </div>
          <p className="text-xs text-base-content/50">Sans numéro, WhatsApp vous laissera choisir le contact.</p>

          <div className="space-y-2">
            <span className="text-xs font-medium text-base-content/60">Rôles</span>
            <RoleToggle checked={form.teacher} onChange={(teacher) => setForm({ ...form, teacher })}
              label="Enseignant" hint="Saisit les notes des classes et matières qui lui sont affectées" />
            <RoleToggle checked={form.moderator} disabled={!isDirector} onChange={(moderator) => setForm({ ...form, moderator })}
              label="Modérateur" hint={isDirector ? "Vous aide à gérer l'établissement, avec les droits que vous choisissez" : "Seul le chef d'établissement nomme des modérateurs"} />
          </div>

          {form.moderator && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-base-content/60">Droits du modérateur</span>
              <PermissionsPicker labels={labels} value={form.permissions} onChange={(permissions) => setForm({ ...form, permissions })} />
            </div>
          )}

          <button type="submit" disabled={sending}
            className="ui-btn ui-btn-primary">
            <Link2 size={16} /> {sending ? "Création..." : "Créer le lien d'invitation"}
          </button>
        </form>
      )}
    </Modal>
  );
}

function EditRolesModal({ member, isDirector, canStaff, labels, onClose, onSaved }) {
  const isMemberDirector = member.roles.includes("director");
  const [teacher, setTeacher] = useState(member.roles.includes("teacher"));
  const [moderator, setModerator] = useState(member.roles.includes("moderator"));
  const [permissions, setPermissions] = useState(member.permissions ?? []);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const roles = [teacher && "teacher", moderator && "moderator"].filter(Boolean);
    setSaving(true);
    try {
      await api.put(`/school/members/${member.user.id}`, { roles, permissions: moderator ? permissions : [] });
      toast.success("Rôles mis à jour.");
      onSaved();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} icon={Pencil} title="Rôles et droits" subtitle={fullName(member.user)}
      footer={
        <>
          <button type="button" onClick={onClose} className="ui-btn ui-btn-soft">Annuler</button>
          <button type="button" onClick={save} disabled={saving}
            className="ui-btn ui-btn-primary">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </>
      }>
      <div className="space-y-2">
        <RoleToggle checked={teacher} disabled={!canStaff} onChange={setTeacher}
          label="Enseignant" hint="Retirer ce rôle libère ses classes de l'année en cours" />
        {!isMemberDirector && (
          <RoleToggle checked={moderator} disabled={!isDirector} onChange={setModerator}
            label="Modérateur" hint={isDirector ? "Aide à la gestion de l'établissement" : "Seul le chef d'établissement nomme des modérateurs"} />
        )}
        {moderator && !isMemberDirector && (
          <div className="pt-2">
            <span className="text-xs font-medium text-base-content/60">Droits du modérateur</span>
            <div className={isDirector ? "mt-2" : "pointer-events-none mt-2 opacity-60"}>
              <PermissionsPicker labels={labels} value={permissions} onChange={setPermissions} />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
