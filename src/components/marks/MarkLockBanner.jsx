import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock, LockKeyhole, MessageCircle, ShieldCheck, Unlock } from "lucide-react";
import { api } from "../../utils/AxiosClient";
import { formatSchoolDateTime } from "../../utils/schoolTime";

/**
 * Clôture de la saisie, au-dessus de la grille de notes :
 * date limite, saisie clôturée (lecture seule) et demande de correction
 * au chef d'établissement, ou correction autorisée jusqu'à une date.
 *
 * target : { school_id, classroom_id, subject_id, sequence_id | term_id }
 */
export default function MarkLockBanner({ lock, target, onChanged }) {
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState(null);

  if (!lock) return null;

  if (!lock.closed) {
    if (!lock.deadline) return null;
    return (
      <Banner tone="info" icon={CalendarClock}>
        Saisie ouverte jusqu'au <strong>{formatSchoolDateTime(lock.deadline)}</strong>. Ensuite, toute correction demandera l'accord du chef d'établissement.
      </Banner>
    );
  }

  const since = formatSchoolDateTime(lock.closed_since);

  if (lock.reason === "unlock") {
    return (
      <Banner tone="success" icon={Unlock}>
        Correction autorisée jusqu'au <strong>{formatSchoolDateTime(lock.unlock?.expires_at)}</strong>. Enregistrez vos corrections avant cette heure.
      </Banner>
    );
  }

  if (lock.reason === "director") {
    return (
      <Banner tone="warning" icon={ShieldCheck}>
        Saisie clôturée depuis le {since}. En tant que chef d'établissement, vous pouvez encore modifier ces notes : chaque changement reste dans l'historique.
      </Banner>
    );
  }

  const unlock = lock.unlock;

  const send = async () => {
    setSending(true);
    try {
      const { data } = await api.post("/mark-unlocks", { ...target, reason });
      toast.success(data.message);
      setWhatsappUrl(data.whatsapp_url);
      setAsking(false);
      setReason("");
      await onChanged?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Banner tone="error" icon={LockKeyhole}>
      <div className="space-y-3">
        <p>
          <strong>Saisie clôturée</strong> depuis le {since} : ces notes ne peuvent plus être modifiées sans l'accord du chef d'établissement.
        </p>

        {unlock?.status === "pending" && (
          <p className="text-base-content/70">Votre demande de correction du {formatSchoolDateTime(unlock.requested_at)} attend sa réponse.</p>
        )}
        {unlock?.status === "refused" && (
          <p className="text-base-content/70">Demande refusée le {formatSchoolDateTime(unlock.decided_at)}{unlock.response ? ` : « ${unlock.response} »` : "."}</p>
        )}
        {unlock?.status === "approved" && !unlock.active && (
          <p className="text-base-content/70">L'autorisation de correction a pris fin le {formatSchoolDateTime(unlock.expires_at)}.</p>
        )}

        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noreferrer"
            className="ui-btn ui-btn-success ui-btn-sm">
            <MessageCircle size={14} /> Prévenir le chef d'établissement par WhatsApp
          </a>
        )}

        {lock.can_request && !asking && (
          <button type="button" onClick={() => setAsking(true)}
            className="ui-btn ui-btn-soft ui-btn-sm">
            Demander une correction
          </button>
        )}

        {asking && (
          <div className="space-y-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-base-content/60">Pourquoi ces notes doivent-elles être corrigées ?</span>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={500} autoFocus
                placeholder="Ex. : erreur de saisie pour deux élèves, copie retrouvée…"
                className="ui-field w-full" />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={send} disabled={sending || reason.trim().length < 5}
                className="ui-btn ui-btn-primary ui-btn-sm">
                {sending ? "Envoi..." : "Envoyer la demande"}
              </button>
              <button type="button" onClick={() => setAsking(false)}
                className="ui-btn ui-btn-soft ui-btn-sm">
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </Banner>
  );
}

const TONES = {
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
};

function Banner({ tone, icon: Icon, children }) {
  return (
    <div className={`mt-5 flex gap-3 rounded-2xl p-4 text-sm ring-1 ring-base-content/5 ${TONES[tone].split(" ")[0]}`}>
      <Icon size={18} className={`mt-0.5 shrink-0 ${TONES[tone].split(" ")[1]}`} />
      <div className="min-w-0 flex-1 text-base-content/80">{children}</div>
    </div>
  );
}
