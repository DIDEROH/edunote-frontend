import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FiUserPlus, FiUser, FiLock, FiMail } from "react-icons/fi";
import { api } from "../utils/AxiosClient";
import AuthCard from "../components/ui/AuthCard";
import TextInput from "../components/ui/TextInput";
import { CtaNeon } from "../components/ui/ButtonsComponents";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });
  const { login } = useAuth();
  const password = watch("password", "");

  const onSubmit = async ({ firstName, lastName, email, password, confirmPassword }) => {
    try {
      const response = await api.postNoAuth("/register", {
        firstName,
        lastName,
        email,
        password,
        password_confirmation: confirmPassword,
      });

      const { token, user } = response.data || {};
      if (token) {
        login(token, user);
        toast.success("Inscription réussie");
        navigate("/", { replace: true });
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
          id="firstName"
          label="Nom de famille"
          type="text"
          placeholder="Votre nom de famille"
          icon={FiUser}
          error={errors.firstName}
          {...register("firstName", { required: "Le nom de famille est requis." })}
        />

        <TextInput
          id="lastName"
          label="Prénom"
          type="text"
          placeholder="Votre prénom"
          icon={FiUser}
          error={errors.lastName}
          {...register("lastName", { required: "Le prénom est requis." })}
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

        <CtaNeon type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Création en cours..." : "S'inscrire"}
        </CtaNeon>
      </form>
    </AuthCard>
  );
}

export default Register;
