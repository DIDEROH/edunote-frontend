import { useState } from "react";
import { Ban, Clock, MessageCircle, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import AuthCard from "./ui/AuthCard";

// Numéro WhatsApp de l'équipe EduNote (+237 670 276 295)
const EDUNOTE_WHATSAPP = "237670276295";

const CONTENT = {
  pending: {
    icon: Clock,
    title: "Inscription en cours de validation",
    text: "L'équipe EduNote vérifie l'inscription de votre établissement. Vous serez prévenu(e) sur WhatsApp dès qu'elle sera validée ; vous pourrez alors configurer votre école et inviter votre personnel.",
  },
  rejected: {
    icon: XCircle,
    title: "Inscription refusée",
    text: "L'inscription de votre établissement n'a pas été validée.",
  },
  suspended: {
    icon: Ban,
    title: "Établissement suspendu",
    text: "L'accès à votre établissement est suspendu par l'équipe EduNote.",
  },
};

/**
 * Affiché à la place de l'application tant que l'école gérée par le
 * directeur (ou le modérateur) n'est pas active.
 */
export default function SchoolStatusScreen({ school }) {
  const { refreshUser, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const content = CONTENT[school.status] ?? CONTENT.pending;

  const check = async () => {
    setChecking(true);
    try {
      const user = await refreshUser();
      if (user.school?.status === "active") toast.success("Votre établissement est validé, bienvenue !");
      else toast.info("Toujours en attente de validation.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setChecking(false);
    }
  };

  const whatsappText = encodeURIComponent(`Bonjour EduNote, je suis le chef de l'établissement « ${school.name} » (code ${school.code}). `);

  return (
    <AuthCard
      icon={content.icon}
      title={content.title}
      description={school.name}
      footer={
        <button type="button" onClick={logout} className="font-medium text-base-content/60 hover:text-base-content">
          Se déconnecter
        </button>
      }
    >
      <p className="text-sm leading-relaxed text-base-content/70">{content.text}</p>

      {school.rejection_reason && school.status !== "pending" && (
        <div className="rounded-md bg-warning/10 p-4 text-sm text-base-content/80">
          <span className="font-medium">Motif : </span>{school.rejection_reason}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={check}
          disabled={checking}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-content transition-colors duration-150 hover:brightness-95 disabled:opacity-60"
        >
          <RefreshCw size={16} className={checking ? "animate-spin" : ""} /> Vérifier à nouveau
        </button>
        <a
          href={`https://wa.me/${EDUNOTE_WHATSAPP}?text=${whatsappText}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-success/10 px-4 py-2.5 text-sm font-medium text-success transition-colors duration-150 hover:bg-success/15"
        >
          <MessageCircle size={16} /> Contacter EduNote
        </a>
      </div>
    </AuthCard>
  );
}
