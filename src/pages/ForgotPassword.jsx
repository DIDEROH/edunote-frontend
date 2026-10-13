import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FiMail, FiKey, FiShield } from "react-icons/fi";
import { api } from "../utils/AxiosClient";
import AuthCard from "../components/ui/AuthCard";
import TextInput from "../components/ui/TextInput";
import { CtaNeon } from "../components/ui/ButtonsComponents";

const CODE_LENGTH = 6;

/**
 * Mot de passe oublié :
 * 1. l'utilisateur saisit son adresse e-mail, le serveur lui envoie un code à 6 chiffres ;
 * 2. il saisit le code, puis choisit son nouveau mot de passe (page /reset-password).
 */
function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [resendIn, setResendIn] = useState(0);

  // Compte à rebours avant de pouvoir redemander un code
  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const goToCodeStep = (address, wait) => {
    setEmail(address);
    setStep("code");
    setResendIn(wait);
  };

  // Le serveur répond de la même façon, qu'un compte existe ou non avec cette adresse
  const requestCode = async (address) => {
    try {
      const { data } = await api.postNoAuth("/forgot-password", { email: address });
      goToCodeStep(address, data?.resend_in ?? 60);
      return true;
    } catch (error) {
      if (error.status === 429 && error.response?.data?.retry_after) {
        // Un code est déjà parti il y a moins d'une minute : on le saisit
        goToCodeStep(address, error.response.data.retry_after);
        toast.info("Un code vous a été envoyé il y a moins d'une minute.");
        return false;
      }
      toast.error(error.message || "Impossible d'envoyer le code pour le moment. Réessayez plus tard.");
      return false;
    }
  };

  if (step === "code") {
    return (
      <CodeStep
        email={email}
        resendIn={resendIn}
        onResend={async () => {
          if (await requestCode(email)) toast.success("Un nouveau code vous a été envoyé.");
        }}
        onChangeEmail={() => setStep("email")}
        onVerified={(token) => navigate("/reset-password", { replace: true, state: { email, token } })}
      />
    );
  }

  return <EmailStep defaultEmail={email} onSubmit={requestCode} />;
}

function EmailStep({ defaultEmail, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched", defaultValues: { email: defaultEmail } });

  return (
    <AuthCard
      icon={FiKey}
      title="Mot de passe oublié"
      description="Indiquez votre adresse e-mail : nous vous enverrons un code à 6 chiffres pour choisir un nouveau mot de passe."
      footer={
        <>
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link to="/login" className="font-medium text-primary">
            Se connecter
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(({ email }) => onSubmit(email.trim()))}>
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
          {isSubmitting ? "Envoi en cours..." : "Recevoir le code"}
        </CtaNeon>
      </form>
    </AuthCard>
  );
}

function CodeStep({ email, resendIn, onResend, onChangeEmail, onVerified }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const verify = async (value = code) => {
    if (value.length !== CODE_LENGTH) {
      setError(`Saisissez les ${CODE_LENGTH} chiffres du code reçu par e-mail.`);
      return;
    }
    setVerifying(true);
    setError("");
    try {
      const { data } = await api.postNoAuth("/verify-reset-code", { email, code: value });
      onVerified(data.token);
    } catch (err) {
      setError(err.message || "Code incorrect ou expiré.");
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  // Seuls les chiffres sont gardés : un code collé avec des espaces (« 123 456 ») fonctionne
  const handleChange = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    setError("");
    // Vérification automatique dès que le code est complet (saisie ou collage)
    if (digits.length === CODE_LENGTH && !verifying) verify(digits);
  };

  const resend = async () => {
    setResending(true);
    setCode("");
    setError("");
    await onResend();
    setResending(false);
  };

  return (
    <AuthCard
      icon={FiShield}
      title="Saisissez le code reçu"
      description={`Si un compte existe pour ${email}, un code à ${CODE_LENGTH} chiffres vient de lui être envoyé. Il est valable 10 minutes.`}
      footer={
        <Link to="/login" className="font-medium text-primary">
          Retour à la connexion
        </Link>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          verify();
        }}
      >
        <div className="space-y-1.5">
          <label htmlFor="code" className="text-xs font-medium text-base-content/60">
            Code de vérification
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            value={code}
            onChange={handleChange}
            disabled={verifying}
            placeholder="000000"
            aria-invalid={Boolean(error)}
            className={`w-full rounded-md px-4 py-4 text-center font-mono text-2xl font-semibold tracking-[0.5em] text-base-content outline-none placeholder:text-base-content/20 disabled:opacity-60 ${
              error ? "bg-error/10" : "bg-base-100"
            }`}
          />
          {error && <p className="text-xs text-error">{error}</p>}
        </div>

        <CtaNeon type="submit" disabled={verifying} className="w-full">
          {verifying ? "Vérification..." : "Vérifier le code"}
        </CtaNeon>
      </form>

      <div className="flex flex-col items-center gap-2 text-sm sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={resend}
          disabled={resendIn > 0 || resending}
          className="font-medium text-primary transition-colors duration-150 hover:brightness-90 disabled:cursor-not-allowed disabled:text-base-content/40"
        >
          {resending ? "Envoi..." : resendIn > 0 ? `Renvoyer le code (${resendIn} s)` : "Renvoyer le code"}
        </button>
        <button
          type="button"
          onClick={onChangeEmail}
          className="text-base-content/60 transition-colors duration-150 hover:text-base-content"
        >
          Modifier l'adresse e-mail
        </button>
      </div>

      <p className="text-center text-xs text-base-content/50">
        Rien reçu ? Vérifiez vos courriers indésirables (spam).
      </p>
    </AuthCard>
  );
}

export default ForgotPassword;
