import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useForm } from "react-hook-form";
import { BookOpen, Edit3, Trash2, Save, X, QrCode, Type } from "lucide-react";
import { api } from "../utils/AxiosClient";
import { toast } from "sonner";
import LoadingSkeletoon from "../components/LoadingSkeletoon";
import useShowConfirm from "../hooks/UseShowConfirm";
import PageHeader from "../components/elements/PageHeader";
import { Card5 } from "../components/ui/CardsComponents";
import { EditBtn, DeleteBtn, CtaDark, CtaNeon } from "../components/ui/ButtonsComponents";
import { Table, Th, Tr, TdBody } from "../components/Table";
import InputComponent from "../components/InputComponent";

// --- COMPOSANT : FORMULAIRE DÉDIÉ AVEC REACT-HOOK-FORM ---
const SubjectForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialData || {}
  });

  useEffect(() => {
    reset(initialData || {});
  }, [initialData, reset]);

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="mx-auto max-w-2xl bg-white p-6 md:p-8 rounded-sm shadow-sm border border-slate-100"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-3 rounded-2xl ${initialData ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {initialData ? "Modifier la matière" : "Créer une nouvelle matière"}
          </h2>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-0.5">
            Détails de la discipline académique
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <InputComponent
            nom="Nom de la matière"
            name="name"
            register={register}
            errors={errors}
            req={true}
            type="text"
            placeholder="ex: Mathématiques, Histoire, Physique-Chimie..."
            icone={<Type size={18} />}
          />
        </div>

        <div className="md:col-span-2">
          <InputComponent
            nom="Code"
            name="code"
            register={register}
            errors={errors}
            req={true}
            type="text"
            placeholder="ex: MATH-01, HIST-GEO"
            icone={<QrCode size={18} />}
          />
        </div>
      </div>

      <div className="mt-10 flex gap-4">
        <CtaDark onAction={onCancel} icon={X}>
           Annuler
        </CtaDark>
        <CtaNeon
          type="submit"
          className={`
            ${initialData 
              ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          disabled={loading}
          icon={Save}>
          {loading ? "Enregistrement..." : "Enregistrer la matière"}
        </CtaNeon>
      </div>
    </form>
  );
};

// --- COMPOSANT PRINCIPAL ---
function Subjects() {
  const [view, setView] = useState('list'); // 'list', 'add', 'edit'
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  
  // Gestion de la recherche
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { setNavbarActions } = useOutletContext();
  const showConfirm = useShowConfirm();

  // Gestion du Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Charger les matières
  const fetchSubjects = async () => {
    setLoading(true);
    const params = debouncedSearch ? { search: debouncedSearch } : {};
    api.get('/subjects', { params })
      .then(({ data }) => {
        setSubjects(Array.isArray(data) ? data : (data.data || []));
      })
      .catch((error) => toast.error(error.message || "Impossible de charger les matières"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubjects();
  }, [debouncedSearch]);

  const handleAddSubjectClick = () => {
    setCurrentSubject(null);
    setView('add');
  };

  const handleEditSubjectClick = (subject) => {
    setCurrentSubject(subject);
    setView('edit');
  };

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      if (view === 'edit') {
        await api.put(`/subjects/${currentSubject.id}`, data);
        toast.success("Matière mise à jour avec succès");
      } else {
        await api.post('/subjects', data);
        toast.success("Matière créée avec succès");
      }
      setView('list');
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Une erreur est survenue lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une matière
  const handleDelete = async (id) => {
    showConfirm({
      title: "Supprimer une matière",
      message: "Voulez-vous vraiment supprimer cette matière ?",
      onSuccess: () => {
        setLoading(true);
        api.delete(`/subjects/${id}`)
          .then(() => {
            toast.success("Matière supprimée");
            fetchSubjects();
          })
          .catch((error) => {
            toast.error(error.response?.data?.message || "Erreur lors de la suppression");
          })
          .finally(() => setLoading(false));
      }
    });
  };

  useEffect(() => {
    setNavbarActions({
      onAdd: () => handleAddSubjectClick()
    });
    return () => setNavbarActions({});
  }, [setNavbarActions]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <PageHeader
        title="Gestion des matières"
        subtitle="Bienvenue dans votre espace d'administration des matières scolaires."
        onSearch={setSearch}
      />

      <section className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        {view !== 'list' ? (
          <div className="animate-reveal">
            <SubjectForm
              initialData={currentSubject}
              onSubmit={handleFormSubmit}
              onCancel={() => setView('list')}
              loading={loading}
            />
          </div>
        ) : loading && subjects.length === 0 ? (
          <LoadingSkeletoon />
        ) : subjects.length === 0 ? (
          <div className="animate-reveal">
            <Card5 icon={BookOpen}>
              Aucune matière enregistrée pour le moment.
            </Card5>
          </div>
        ) : (
          <div className="animate-reveal bg-white rounded-md shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <Table>
              <Table.Head>
                <Th>Code</Th>
                <Th>Intitulé de la matière</Th>
                <Th>Actions</Th>
              </Table.Head>
              <Table.Body>
                {subjects.map((subject) => (
                  <Tr key={subject.id}>
                    <TdBody className="font-bold text-slate-700 uppercase tracking-tighter">
                      {subject.code}
                    </TdBody>
                    <TdBody className="text-sm font-bold text-slate-600">
                      {subject.name}
                    </TdBody>
                    <TdBody>
                      <div className="flex gap-1 justify-center">
                        <EditBtn onAction={() => handleEditSubjectClick(subject)} />
                        <DeleteBtn onAction={() => handleDelete(subject.id)} />
                      </div>
                    </TdBody>
                  </Tr>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Subjects;