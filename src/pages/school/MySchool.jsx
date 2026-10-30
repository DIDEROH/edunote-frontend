import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Award, Camera, Home, ListOrdered, Mail, MapPin, Phone, QrCode, Quote, Save, School as SchoolIcon } from "lucide-react";
import { api } from "../../utils/AxiosClient";
import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../providers/ConfirmProvider";
import convertToWebp from "../../utils/imageToWebp";
import useNavbarRefresh from "../../hooks/useNavbarRefresh";
import PageHeader from "../../components/elements/PageHeader";
import InputComponent from "../../components/InputComponent";
import LoadingSkeleton from "../../components/LoadingSkeletoon";

const FIELDS = ["name", "code", "motto", "city", "address", "phone", "email", "logo"];

/**
 * Paramètres de l'établissement (chef d'établissement uniquement) :
 * identité imprimée sur les bulletins, logo, mode d'évaluation.
 */
export default function MySchool() {
  const { school: current, refreshUser } = useAuth();
  const confirm = useConfirm();
  const [school, setSchool] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting, isDirty } } = useForm();
  const logo = useWatch({ control, name: "logo" });

  const apply = (data) => {
    setSchool(data);
    reset(Object.fromEntries(FIELDS.map((field) => [field, data[field] ?? ""])));
  };

  useEffect(() => {
    if (!current?.id) return undefined;
    let ignore = false;
    api.get(`/schools/${current.id}`)
      .then(({ data }) => { if (!ignore) apply(data); })
      .catch((error) => toast.error(error.message));
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  useNavbarRefresh(current?.id ? async () => {
    const { data } = await api.get(`/schools/${current.id}`);
    if (isDirty && !(await confirm("Les modifications non enregistrées seront remplacées.", { title: "Actualiser" }))) return;
    apply(data);
  } : null);

  const onSubmit = async (values) => {
    try {
      const { data } = await api.put(`/schools/${school.id}`, values);
      apply(data);
      await refreshUser();
      toast.success("Établissement mis à jour : les prochains bulletins utiliseront ces informations.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const uploadLogo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const webp = await convertToWebp(file, 600, 0.85);
      const formData = new FormData();
      formData.append("file", webp);
      formData.append("folder", "schools");
      const { data } = await api.post("/uploads", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setValue("logo", data.url, { shouldDirty: true });
      toast.success("Logo chargé : pensez à enregistrer.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleEvaluation = async () => {
    const next = school.evaluation_type === "skill" ? "séquences" : "compétences";
    if (!(await confirm(`Les bulletins seront calculés par ${next}. À faire de préférence avant la saisie des notes de l'année.`, { title: "Changer le mode d'évaluation" }))) return;
    try {
      const { data } = await api.patch(`/schools/${school.id}/toggle-evaluation`);
      toast.success(data.message);
      setSchool({ ...school, evaluation_type: school.evaluation_type === "skill" ? "sequence" : "skill" });
      refreshUser().catch(() => {});
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!school) return <LoadingSkeleton />;

  const isSkill = school.evaluation_type === "skill";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Mon établissement" subtitle="Ces informations figurent sur les bulletins de vos élèves." />

      <form onSubmit={handleSubmit(onSubmit)} className="surface space-y-6 p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-base-100">
            {logo ? <img src={logo} alt="Logo" className="h-full w-full object-cover" /> : <SchoolIcon size={30} className="text-base-content/30" />}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-base-100 px-4 py-2.5 text-sm font-medium text-base-content transition-colors duration-150 hover:bg-base-300 ring-1 ring-base-300/60">
            <Camera size={16} /> {uploading ? "Envoi..." : "Changer le logo"}
            <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} disabled={uploading} />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <InputComponent nom="Nom de l'établissement" name="name" register={register} errors={errors} req icone={<SchoolIcon size={18} />} />
          </div>
          <InputComponent nom="Code" name="code" register={register} errors={errors} req icone={<QrCode size={18} />} />
          <InputComponent nom="Devise" name="motto" register={register} errors={errors} req={false} icone={<Quote size={18} />} />
          <InputComponent nom="Ville" name="city" register={register} errors={errors} req icone={<MapPin size={18} />} />
          <InputComponent nom="Adresse" name="address" register={register} errors={errors} req={false} icone={<Home size={18} />} />
          <InputComponent nom="Téléphone" name="phone" register={register} errors={errors} req={false} type="tel" icone={<Phone size={18} />} />
          <InputComponent nom="E-mail" name="email" register={register} errors={errors} req={false} type="email" icone={<Mail size={18} />} />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting || !isDirty}
            className="ui-btn ui-btn-primary">
            <Save size={16} /> {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>

      <section className="surface flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/15">
            {isSkill ? <Award size={18} /> : <ListOrdered size={18} />}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-base-content">Mode d'évaluation : {isSkill ? "par compétences" : "par séquences"}</h2>
            <p className="text-xs text-base-content/50">Détermine la saisie des notes et le contenu des bulletins.</p>
          </div>
        </div>
        <button type="button" onClick={toggleEvaluation}
          className="ui-btn ui-btn-soft">
          Passer {isSkill ? "aux séquences" : "aux compétences"}
        </button>
      </section>
    </div>
  );
}
