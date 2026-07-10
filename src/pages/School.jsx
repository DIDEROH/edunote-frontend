import { useEffect, useRef, useState } from "react"
import { useOutletContext, useNavigate } from 'react-router-dom'
import { api } from "../utils/AxiosClient"
import { useForm } from 'react-hook-form';
import { useAuth } from "../context/AuthContext";
import { 
  School as SchoolIcon, QrCode, Quote, MapPin, 
  Home, Phone, Mail, Save, Loader2 
} from 'lucide-react';
import { EditBtn, DeleteBtn, CtaDark, InfoBtn } from '../components/ui/ButtonsComponents' 
import { Table, Tr, TdBody, Th } from '../components/Table'
import InputComponent from "../components/InputComponent"
import { toast } from 'sonner'
import useShowConfirm from "../hooks/UseShowConfirm"
import PageHeader from "../components/elements/PageHeader"
import { Card5 } from "../components/ui/CardsComponents";
import { LuSearchX } from "react-icons/lu";
import { useAnimations } from '../utils/animations'
import { deleteElement } from "../utils/deleteElement";
import LoadingSkeleton from "../components/LoadingSkeletoon";

// --- COMPOSANT : FORMULAIRE (AJOUT & MODIF) ---
const SchoolForm = ({ initialData, onSubmit, loading, isEditMode, onReset }) => {
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

      <div className="mt-10 flex gap-5">
        <CtaDark onAction={() => onReset()}>
            Annuler
        </CtaDark>
        <button 
          type="submit" 
          disabled={loading}
          className={`px-4 w-full py-5 rounded-3xl font-black text-xs tracking-[2px] uppercase transition-all flex items-center justify-center gap-3 shadow-lg 
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
    const { hasRole } = useAuth();
    const isAdmin = hasRole('admin');   
    
    if (data.length === 0) {
        return <Card5 icon={LuSearchX} className="alert alert-warning mt-4">Aucun établissement trouvé</Card5>;
    }

    return (
        <Table>
            <Table.Head>
                <Th>#</Th>
                <Th>logo</Th>
                <Th>Nom</Th>
                <Th>Code</Th>
                <Th>Actions</Th>
            </Table.Head>
            <Table.Body>
                {data.map((s, index) => (
                    <Tr key={s.id}>
                        <TdBody className="font-bold">{index + 1}</TdBody>
                        <TdBody>
                            <img 
                                src={s.logo || '/logo.webp'} 
                                alt="" 
                                className="w-10 h-10 object-cover rounded-lg" 
                                onError={(e) => e.target.src = '/logo.webp'}
                            />
                        </TdBody>
                        <TdBody>{s.name}</TdBody>
                        <TdBody><span className="badge badge-ghost font-mono">{s.code}</span></TdBody>
                        <TdBody>
                            <div className="flex gap-1">
                                <EditBtn onAction={() => onEdit(s)} /> 
                                {isAdmin && <DeleteBtn onAction={() => onDelete(s.id)} />}
                                <InfoBtn onAction={() => navigate(`${s.id}`)} />
                            </div>
                        </TdBody>
                    </Tr>
                ))}
            </Table.Body>
        </Table>
    )
}

// --- COMPOSANT PRINCIPAL ---
function School() {
    const { setNavbarActions } = useOutletContext();
    const [view, setView] = useState('list'); 
    const [schools, setSchools] = useState([]);
    const [currentSchool, setCurrentSchool] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // 👇 Nouveaux états pour la recherche
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const showConfirm = useShowConfirm();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    useAnimations(containerRef)
    
    /**
     * ✅ Gestion du délai (Debounce) pour la recherche
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500); // 500ms d'attente avant de lancer la recherche

        return () => clearTimeout(timer);
    }, [search]);

    /**
     * ✅ Récupération des écoles avec prise en compte du filtre de recherche
     */
    const fetchSchools = async () => {
        setLoading(true);
        try {
            const params = {};
            if (debouncedSearch) {
                params.search = debouncedSearch;
            }

            const { data } = await api.get('/schools', { params });
            // Tolérance selon la structure de ta réponse Laravel (pagination vs simple array)
            setSchools(data.data || data); 
        } catch (err) {
            toast.error("Erreur lors de la récupération");
        } finally {
            setLoading(false);
        }
    }

    /**
     * ✅ Gestionnaire de la saisie de recherche (Passé au PageHeader)
     */
    const handleSearchSchool = (value) => {
        setSearch(value);
    };

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
                await api.put(`/schools/${currentSchool.id}`, data);
                toast.success("Établissement mis à jour");
            } else {
                await api.post('/schools', data);
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
        deleteElement(
            'schools',
            id,
            'cet établissement',
            showConfirm, 
            {
                onStart: () => setLoading(true),  
                onSuccess: () => fetchSchools(), 
                onFinally: () => setLoading(false)       
            }
        )
    }
    
    /**
     * Effet pour configurer la barre de navigation
     */
    useEffect(() => {
        setNavbarActions({
            onAdd: () => handleAddClick(),
            onBack: () => navigate(-1)
        })

        return () => setNavbarActions({})
    }, [setNavbarActions]);

    /**
     * ✅ Effet séparé pour recharger les données lorsque la recherche change
     */
    useEffect(() => {
        fetchSchools();
    }, [debouncedSearch]);


    return (
        <div ref={containerRef}>
            <PageHeader
                title="Gestion des écoles"
                subtitle="Gérez toutes les configurations necessaires au fonctionnement des établissements scolaires"
                onSearch={handleSearchSchool} // 👈 La fonction de recherche est maintenant liée
            />

            <section className="container mx-auto mt-8 px-4 pb-20">
                {loading ?
                  <LoadingSkeleton />
                : view === 'list' ? (
                    <div className="animate-reveal">
                        <SchoolData 
                            data={schools} 
                            onEdit={handleEditClick} 
                            onDelete={handleDelete}
                        />
                    </div>
                ) : (
                    <div className="animate-reveal">
                        <SchoolForm 
                            key={currentSchool?.id || 'new'} // Astuce : force le remount du formulaire
                            initialData={currentSchool}
                            onSubmit={handleFormSubmit}
                            loading={loading}
                            isEditMode={view === 'edit'}
                            onReset={() => setView("list")}
                        />
                    </div>
                )}
            </section>
        </div>
    )
}

export default School;