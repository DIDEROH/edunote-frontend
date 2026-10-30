import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FiUserPlus, FiUser, FiLock, FiMail, FiPhone, FiHome, FiMapPin } from "react-icons/fi";
import { ArrowLeft, ArrowRight, Award, ListOrdered } from "lucide-react";
import { api } from "../utils/AxiosClient";
import AuthCard from "../components/ui/AuthCard";
import TextInput from "../components/ui/TextInput";
import { CtaNeon } from "../components/ui/ButtonsComponents";
import { useAuth } from "../context/AuthContext";

const ACCOUNT_FIELDS = ["firstName", "lastName", "email", "phone", "password", "confirmPassword"];

const EVALUATION_TYPES = [
  { value: "sequence", label: "Par séquences", hint: "Notes sur 20 par séquence (2 par trimestre)", icon: ListOrdered },
  { value: "skill", label: "Par compétences", hint: "Notes par compétence évaluée", icon: Award },
];

/**
 * Inscription d'un chef d'établissement : son compte (étape 1) puis son
 * école (étape 2). L'école est ensuite validée par l'équipe EduNote ; le
 * personnel la rejoint par invitation.
 */
function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched", defaultValues: { evaluation_type: "sequence" } });
  const password = useWatch({ control, name: "password", defaultValue: "" });
  const evaluationType = useWatch({ control, name: "evaluation_type" });

  const goToSchool = async () => {
    if (await trigger(ACCOUNT_FIELDS)) setStep(2);
  };

  const onSubmit = async (values) => {
    try {
      const { data } = await api.postNoAuth("/register", {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email?.trim() || null,
        phone: values.phone,
        password: values.password,
        password_confirmation: values.confirmPassword,
        school: {
          name: values.schoolName,
          city: values.city,
          address: values.address || null,
          phone: values.schoolPhone || null,
          evaluation_type: values.evaluation_type,
        },
      });

      login(data.token, data.user);
      toast.success("Inscription envoyée : EduNote va valider votre établissement.");
      navigate("/", { replace: true });
    } catch (error) {
      const fieldErrors = error.response?.data?.errors || {};
      // Une erreur sur le compte (e-mail déjà utilisé...) : retour à l'étape 1
      if (Object.keys(fieldErrors).some((key) => !key.startsWith("school"))) setStep(1);
      toast.error(error.message || "Impossible de créer le compte. Vérifiez vos informations.");
    }
  };

  return (
    <AuthCard
      icon={FiUserPlus}
      title={step === 1 ? "Inscrire mon établissement" : "Votre établissement"}
      description={step === 1
        ? "Étape 1 sur 2 — Vos informations de chef d'établissement."
        : "Étape 2 sur 2 — L'école que vous dirigez. EduNote validera votre inscription."}
      footer={
        <>
          Vous avez déjà un compte ?{" "}
          <Link to="/login" className="font-medium text-primary">Se connecter</Link>
          <p className="mt-3 text-xs text-base-content/50">
            Enseignant ou membre du personnel ? Utilisez le lien d'invitation envoyé par votre établissement.
          </p>
        </>
      }
    >
      <div className="flex gap-2" aria-hidden>
        <span className="h-1.5 flex-1 rounded-sm bg-primary" />
        <span className={`h-1.5 flex-1 rounded-sm ${step === 2 ? "bg-primary" : "bg-base-300"}`} />
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className={step === 1 ? "space-y-5" : "hidden"}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextInput id="firstName" label="Nom" placeholder="Votre nom" icon={FiUser} error={errors.firstName}
              {...register("firstName", { required: "Le nom est requis." })} />
            <TextInput id="lastName" label="Prénom" placeholder="Votre prénom" icon={FiUser} error={errors.lastName}
              {...register("lastName", { required: "Le prénom est requis." })} />
          </div>
          <TextInput id="phone" label="Téléphone (WhatsApp) — sert à vous connecter" type="tel" placeholder="6XX XX XX XX" icon={FiPhone} error={errors.phone}
            {...register("phone", { required: "Le téléphone est requis : il sert à vous connecter et EduNote vous contactera sur WhatsApp." })} />
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

          <CtaNeon type="button" onAction={goToSchool} className="w-full" icon={ArrowRight}>
            Continuer
          </CtaNeon>
        </div>

        <div className={step === 2 ? "space-y-5" : "hidden"}>
          <TextInput id="schoolName" label="Nom de l'établissement" placeholder="ex : Lycée Bilingue de ..." icon={FiHome} error={errors.schoolName}
            {...register("schoolName", { required: "Le nom de l'établissement est requis." })} />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextInput id="city" label="Ville" placeholder="ex : Douala" icon={FiMapPin} error={errors.city}
              {...register("city", { required: "La ville est requise." })} />
            <TextInput id="schoolPhone" label="Téléphone de l'école (facultatif)" type="tel" placeholder="2XX XX XX XX" icon={FiPhone}
              {...register("schoolPhone")} />
          </div>
          <TextInput id="address" label="Adresse (facultatif)" placeholder="Quartier, rue..." icon={FiMapPin}
            {...register("address")} />

          <fieldset className="space-y-2">
            <legend className="mb-1.5 text-xs font-medium text-base-content/60">Mode d'évaluation</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {EVALUATION_TYPES.map(({ value, label, hint, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("evaluation_type", value)}
                  aria-pressed={evaluationType === value}
                  className={`flex items-start gap-3 rounded-md p-3 text-left transition-colors duration-150 ${
                    evaluationType === value ? "bg-primary/10 text-primary" : "bg-base-100 text-base-content hover:bg-base-300"
                  }`}
                >
                  <Icon size={18} className="mt-0.5 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-base-content/50">{hint}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-base-content/50">Vous pourrez le changer plus tard dans « Mon établissement ».</p>
          </fieldset>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-base-100 px-4 py-3 text-sm font-medium text-base-content transition-colors duration-150 hover:bg-base-300"
            >
              <ArrowLeft size={16} /> Retour
            </button>
            <CtaNeon type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Envoi..." : "Envoyer mon inscription"}
            </CtaNeon>
          </div>
        </div>
      </form>
    </AuthCard>
  );
}

export default Register;
