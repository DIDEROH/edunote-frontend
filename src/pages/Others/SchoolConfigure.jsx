import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import BackComponent from "../../components/BackComponent";
import axiosClient from "../../utils/AxiosClient";
import LoadingSkeletoon from "../../components/LoadingSkeletoon";
import TitleAndSubtitleComponent from "../../components/TitleAndSubtitleComponent";
import Loading from "../../components/Loading";
import useShowConfirm from '../../hooks/UseShowConfirm'
import { 
  Building2, QrCode, MapPin, Phone, 
  Users, GraduationCap, BookOpen, Plus,  Check, Layers, X,
  Trash2
} from "lucide-react";
import Table from "../../components/Table";
import AddBtn from "../../components/AddBtn";
import { toast } from 'react-toastify'

// Petit composant pour les statistiques stylisées
const MiniStat = ({ icon, title, value, color }) => (
    <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-1 min-w-[150px]">
        <div className={`p-3 rounded-2xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</p>
            <p className="text-xl font-black text-slate-800">{value}</p>
        </div>
    </div>
);


const MultiClassAssignmentModal = ({ isOpen, onClose, onAdd, classroomsAvailable, loading }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  if (!isOpen) return null;

  // Gestion de la sélection/désélection
  const toggleClass = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    onAdd(selectedIds); // Envoie le tableau d'IDs au parent
    setSelectedIds([]); // Reset
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-2 md:p-4 lg:p-6 xl:p-8 pb-4 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Assigner des classes</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sélection multiple</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Liste des classes avec Scrollbar personnalisée */}
        <div className="px-8 max-h-[400px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-2">
            {classroomsAvailable.map((cls) => {
              const isSelected = selectedIds.includes(cls.id);
              return (
                <div 
                  key={cls.id}
                  onClick={() => toggleClass(cls.id)}
                  className={`group flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? 'border-purple-600 bg-purple-50' 
                      : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-300'}`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isSelected ? 'text-purple-900' : 'text-slate-700'}`}>
                        {cls.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                        Niveau: {cls.level || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {isSelected && <span className="text-[10px] font-black text-purple-600 uppercase">Sélectionné</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="p-2 md:p-4 lg:p-6 xl:p-8 pt-6">
          <button 
            onClick={handleSubmit}
            disabled={loading || selectedIds.length === 0}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[11px] uppercase tracking-[2px] shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "Traitement..." : `Assigner ${selectedIds.length} classe${selectedIds.length > 1 ? 's' : ''}`}
          </button>
          <p className="text-center text-[9px] text-slate-400 mt-4 uppercase font-bold">
            Les classes sélectionnées seront liées à cet établissement
          </p>
        </div>
      </div>
    </div>
  );
};


function SchoolConfigure() {
    const { id } = useParams();
    const showConfirm = useShowConfirm()
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(false);
    const [activeYear, setActiveYear] = useState(null);
    const [activeTab, setActiveTab] = useState('classes'); // Gestion des onglets
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [availableClasses, setAvailableClasses] = useState([]); // Pour le select
    const [btnLoading, setBtnLoading] = useState(false);
    const navigate = useNavigate()
    // ✅ Approche sécurisée
    const [{school, classrooms, subjects}, setValues] = useState({
      school: null,
      classrooms: [],
      subjects: []
    });

    // Dans SchoolConfigure()
    const handleAssignClassrooms = async (ids) => {
        setBtnLoading(true);
        try {
            // Route : /api/schools/{school}/assign-classrooms
            await axiosClient.post(`/schools/${id}/assign`, { 
                classroom_ids: ids,
                status: 'active' 
            });
            
            toast.success("Classes assignées avec succès !");
            fetchData(); // On rafraîchit la liste de l'école
            setIsModalOpen(false);
        } catch (error) {
            toast.error("Erreur lors de l'assignation");
        } finally {
            setBtnLoading(false);
        }
    };

    // Fonction pour changer le statut (Activer/Désactiver)
    const handleToggleStatus = async (classroomId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            // On utilise la route sync ou une route dédiée pour mettre à jour le pivot
            await axiosClient.put(`/schools/${id}/toggle`, {
                classroom_ids: {
                    [classroomId]: { status: newStatus }
                }
            });
            toast.success(`Classe ${newStatus === 'active' ? 'activée' : 'désactivée'}`);
            fetchData(); // Rafraîchir les données
        } catch (error) {
            toast.error("Erreur de modification");
        }
    };

    // Fonction pour retirer la classe de l'école
    const handleRemoveClassroom = (classroomId) => {
        showConfirm({
            title: "Retirer la classe",
            message: "Êtes-vous sûr de vouloir retirer cette classe de l'établissement ?",
            onSuccess: async () => {
                try {
                    await axiosClient.post(`/schools/${id}/remove`, {
                        classroom_ids: [classroomId]
                    });
                    toast.success("Classe retirée");
                    fetchData();
                } catch (error) {
                    toast.error("Erreur lors du retrait");
                }
            }
        });
    };

    // Charger les classes globales (celles pas encore dans l'école par exemple)
    const openAddModal = async () => {
        try {
            const { data } = await axiosClient.get('/classrooms'); // Ta route pour toutes les classes
            setAvailableClasses(data);
            setIsModalOpen(true);
        } catch (e) { toast.error("Impossible de charger les classes"); }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [schoolRes, yearRes, teachRes] = await Promise.all([
                axiosClient.get(`/schools/${id}`),
                axiosClient.get(`/academic-years-active`),
                axiosClient.get(`/teachers/schools/${id}/teachers`)
            ]);
            setValues(schoolRes.data);
            setActiveYear(yearRes.data.data);
            setTeachers(teachRes.data.teachers);
        } catch (error) {
            console.error("Erreur de chargement", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    return (
        <main className="bg-[#f8fafc] min-h-screen pb-20">
            <Navbar>
                <Navbar.Left>
                    <TitleAndSubtitleComponent>
                        <TitleAndSubtitleComponent.Title>{school?.name || "Chargement..."}</TitleAndSubtitleComponent.Title>
                        <TitleAndSubtitleComponent.Subtitle>Configuration de l'établissement</TitleAndSubtitleComponent.Subtitle>
                    </TitleAndSubtitleComponent>
                </Navbar.Left>
                <Navbar.Right>
                    <Loading load={loading} />
                    <BackComponent />
                </Navbar.Right>
            </Navbar>

            {loading ? <div className="p-2 md:p-4 lg:p-6 xl:p-8"><LoadingSkeletoon /></div> : (
                <div className="container mx-auto px-4 mt-8">
                    
                    {/* EN-TÊTE : INFOS ÉCOLE ET STATS */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
                        {/* Carte Identité École */}
                        <div className="bg-indigo-900 rounded-lg p-2 md:p-4 lg:p-6 xl:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200 xl:col-span-2">
                            <Building2 className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 transform -rotate-12" />
                            <div className="relative z-5">
                                <img src={school?.logo || '/logo.webp'} className="w-20 h-20 rounded-2xl bg-white p-2 mb-4 object-contain" alt="logo" />
                                <h2 className="text-xl font-black uppercase tracking-tighter mb-4">{school?.name}</h2>
                                <div className="space-y-2 text-xs opacity-80">
                                    <div className="flex items-center gap-2"><QrCode size={14}/> <span>Code: {school?.code}</span></div>
                                    <div className="flex items-center gap-2"><MapPin size={14}/> <span>{school?.city}, {school?.address}</span></div>
                                    <div className="flex items-center gap-2"><Phone size={14}/> <span>{school?.phone}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Statistiques Grille */}
                        <div className=" flex flex-wrap gap-4 content-start">
                            <MiniStat icon={<Users size={20}/>} title="Élèves" value={school?.total_students || 0} color="bg-blue-100 text-blue-600" />
                            <MiniStat icon={<GraduationCap size={20}/>} title="Profs" value={school?.total_teachers || 0} color="bg-orange-100 text-orange-600" />
                            <MiniStat icon={<Layers size={20}/>} title="Classes" value={classrooms?.length || 0} color="bg-purple-100 text-purple-600" />
                            <MiniStat icon={<BookOpen size={20}/>} title="Matières" value={subjects?.length || 0} color="bg-emerald-100 text-emerald-600" />
                            
                            {/* Année Active Banner */}
                            <div className="w-full bg-white p-4 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 italic">Année académique en cours :</span>
                                <span className="badge badge-neutral font-black">{activeYear?.name || 'Non définie'}</span>
                            </div>
                        </div>
                    </div>

                    {/* NAVIGATION ONGLETS */}
                    <div className="flex gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-lg w-max">
                        {['classes', 'enseignants', 'statistiques'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                                ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* CONTENU DES ONGLETS */}
                    <div className="bg-white rounded-2xl p-2 md:p-4 lg:p-6 xl:p-8 shadow-sm border border-slate-100">
                        
                        {/* SECTION CLASSES */}
                        {activeTab === 'classes' && (
                            <div className="animate-in fade-in duration-500">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-black text-slate-800">Salles de classe</h3>
                                    <AddBtn text="Ajouter une classe" action={openAddModal} />
                                </div>
                                <Table>
                                    <Table.Head>
                                        <th className="pl-6 text-center">Niveau</th>
                                        <th>Nom de la classe</th>
                                        <th>Effectif</th>
                                        <th>Statut</th>
                                        <th className="pr-6 text-right">Actions</th>
                                    </Table.Head>
                                    <Table.Body>
                                        {(classrooms || []).map((cls) => {
                                          const isActive = (cls.status === 'active' || cls.pivot?.status === 'active');
                                          return (
                                            <tr key={cls.id} className="group">
                                                <td className="bg-slate-50 py-4 pl-6 first:rounded-l-2xl border-y border-slate-100 text-center font-black text-indigo-600">
                                                    {cls.level || 'N/A'}
                                                </td>
                                                <td className="bg-white pl-5 py-4 border-y border-slate-100 font-bold Capitalize">{cls.name}</td>
                                                <td className="bg-white py-4 border-y border-slate-100">
                                                    <span className={`badge ${cls.students_count === 0 ? "badge ghost" : "badge-primary"} font-bold text-xs`}>{cls.students_count || 0} élèves</span>
                                                </td>
                                                <td className="bg-white py-4 border-y border-slate-100">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors
                                                        ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                        {isActive ? 'Actif' : 'Inactif'}
                                                    </span>
                                                </td>
                                                <td className="bg-white py-4 pr-6 last:rounded-r-2xl border-y border-slate-100 text-right">
                                                  <div className="flex justify-end gap-2">
                                                    {/* Bouton Activer / Désactiver */}
                                                    <button 
                                                      onClick={() => handleToggleStatus(cls.id, cls.status)}
                                                      className={`p-2 cursor-pointer rounded-xl border transition-all tooltip tooltip-left ${isActive 
                                                        ? 'text-amber-600 border-amber-100 hover:bg-amber-50' 
                                                        : 'text-emerald-600 border-emerald-100 hover:bg-emerald-50'}`}
                                                        data-tip={isActive ? "Désactiver" : "Activer"}
                                                    >
                                                      {isActive ? <X size={16} /> : <Check size={16} />}
                                                    </button>

                                                    {/* Bouton Retirer */}
                                                    <button 
                                                      onClick={() => handleRemoveClassroom(cls.id)}
                                                      className="p-2 cursor-pointer text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-all tooltip tooltip-left"
                                                      data-tip="Supprimer de l'école"
                                                    >
                                                      <Trash2 size={16} />
                                                    </button>
                                                  </div>
                                                </td>
                                            </tr>
                                          )
                                        })}
                                    </Table.Body>
                                </Table>
                            </div>
                        )}

                        {/* SECTION ENSEIGNANTS */}
                        {activeTab === 'enseignants' && (
                            <div className="animate-in fade-in duration-500">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-black text-slate-800">Corps Enseignant</h3>
                                    <AddBtn text="Recruter un enseignant" action={() => {navigate('/edunote/create-personnel')}} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Exemple de carte enseignant style Premium */}
                                    {(teachers || []).map(teacher => (
                                        <div key={teacher.id} className="p-4 rounded-3xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                                                    {teacher.first_name.charAt(0)}{teacher.last_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-xs">{teacher.first_name} {teacher.last_name}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{teacher.phone || 'Polyvalent'}</p>
                                                </div>
                                            </div>

                                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black justify-self-end">
                                                {teacher.assignments.length || 0}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SECTION MATIÈRES */}
                        {activeTab === 'statistiques' && (
                            <div className="animate-in fade-in duration-500">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-black text-slate-800">Statistiques</h3>
                                    {/* <button className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-full border-none px-6">
                                        <Plus size={16} className="mr-2"/> Créer une matière
                                    </button> */}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {(school?.subjects || []).map(sub => (
                                        <div key={sub.id} className="px-5 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-xs font-bold text-slate-700">{sub.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            )}


            {/* Ajoute le composant Modal tout en bas du return principal */}
            
            <MultiClassAssignmentModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAssignClassrooms}
                classroomsAvailable={availableClasses}
                loading={btnLoading}
            />
        </main>
    );
}

export default SchoolConfigure;