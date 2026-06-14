import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FiLogIn, FiUser, FiLock } from "react-icons/fi";
import { api } from "../utils/AxiosClient";
import AuthCard from "../components/ui/AuthCard";
import TextInput from "../components/ui/TextInput";
import { CtaNeon } from "../components/ui/ButtonsComponents";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  const { login } = useAuth();

  const onSubmit = async ({ email, password }) => {
    try {
      const response = await api.postNoAuth("/login", { email, password });

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
          Vous n'avez pas encore de compte ?{' '}
          <Link to="/register" className="font-semibold text-slate-500">
            Créer un compte
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          id="email"
          label="Adresse e-mail"
          type="email"
          placeholder="exemple@ecole.cm"
          icon={FiUser}
          error={errors.email}
          {...register("email", {
            required: "L'adresse e-mail est requise.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Format d'e-mail invalide.",
            },
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

        <CtaNeon type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <span>Connexion... <span className="loading"></span></span> : <span>Se connecter</span>}
        </CtaNeon>
      </form>
    </AuthCard>
  );
}

export default Login;
