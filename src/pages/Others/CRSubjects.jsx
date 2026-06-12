import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, Hash, Layers, Save, Type, User } from "lucide-react";
import axiosClient from "../../utils/AxiosClient";
import { toast } from "react-toastify";
import BackComponent from "../../components/BackComponent";
import Navbar from "../../components/Navbar";
import TitleComponent from "../../components/TitleComponent";
import InputComponent from "../../components/InputComponent";
import { useForm } from "react-hook-form";

function CRSubjects() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Utilisation de reset pour charger les données
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient.get(`/subjects/${id}`)
        .then(({ data }) => {
          reset(data.data); // Remplit les champs name, code, etc.
        })
        .finally(() => setLoading(false));
    }
  }, [id, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (id) {
        await axiosClient.put(`/subjects/${id}`, data);
        toast.success("Matière mise à jour");
      } else {
        await axiosClient.post("/subjects", data);
        toast.success("Matière créée");
      }
      navigate("/edunote/subjects");
    } catch (error) {
      toast.error("Erreur technique");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar>
        <Navbar.Left>
          <TitleComponent>
            {id ? "Modifier la matière" : "Ajouter une matière"}
          </TitleComponent>
        </Navbar.Left>
        <Navbar.Center></Navbar.Center>
        <Navbar.Right>
          <BackComponent />
        </Navbar.Right>
      </Navbar>

      <main className="max-w-4xl mx-auto p-2 md:p-4 lg:p-6 xl:p-8">
        <div className="bg-white rounded-lg shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          
          {/* Header du formulaire */}
          <div className="p-10 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-indigo-600 text-white rounded-3xl shadow-lg shadow-indigo-200">
                <BookOpen size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Informations Générales
                </h2>
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[2px] mt-1">
                  Définissez les paramètres de la discipline
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <form  onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:p-4 lg:p-6 xl:p-8">


              <InputComponent
                nom="Nom de la matière"
                name="name"          // <--- INDISPENSABLE pour register(name)
                type="text"
                placeholder="Ex: Mathématiques"
                req={true}
                register={register}
                errors={errors}
                icone={<User className="w-4 h-4" />}
              />

              <InputComponent
                nom="Code / Abréviation"
                name="code"          // <--- Correspond à la clé dans votre DB
                type="text"
                placeholder="Ex: MATH-01"
                req={true}
                register={register}
                errors={errors}
                icone={<Hash size={14} />}
              />

              
                

            </div>

            {/* Bouton de validation */}
            <div className="pt-6 border-t border-slate-50">
              <button
                disabled={loading}
                type="submit"
                className="group w-full md:w-auto px-10 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[2px] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-slate-200 hover:shadow-indigo-200 disabled:opacity-50"
              >
                {loading ? (
                  "Traitement..."
                ) : (
                  <>
                    <Save size={18} className="group-hover:scale-110 transition-transform" />
                    {id ? "Enregistrer les modifications" : "Créer la matière"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CRSubjects;