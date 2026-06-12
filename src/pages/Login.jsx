import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FiLogIn, FiUser, FiLock } from "react-icons/fi";
import { api } from "../utils/AxiosClient";
import AuthCard from "../components/ui/AuthCard";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";

function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  const onSubmit = async ({ email, password }) => {
    try {
      const response = await api.postNoAuth("/login", {
        email,
        password,
      });

      const { token } = response.data || {};
      if (token) {
        localStorage.setItem("user_token_edunote", token);
        toast.success("Connexion réussie");
        navigate("/home", { replace: true });
      } else {
        toast.error("Identifiants invalides, veuillez réessayer.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Impossible de se connecter. Vérifiez votre connexion."
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

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </AuthCard>
  );
}

export default Login;
