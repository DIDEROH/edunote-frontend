import Navbar from "../../components/Navbar"
import AddBtn from "../../components/AddBtn"
import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'
import Table from "../../components/Table"
import axiosClient from "../../utils/AxiosClient"
import { useForm } from 'react-hook-form';
import { useHasRole } from '../../hooks/UseHasRole';
import { 
  School as SchoolIcon, QrCode, Quote, MapPin, 
  Home, Phone, Mail, Save, Loader2 
} from 'lucide-react';
import { InformationCircleIcon} from "@heroicons/react/24/outline"
import EditBtn from "../../components/EditBtn"
import DeleteBtn from "../../components/DeleteBtn"
import InputComponent from "../../components/InputComponent"
import { toast } from 'react-toastify'
import useShowConfirm from "../../hooks/UseShowConfirm"
import BtnList from "../../components/BtnList"
import Loading from "../../components/Loading"
import TrComponent from "../../components/TrComponent"
import TdComponent from "../../components/TdComponent"

// --- COMPOSANT : FORMULAIRE (AJOUT & MODIF) ---
const SchoolForm = ({ initialData, onSubmit, loading, isEditMode }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialData || {}
  });

  // CRUCIAL : Met à jour le formulaire si initialData change (ex: passage d'une école à une autre)
  useEffect(() => {
    reset(initialData || {});
  }, [initialData, reset]);

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="mx-auto max-w-2xl bg-white p-2 md:p-4 lg:p-6 xl:p-8 rounded-sm shadow-sm border border-slate-100"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-3 rounded-2xl ${isEditMode ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
          <SchoolIcon size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {isEditMode ? "Modifier l'établissement" : "Ajouter une école"}
          </h2>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-0.5">
            Informations générales
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <InputComponent
            nom="Nom de l'établissement"
            name="name"
            register={register}
            errors={errors}
            req={true}
            type="text"
            placeholder="ex: Complexe Scolaire Bilingue..."
            icone={<SchoolIcon size={18} />}
          />
        </div>

        <InputComponent
          nom="Code"
          name="code"
          register={register}
          errors={errors}
          req={true}
          type="text"
          placeholder="ex: CSB-2024"
          icone={<QrCode size={18} />}
        />

        <InputComponent
          nom="Devise / Slogan"
          name="motto"
          register={register}
          errors={errors}
          req={false}
          type="text"
          placeholder="ex: Travail - Discipline - Succès"
          icone={<Quote size={18} />}
        />

        <InputComponent
          nom="Ville"
          name="city"
          register={register}
          errors={errors}
          req={true}
          type="text"
          placeholder="ex: Douala"
          icone={<MapPin size={18} />}
        />

        <InputComponent
          nom="Adresse complète"
          name="address"
          register={register}
          errors={errors}
          req={false}
          type="text"
          placeholder="ex: Logbessou, carrefour..."
          icone={<Home size={18} />}
        />

        <InputComponent
          nom="Téléphone"
          name="phone"
          register={register}
          errors={errors}
          req={true}
          type="tel"
          placeholder="ex: 6xx xxx xxx"
          icone={<Phone size={18} />}
        />

        <InputComponent
          nom="Email de contact"
          name="email"
          register={register}
          errors={errors}
          req={false}
          type="email"
          placeholder="ex: contact@ecole.com"
          icone={<Mail size={18} />}
        />
      </div>

      <div className="mt-10">
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-5 rounded-3xl font-black text-xs tracking-[2px] uppercase transition-all flex items-center justify-center gap-3 shadow-lg 
            ${isEditMode 
              ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            } text-white disabled:opacity-50`}
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Save size={18} />
              {isEditMode ? "Mettre à jour" : "Enregistrer l'établissement"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// --- COMPOSANT : LISTE DES ÉCOLES ---
const SchoolData = ({ data, onEdit, onDelete }) => {
    const navigate = useNavigate();
    
    if (data.length === 0) {
        return <div className="alert alert-warning mt-4">⚠️ Aucun établissement trouvé</div>;
    }

    return (
        <Table>
            <Table.Head>
                <th>#</th>
                <th>logo</th>
                <th>Nom</th>
                <th>Code</th>
                <th>Actions</th>
            </Table.Head>
            <Table.Body>
                {data.map((s, index) => (
                    <TrComponent key={s.id}>
                        <TdComponent className="font-bold">{index + 1}</TdComponent>
                        <TdComponent>
                            <img 
                                src={s.logo || '/logo.webp'} 
                                alt="" 
                                className="w-10 h-10 object-cover rounded-lg" 
                                onError={(e) => e.target.src = '/logo.webp'}
                            />
                        </TdComponent>
                        <TdComponent>{s.name}</TdComponent>
                        <TdComponent><span className="badge badge-ghost font-mono">{s.code}</span></TdComponent>
                        <TdComponent>
                            <div className="flex gap-1">
                                <EditBtn action={() => onEdit(s)} /> 
                                {isAdmin && <DeleteBtn action={() => onDelete(s.id)} />}
                                <button 
                                    className="btn btn-xs btn-circle btn-ghost" 
                                    onClick={() => navigate(`/edunote/school/${s.id}`)}
                                >
                                    <InformationCircleIcon className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </TdComponent>
                    </TrComponent>
                ))}
            </Table.Body>
        </Table>
    )
}

// --- COMPOSANT PRINCIPAL ---
function School() {
    const [view, setView] = useState('list'); 
    const [schools, setSchools] = useState([]);
    const [currentSchool, setCurrentSchool] = useState(null);
    const [loading, setLoading] = useState(false);
    const showConfirm = useShowConfirm();
    const isAdmin = useHasRole('Admin');

    const fetchSchools = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get('/schools');
            setSchools(data);
        } catch (err) {
            toast.error("Erreur lors de la récupération");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSchools();
    }, []);

    const handleAddClick = () => {
        setCurrentSchool(null); 
        setView('add');
    }

    const handleEditClick = (school) => {
        setCurrentSchool(school);
        setView('edit');
    }

    const handleFormSubmit = async (data) => {
        setLoading(true);
        try {
            if (view === 'edit') {
                await axiosClient.put(`/schools/${currentSchool.id}`, data);
                toast.success("Établissement mis à jour");
            } else {
                await axiosClient.post('/schools', data);
                toast.success("Établissement ajouté");
            }
            setView('list'); // Retourner à la liste après succès
            fetchSchools();
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id) => {
        showConfirm({
            title: "Supprimer",
            message: `Voulez-vous vraiment supprimer cet établissement ?`,
            onSuccess: async () => {
                setLoading(true);
                try {
                    const { data } = await axiosClient.delete(`/schools/${id}`);
                    toast.success(data.message || "Supprimé !");
                    fetchSchools();
                } catch (err) {
                    toast.error("Erreur lors de la suppression");
                } finally {
                    setLoading(false);
                }
            }
        });
    }

    return (
        <main className="min-h-screen bg-slate-50/50">
            <Navbar>
                <Navbar.Left>
                    {view === 'list' ? (
                        isAdmin ? (
                          <AddBtn action={handleAddClick} />
                        ) : null
                    ) : (
                        <button onClick={() => setView('list')} className="btn btn-sm btn-ghost gap-2">
                            ← Retour à la liste
                        </button>
                    )}
                </Navbar.Left>
                <Navbar.Right>
                    <Loading load={loading} />
                    <BtnList action={fetchSchools} />
                </Navbar.Right>
            </Navbar>

            <section className="container mx-auto mt-8 px-4 pb-20">
                {view === 'list' ? (
                    <SchoolData 
                        data={schools} 
                        onEdit={handleEditClick} 
                        onDelete={handleDelete} 
                    />
                ) : (
                    <SchoolForm 
                        key={currentSchool?.id || 'new'} // Astuce : force le remount du formulaire
                        initialData={currentSchool}
                        onSubmit={handleFormSubmit}
                        loading={loading}
                        isEditMode={view === 'edit'}
                    />
                )}
            </section>
        </main>
    )
}

export default School;