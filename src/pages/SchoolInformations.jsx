import { Card5, SchoolCard } from '../components/ui/CardsComponents'
import { api } from '../utils/AxiosClient'
import { useOutletContext, useNavigate, useParams } from 'react-router-dom'
import { useAnimations } from '../utils/animations'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import LoadingSkeleton from '../components/LoadingSkeletoon'
import { LuClipboardCheck, LuFileQuestion } from 'react-icons/lu'
import { useAuth } from '../context/AuthContext'
import { CtaDark, CtaGradient } from '../components/ui/ButtonsComponents'
import { 
  X, 
  Search, 
  Info, 
  Layers, 
  BookOpen, 
  CheckSquare, 
  Square, 
  Save, 
  ArrowRight 
} from 'lucide-react'

function SchoolInformations() {
    const { setNavbarActions } = useOutletContext();
    const { id } = useParams();
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    useAnimations(containerRef);

    const [loading, setLoading] = useState(false);
    const [school, setSchool] = useState(null);

    // États pour le système d'association
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classrooms, setClassrooms] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [evaluationType, setEvaluationType] = useState();

    // Seuls l'administrateur et le directeur de l'école ont les droits de configuration
    const canManage = hasRole('admin') || hasRole('director');

    // Récupération des informations de l'école
    const getSchool = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/schools/${id}`);
            setSchool(data);
            setEvaluationType(data?.evaluation_type);
        } catch (err) {
            toast.error("Erreur lors de la récupération des détails de l'établissement");
        } finally {
            setLoading(false);
        }
    };

    // Charger les classes globales pour l'association
    const handleOpenModal = async () => {
        setIsModalOpen(true);
        setModalLoading(true);
        try {
            const { data } = await api.get('/classrooms');
            setClassrooms(data.data || data);
            
            // Pré-sélectionner les classes actuellement liées à cette école
            if (school && school.classrooms) {
                setSelectedClasses(school.classrooms.map(c => c.id));
            } else {
                setSelectedClasses([]);
            }
        } catch (err) {
            toast.error("Impossible de charger la liste globale des classes");
        } finally {
            setModalLoading(false);
        }
    };

    // Sélectionner / désélectionner une classe dans le modal
    const toggleClassSelection = (classId) => {
        setSelectedClasses(prev => 
            prev.includes(classId) 
                ? prev.filter(id => id !== classId) 
                : [...prev, classId]
        );
    };

    // Enregistrer les associations de classes
    const handleSaveAssociations = async () => {
        setSaving(true);
        try {
            // Appel à l'API de synchronisation des classes pour cette école
            await api.post(`/schools/${id}/classrooms`, {
                classroom_ids: selectedClasses
            });
            
            toast.success("La configuration pédagogique de l'école a été mise à jour");
            setIsModalOpen(false);
            
            // Recharger l'école pour mettre à jour la vue principale avec les nouvelles classes/matières
            getSchool();
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur lors de la mise à jour des configurations");
        } finally {
            setSaving(false);
        }
    };

    // Calculer les matières uniques héritées dynamiquement des classes associées
    const getInheritedSubjects = () => {
        if (!school || !school.classrooms) return [];
        const subjectsSet = new Set();
        school.classrooms.forEach(classroom => {
            if (classroom.subjects) {
                classroom.subjects.forEach(sub => {
                    subjectsSet.add(typeof sub === 'object' ? sub.name : sub);
                });
            }
        });
        return Array.from(subjectsSet);
    };

    useEffect(() => {
        getSchool();
    }, [id]);

    // Synchronisation de la barre d'action NavbarActions
    useEffect(() => {
        setNavbarActions({
            onBack: () => navigate(-1),
            // Si l'utilisateur est habilité, on ajoute le bouton "Gérer" dans la NavbarActions
            onAdd: canManage ? () => handleOpenModal() : null
        });
        return () => setNavbarActions({});
    }, [setNavbarActions, school, canManage]);

    const inheritedSubjects = getInheritedSubjects();
    const filteredClassrooms = classrooms.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.short_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleEvaluation = async (schoolId) => {
        api.patch(`/schools/${schoolId}/toggle-evaluation`)
        .then(({ data }) => {
            getSchool();
            toast.success(data?.message)
        })
        .catch(error => toast.error(error.message))
    };

    return (
        <div ref={containerRef} className="max-w7xl mx-auto space-y-8">
            
            {/* VUE PRINCIPALE : CHARGEMENT OU CONTENU */}
            <div className='animate-reveal'>
                {loading ? (
                    <LoadingSkeleton />
                ) : school ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* COLONNE 1 : FICHE DE L'ÉCOLE */}
                        <div className="lg:col-span-1 space-y-6">
                            <SchoolCard data={school} />
                            
                            {/* BOUTON DE CONFIGURATION DIRECTE (Doublé pour une meilleure UX) */}
                            {canManage && (
                                <button
                                    onClick={handleOpenModal}
                                    className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <Layers size={18} />
                                    Configurer les classes actives
                                </button>
                            )}
                        </div>

                        {/* COLONNE 2 & 3 : DÉTAILS CLASSES & MATIÈRES */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* SECTION DES CLASSES DE CETTE ÉCOLE */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <Layers size={18} />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-slate-800">Salles de classes configurées</h2>
                                            <p className="text-[11px] text-slate-400 font-medium">Parcours pédagogique disponible dans cet établissement</p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                                        {school.classrooms?.length || 0} active(s)
                                    </span>
                                </div>

                                {!school.classrooms || school.classrooms.length === 0 ? (
                                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs text-slate-400 font-bold">Aucune salle de classe n'est associée à cet établissement.</p>
                                        {canManage && (
                                            <button 
                                                onClick={handleOpenModal} 
                                                className="mt-3 text-xs text-indigo-600 font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
                                            >
                                                Associer des classes <ArrowRight size={12} />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {school.classrooms.map((classroom) => (
                                            <div key={classroom.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm font-bold text-slate-800">{classroom.name}</span>
                                                    <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                                                        Pseudo: {classroom.short_name || 'N/A'} • Niveau: {classroom.level_index}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-2 py-1 rounded">
                                                    Actif
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* SECTION DES MATIÈRES HÉRITÉES */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-50">
                                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <BookOpen size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800">Matières & Disciplines dispensées</h2>
                                        <p className="text-[11px] text-slate-400 font-medium">Héritées automatiquement des classes associées</p>
                                    </div>
                                </div>

                                {inheritedSubjects.length === 0 ? (
                                    <div className="text-center py-8 bg-slate-50/50 rounded-xl">
                                        <p className="text-xs text-slate-400 font-bold">Aucune matière n'est actuellement dispensée dans cette école.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex flex-wrap gap-2">
                                            {inheritedSubjects.map((sub, index) => (
                                                <span 
                                                    key={index}
                                                    className="px-3.5 py-2 bg-indigo-50/50 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-100/20 flex items-center gap-2"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex gap-3">
                                            <Info className="text-amber-600 shrink-0 mt-0.5" size={16} />
                                            <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                                                <strong>Note système :</strong> Les matières dépendent directement de l'organisation de vos classes globales. Pour ajouter de nouvelles matières d'enseignement, veuillez lier ou modifier les classes associées à cet établissement.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SECTION DES MATIÈRES HÉRITÉES */}
                            {evaluationType && <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                    <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-50">
                                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <LuClipboardCheck size={18} />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-slate-800">Type d'&eacute;valuation</h2>
                                            <p className="text-[11px] text-slate-400 font-medium">Ne peut &ecirc;tre modifi&eacute;e au cours de l'ann&eacute;e scolaire</p>
                                        </div>
                                    </div>

                                    <div className='flex gap-4 flex-wrap'>
                                        <span className='font-bold text-indigo-600 uppercase p-4 rounded-3xl border '>{evaluationType !== "skill" ? "Séquences" : "Compétences"}</span>
                                        <CtaGradient onAction={() => handleToggleEvaluation(school?.id)}>
                                            Basculer vers l'&eacute;valuation par {school?.evaluation_type === "skill" ? "Séquences" : "Compétences"}
                                        </CtaGradient>
                                    </div>

                            </div>}

                        </div>
                    </div>
                ) : (
                    <Card5 icon={LuFileQuestion}>Informations non disponibles pour cette école</Card5>
                )}
            </div>

            {/* ========================================================================= */}
            {/* SYSTEM MODAL : ASSOCIER DES CLASSES GLOBALES */}
            {/* ========================================================================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">
                        
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Layers size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Configurer les classes</h3>
                                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Liaison des structures et disciplines d'enseignement</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Note */}
                        <div className="bg-indigo-50/60 p-4 border-b border-indigo-100/30 flex gap-3 text-xs text-indigo-950">
                            <Info className="text-indigo-600 shrink-0 mt-0.5" size={16} />
                            <p className="leading-relaxed">
                                Cochez les classes existantes que vous souhaitez activer pour cet établissement. <strong>Leurs matières associées seront instantanément héritées</strong> par l'école.
                            </p>
                        </div>

                        {/* Recherche */}
                        <div className="px-6 py-4 border-b border-slate-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Rechercher une classe par nom..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {/* Liste des classes */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3">
                            {modalLoading ? (
                                <LoadingSkeleton />
                            ) : filteredClassrooms.map(classroom => {
                                const isSelected = selectedClasses.includes(classroom.id);
                                return (
                                    <div 
                                        key={classroom.id}
                                        onClick={() => toggleClassSelection(classroom.id)}
                                        className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                                            isSelected 
                                                ? "bg-indigo-50/30 border-indigo-200" 
                                                : "bg-white border-slate-150 hover:bg-slate-50/50"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {isSelected ? (
                                                <div className="text-indigo-600">
                                                    <CheckSquare size={20} className="fill-indigo-50" />
                                                </div>
                                            ) : (
                                                <div className="text-slate-300">
                                                    <Square size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-sm font-bold text-slate-800">{classroom.name}</span>
                                                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">
                                                    Cycle: {classroom.cycle} • Niveau: {classroom.level_index}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredClassrooms.length === 0 && !modalLoading && (
                                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                                    Aucune classe ne correspond à vos critères de recherche.
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50">
                            <CtaDark onAction={() => setIsModalOpen(false)} icon={X}>
                                Annuler
                            </CtaDark>
                            <button
                                type="button"
                                onClick={handleSaveAssociations}
                                disabled={saving}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md shadow-indigo-100 transition-colors flex items-center gap-2 active:scale-95"
                            >
                                <Save size={14} />
                                {saving ? "Enregistrement..." : "Appliquer la configuration"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default SchoolInformations;