import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FiUserPlus, FiUser, FiLock, FiMail } from "react-icons/fi";
import { api } from "../utils/AxiosClient";
import AuthCard from "../components/ui/AuthCard";
import Button from "../components/ui/Button";
import TextInput from "../components/ui/TextInput";

function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  const password = watch("password", "");

  const onSubmit = async ({ name, email, password, confirmPassword }) => {
    try {
      const response = await api.postNoAuth("/register", {
        name,
        email,
        password,
        password_confirmation: confirmPassword,
      });

      const { token, roles } = response.data || {};
      if (token) {
        localStorage.setItem("user_token_edunote", token);
        localStorage.setItem("edunote_roles", JSON.stringify(roles || ["Admin"]));
        toast.success("Inscription réussie");
        navigate("/home", { replace: true });
      } else {
        toast.error("Impossible de s'inscrire pour le moment.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Impossible de créer le compte. Vérifiez vos informations."
      );
    }
  };

  return (
    <AuthCard
      icon={FiUserPlus}
      title="Créer un compte"
      description="Inscrivez-vous pour piloter vos établissements et gérer les bulletins."
      footer={
        <>
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="font-semibold text-slate-500">
            Se connecter
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          id="name"
          label="Nom complet"
          type="text"
          placeholder="Votre nom"
          icon={FiUser}
          error={errors.name}
          {...register("name", { required: "Le nom est requis." })}
        />

        <TextInput
          id="email"
          label="Adresse e-mail"
          type="email"
          placeholder="exemple@ecole.cm"
          icon={FiMail}
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
            minLength: {
              value: 8,
              message: "Le mot de passe doit contenir au moins 8 caractères.",
            },
          })}
        />

        <TextInput
          id="confirmPassword"
          label="Confirmation du mot de passe"
          type="password"
          placeholder="••••••••••••"
          icon={FiLock}
          error={errors.confirmPassword}
          {...register("confirmPassword", {
            required: "La confirmation est requise.",
            validate: (value) => value === password || "Les mots de passe ne correspondent pas.",
          })}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Création en cours..." : "S'inscrire"}
        </Button>
      </form>
    </AuthCard>
  );
}

export default Register;
