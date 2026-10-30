import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FiLogIn, FiUser, FiLock } from "react-icons/fi";
import { api } from "../utils/AxiosClient";
import AuthCard from "../components/ui/AuthCard";
import TextInput from "../components/ui/TextInput";
import { CtaNeon } from "../components/ui/ButtonsComponents";
import { useAuth } from "../context/AuthContext";
import { ArrowRight } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  const { login } = useAuth();

  // Identifiant : e-mail ou numéro de téléphone
  const onSubmit = async ({ login: identifier, password }) => {
    try {
      const response = await api.postNoAuth("/login", { login: identifier.trim(), password });

      // 1. On vérifie d'abord si le backend a renvoyé un message d'erreur personnalisé
      if (response.data?.message) {
        toast.error(response.data.message);
        return; // On arrête l'exécution ici
      }

      // 2. Si pas d'erreur, on cherche le token
      const { token, user } = response.data || {};
      if (token) {
        // Utiliser le contexte d'auth pour synchroniser l'app entière
        login(token, user);
        toast.success("Connexion réussie");
        navigate("/", { replace: true });
      } else {
        toast.error("Identifiants invalides, veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      // Ce bloc ne gérera plus que les pannes réseau ou les erreurs 500
      toast.error(
        error?.message || "Impossible de se connecter. Veuillez réessayer."
      );
    }
  };


  return (
    <AuthCard
      icon={FiLogIn}
      title="Bienvenue sur EduNote"
      description="Connectez-vous pour accéder à votre espace de gestion scolaire."
      footer={
        <>
          Chef d'établissement ?{' '}
          <Link to="/register" className="font-medium text-primary">
            Inscrire mon établissement
          </Link>
          <p className="mt-2 text-xs text-base-content/50">
            Personnel d'une école : utilisez le lien d'invitation reçu par WhatsApp.
          </p>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          id="login"
          label="Téléphone ou adresse e-mail"
          type="text"
          autoComplete="username"
          placeholder="6XX XX XX XX ou exemple@ecole.cm"
          icon={FiUser}
          error={errors.login}
          {...register("login", {
            required: "Saisissez votre numéro de téléphone ou votre e-mail.",
          })}
        />

        <TextInput
          id="password"
          label="Mot de passe"
          type="password"
          placeholder="••••••••••••"
          icon={FiLock}
          error={errors.password}
          {...register("password", {
            required: "Le mot de passe est requis.",
          })}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
          <CtaNeon type="submit" disabled={isSubmitting} icon={isSubmitting ? undefined : ArrowRight}>
            {isSubmitting ? <><span className="ui-spinner" /> Connexion…</> : "Se connecter"}
          </CtaNeon>
        </div>
      </form>
    </AuthCard>
  );
}

export default Login;
