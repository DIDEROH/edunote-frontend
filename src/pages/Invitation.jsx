import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FiLock, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { MailOpen, School } from "lucide-react";
import { api } from "../utils/AxiosClient";
import { useAuth } from "../context/AuthContext";
import AuthCard from "../components/ui/AuthCard";
import TextInput from "../components/ui/TextInput";
import { CtaNeon } from "../components/ui/ButtonsComponents";
import LoadingSkeleton from "../components/LoadingSkeletoon";

const ROLE_LABELS = { teacher: "enseignant(e)", moderator: "modérateur / modératrice", director: "chef d'établissement" };
const rolesText = (roles = []) => roles.map((role) => ROLE_LABELS[role] ?? role).join(" et ");

/**
 * Lien d'invitation reçu par WhatsApp (/invitation/:token) : l'invité crée
 * son compte (ou se connecte) et rejoint l'établissement avec le rôle prévu.
 */
export default function Invitation() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, login, refreshUser, userName } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("register");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let ignore = false;
    api.getNoAuth(`/invitations/${token}`)
      .then(({ data }) => { if (!ignore) setInvitation(data); })
      .catch((err) => { if (!ignore) setError(err.message || "Ce lien d'invitation n'existe pas."); });
    return () => { ignore = true; };
  }, [token]);

  const join = async () => {
    setJoining(true);
    try {
      const { data } = await api.post(`/invitations/${token}/accept`);
      await refreshUser();
      toast.success(data.message);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setJoining(false);
    }
  };

  if (error || (invitation && !invitation.usable)) {
    return (
      <AuthCard
        icon={MailOpen}
        title="Invitation indisponible"
        description={error || "Ce lien a expiré ou a déjà été utilisé."}
        footer={<Link to="/login" className="font-medium text-primary">Aller à la connexion</Link>}
      >
        <p className="text-sm text-base-content/70">
          Demandez un nouveau lien d'invitation au chef de votre établissement.
        </p>
      </AuthCard>
    );
  }

  if (!invitation) return <LoadingSkeleton />;

  const title = `Rejoindre ${invitation.school?.name}`;
  const description = `${invitation.inviter ? `${invitation.inviter} vous invite` : "Vous êtes invité(e)"} en tant que ${rolesText(invitation.roles)}.`;

  // Déjà connecté : un clic suffit
  if (isAuthenticated) {
    return (
      <AuthCard icon={School} title={title} description={description}>
        <p className="text-sm text-base-content/70">Vous êtes connecté(e) en tant que <strong>{userName}</strong>.</p>
        <CtaNeon type="button" onAction={join} disabled={joining} className="w-full">
          {joining ? "Validation..." : "Rejoindre l'établissement"}
        </CtaNeon>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={School}
      title={title}
      description={description}
      footer={<span className="text-xs">Lien valable jusqu'au {new Date(invitation.expires_at).toLocaleDateString("fr-FR")}.</span>}
    >
      <div className="flex rounded-md bg-base-100 p-1" role="tablist">
        {[["register", "Je crée mon compte"], ["login", "J'ai déjà un compte"]].map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={`flex-1 rounded-sm py-2 text-xs font-medium transition-colors duration-150 ${mode === value ? "bg-base-200 text-primary" : "text-base-content/50 hover:text-base-content"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "register"
        ? <RegisterForm token={token} defaultName={invitation.name} onDone={(data) => { login(data.token, data.user); toast.success(data.message); navigate("/", { replace: true }); }} />
        : <LoginForm onLoggedIn={async (data) => { login(data.token, data.user); await join(); }} />}
    </AuthCard>
  );
}

function RegisterForm({ token, defaultName, onDone }) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    mode: "onTouched",
    defaultValues: { first_name: defaultName || "" },
  });
  const password = useWatch({ control, name: "password", defaultValue: "" });

  const onSubmit = async (values) => {
    try {
      const { data } = await api.postNoAuth(`/invitations/${token}/register`, {
        ...values,
        email: values.email?.trim() || null,
        password_confirmation: values.confirmPassword,
      });
      onDone(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextInput id="first_name" label="Nom" icon={FiUser} error={errors.first_name}
          {...register("first_name", { required: "Le nom est requis." })} />
        <TextInput id="last_name" label="Prénom" icon={FiUser} error={errors.last_name}
          {...register("last_name", { required: "Le prénom est requis." })} />
      </div>
      <TextInput id="phone" label="Téléphone (WhatsApp) — sert à vous connecter" type="tel" placeholder="6XX XX XX XX" icon={FiPhone} error={errors.phone}
        {...register("phone", { required: "Le téléphone est requis : il sert à vous connecter." })} />
      <TextInput id="email" label="Adresse e-mail (facultatif)" type="email" placeholder="exemple@ecole.cm" icon={FiMail} error={errors.email}
        {...register("email", {
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Format d'e-mail invalide." },
        })} />
      <TextInput id="password" label="Mot de passe" type="password" placeholder="••••••••••••" icon={FiLock} error={errors.password}
        {...register("password", {
          required: "Le mot de passe est requis.",
          minLength: { value: 8, message: "Le mot de passe doit contenir au moins 8 caractères." },
        })} />
      <TextInput id="confirmPassword" label="Confirmation du mot de passe" type="password" placeholder="••••••••••••" icon={FiLock} error={errors.confirmPassword}
        {...register("confirmPassword", {
          required: "La confirmation est requise.",
          validate: (value) => value === password || "Les mots de passe ne correspondent pas.",
        })} />
      <CtaNeon type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Création..." : "Créer mon compte et rejoindre"}
      </CtaNeon>
    </form>
  );
}

function LoginForm({ onLoggedIn }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ mode: "onTouched" });

  const onSubmit = async (values) => {
    try {
      const { data } = await api.postNoAuth("/login", values);
      await onLoggedIn(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <TextInput id="login-identifier" label="Téléphone ou adresse e-mail" type="text" autoComplete="username" icon={FiPhone} error={errors.login}
        {...register("login", { required: "Saisissez votre numéro de téléphone ou votre e-mail." })} />
      <TextInput id="login-password" label="Mot de passe" type="password" icon={FiLock} error={errors.password}
        {...register("password", { required: "Le mot de passe est requis." })} />
      <CtaNeon type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Connexion..." : "Se connecter et rejoindre"}
      </CtaNeon>
    </form>
  );
}
