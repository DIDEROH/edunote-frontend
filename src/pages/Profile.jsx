import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Building2, CalendarDays, Hash, KeyRound, Lock, Mail, MapPin, Phone, Save, ShieldCheck, User } from "lucide-react";
import PageHeader from "../components/elements/PageHeader";
import InputComponent from "../components/InputComponent";
import TextInput from "../components/ui/TextInput";
import LoadingSkeleton from "../components/LoadingSkeletoon";
import { CtaNeon } from "../components/ui/ButtonsComponents";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/AxiosClient";
import { getRoleConfig } from "../constants/roles";

const EMPTY_PROFILE = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  birth_date: "",
  birth_place: "",
  gender: "",
};

/**
 * Profil de l'utilisateur connecté : informations personnelles et mot de passe.
 */
function Profile() {
  const { user, roles, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [createdAt, setCreatedAt] = useState(null);

  const profileForm = useForm({ defaultValues: EMPTY_PROFILE });
  const passwordForm = useForm({
    defaultValues: { current_password: "", password: "", password_confirmation: "" },
  });

  const selectedGender = useWatch({ control: profileForm.control, name: "gender" });

  useEffect(() => {
    if (!user?.id) return;

    api.get(`/users/${user.id}`)
      .then(({ data }) => {
        profileForm.reset({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          birth_date: data.birth_date ? String(data.birth_date).split("T")[0] : "",
          birth_place: data.birth_place || "",
          gender: data.gender || "",
        });
        setCreatedAt(data.created_at);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onSaveProfile = async (values) => {
    try {
      await api.put(`/users/${user.id}`, {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || null,
        address: values.address || null,
        birth_date: values.birth_date || null,
        birth_place: values.birth_place || null,
        ...(values.gender ? { gender: values.gender } : {}),
      });
      await refreshUser();
      toast.success("Profil mis à jour.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onChangePassword = async (values) => {
    try {
      await api.put(`/users/${user.id}`, values);
      passwordForm.reset();
      toast.success("Mot de passe modifié. Vos autres sessions ont été fermées.");
    } catch (error) {
      const fieldError = error.response?.data?.errors?.current_password?.[0];
      if (fieldError) {
        passwordForm.setError("current_password", { message: fieldError });
      } else {
        toast.error(error.message);
      }
    }
  };

  const fullName = user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <main className="pb-12">
      <PageHeader
        title="Mon profil"
        subtitle="Consultez et mettez à jour vos informations personnelles et votre mot de passe."
      />

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* Carte récapitulative */}
          <aside className="lg:col-span-4">
            <div className="overflow-hidden rounded-md bg-base-200">
              <div className="bg-primary px-6 py-7 text-primary-content">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-white/15 text-xl font-semibold">
                    {initials || <User size={26} />}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">{fullName}</h2>
                    <p className="truncate text-sm opacity-80">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-base-content/50">Rôles</h3>
                  <div className="flex flex-wrap gap-2">
                    {roles.length === 0 ? (
                      <span className="text-sm text-base-content/50">Aucun rôle attribué</span>
                    ) : roles.map((role) => (
                      <span key={role} className="inline-flex items-center gap-1.5 rounded-sm bg-base-300 px-2.5 py-1 text-xs font-medium text-base-content">
                        <span className={`h-1.5 w-1.5 rounded-full ${getRoleConfig(role).dot}`} />
                        {getRoleConfig(role).label}
                      </span>
                    ))}
                  </div>
                </section>

                {user?.school && (
                  <section>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-base-content/50">Établissement</h3>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Building2 size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-base-content">{user.school.name}</p>
                        <p className="text-xs text-base-content/50">{user.school.code}</p>
                      </div>
                    </div>
                  </section>
                )}

                {createdAt && (
                  <p className="text-xs text-base-content/50">
                    Membre depuis le {new Date(createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          </aside>

          <div className="space-y-6 lg:col-span-8">

            {/* Informations personnelles */}
            <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="rounded-md bg-base-200 p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-base-content">Informations personnelles</h2>
                  <p className="text-xs text-base-content/50">Visibles par les administrateurs de la plateforme</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InputComponent nom="Nom" name="firstName" register={profileForm.register} errors={profileForm.formState.errors} req={true} type="text" placeholder="Nom" icone={<User size={16} />} />
                <InputComponent nom="Prénom" name="lastName" register={profileForm.register} errors={profileForm.formState.errors} req={true} type="text" placeholder="Prénom" icone={<User size={16} />} />
                <InputComponent nom="Adresse e-mail" name="email" register={profileForm.register} errors={profileForm.formState.errors} req={true} type="email" placeholder="exemple@ecole.cm" icone={<Mail size={16} />} />
                <InputComponent nom="Téléphone" name="phone" register={profileForm.register} errors={profileForm.formState.errors} req={false} type="tel" placeholder="6xx xxx xxx" icone={<Phone size={16} />} />
                <InputComponent nom="Date de naissance" name="birth_date" register={profileForm.register} errors={profileForm.formState.errors} req={false} type="date" icone={<CalendarDays size={16} />} />
                <InputComponent nom="Lieu de naissance" name="birth_place" register={profileForm.register} errors={profileForm.formState.errors} req={false} type="text" placeholder="Lieu" icone={<Hash size={16} />} />
                <div className="md:col-span-2">
                  <InputComponent nom="Adresse" name="address" register={profileForm.register} errors={profileForm.formState.errors} req={false} type="text" placeholder="Quartier, ville" icone={<MapPin size={16} />} />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-medium text-base-content/60">Genre</label>
                <input type="hidden" {...profileForm.register("gender")} />
                <div className="flex gap-3">
                  {[{ value: "M", label: "Homme" }, { value: "F", label: "Femme" }].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => profileForm.setValue("gender", option.value, { shouldDirty: true })}
                      className={`flex-1 rounded-md py-3 text-sm font-medium transition-colors duration-150 ${
                        selectedGender === option.value ? "bg-primary/10 text-primary" : "bg-base-100 text-base-content/50 hover:text-base-content"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <CtaNeon type="submit" icon={Save} disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </CtaNeon>
              </div>
            </form>

            {/* Mot de passe */}
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="rounded-md bg-base-200 p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning/10 text-warning">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-base-content">Mot de passe</h2>
                  <p className="text-xs text-base-content/50">Vos autres sessions seront fermées après le changement</p>
                </div>
              </div>

              <div className="space-y-5">
                <TextInput
                  id="current_password"
                  label="Mot de passe actuel"
                  type="password"
                  placeholder="••••••••••••"
                  icon={KeyRound}
                  error={passwordForm.formState.errors.current_password}
                  {...passwordForm.register("current_password", { required: "Le mot de passe actuel est requis." })}
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <TextInput
                    id="password"
                    label="Nouveau mot de passe"
                    type="password"
                    placeholder="••••••••••••"
                    icon={Lock}
                    error={passwordForm.formState.errors.password}
                    {...passwordForm.register("password", {
                      required: "Le nouveau mot de passe est requis.",
                      minLength: { value: 8, message: "Au moins 8 caractères." },
                    })}
                  />

                  <TextInput
                    id="password_confirmation"
                    label="Confirmation"
                    type="password"
                    placeholder="••••••••••••"
                    icon={Lock}
                    error={passwordForm.formState.errors.password_confirmation}
                    {...passwordForm.register("password_confirmation", {
                      required: "La confirmation est requise.",
                      validate: (value, values) => value === values.password || "Les mots de passe ne correspondent pas.",
                    })}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <CtaNeon type="submit" icon={KeyRound} disabled={passwordForm.formState.isSubmitting}>
                  {passwordForm.formState.isSubmitting ? "Modification..." : "Modifier le mot de passe"}
                </CtaNeon>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Profile;
