import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FiLock, FiKey } from "react-icons/fi";
import { api } from "../utils/AxiosClient";
import AuthCard from "../components/ui/AuthCard";
import TextInput from "../components/ui/TextInput";
import { CtaNeon } from "../components/ui/ButtonsComponents";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const [linkInvalid] = useState(!token || !email);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });
  const password = watch("password", "");

  const onSubmit = async ({ password, confirmPassword }) => {
    try {
      await api.postNoAuth("/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      toast.success("Mot de passe réinitialisé avec succès. Connectez-vous.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Ce lien n'est plus valide. Demandez-en un nouveau."
      );
    }
  };

  if (linkInvalid) {
    return (
      <AuthCard
        icon={FiKey}
        title="Lien invalide"
        description="Ce lien de réinitialisation est incomplet ou a expiré."
        footer={
          <Link to="/login" className="font-medium text-primary">
            Retour à la connexion
          </Link>
        }
      >
        <CtaNeon
          type="button"
          className="w-full"
          onAction={() => navigate("/forgot-password")}
        >
          Demander un nouveau lien
        </CtaNeon>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={FiKey}
      title="Choisir un nouveau mot de passe"
      description={`Pour le compte ${email}`}
      footer={
        <Link to="/login" className="font-medium text-primary">
          Retour à la connexion
        </Link>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          id="password"
          label="Nouveau mot de passe"
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
          {isSubmitting ? "Enregistrement..." : "Réinitialiser le mot de passe"}
        </CtaNeon>
      </form>
    </AuthCard>
  );
}

export default ResetPassword;
