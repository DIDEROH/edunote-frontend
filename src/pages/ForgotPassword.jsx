import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FiMail, FiKey } from "react-icons/fi";
import { api } from "../utils/AxiosClient";
import AuthCard from "../components/ui/AuthCard";
import TextInput from "../components/ui/TextInput";
import { CtaNeon } from "../components/ui/ButtonsComponents";

function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  const onSubmit = async ({ email }) => {
    try {
      await api.postNoAuth("/forgot-password", { email });
      // Le backend renvoie toujours le même message, qu'un compte existe
      // ou non avec cet e-mail, pour ne pas permettre l'énumération de comptes.
      setSent(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Impossible d'envoyer le lien pour le moment. Réessayez plus tard."
      );
    }
  };

  if (sent) {
    return (
      <AuthCard
        icon={FiKey}
        title="Vérifiez votre boîte mail"
        description="Si un compte existe avec cette adresse, un lien de réinitialisation vient de lui être envoyé."
        footer={
          <Link to="/login" className="font-medium text-primary">
            Retour à la connexion
          </Link>
        }
      >
        <p className="text-sm text-base-content/70 text-center">
          Pensez à vérifier vos courriers indésirables si rien n'arrive d'ici quelques minutes.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={FiKey}
      title="Mot de passe oublié"
      description="Indiquez votre adresse e-mail, nous vous enverrons un lien pour choisir un nouveau mot de passe."
      footer={
        <>
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link to="/login" className="font-medium text-primary">
            Se connecter
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

        <CtaNeon type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
        </CtaNeon>
      </form>
    </AuthCard>
  );
}

export default ForgotPassword;
