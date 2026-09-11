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
        <div ref={containerRef} className="max-w-7xl mx-auto space-y-6">

            {/* VUE PRINCIPALE : CHARGEMENT OU CONTENU */}
            <div>
                {loading ? (
                    <LoadingSkeleton />
                ) : school ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* COLONNE 1 : FICHE DE L'ÉCOLE */}
                        <div className="lg:col-span-1 space-y-4">
                            <SchoolCard data={school} />

                            {/* BOUTON DE CONFIGURATION DIRECTE (Doublé pour une meilleure UX) */}
                            {canManage && (
                                <button
                                    onClick={handleOpenModal}
                                    className="w-full py-3.5 px-6 bg-primary text-white font-medium text-sm rounded-md transition-colors duration-150 hover:brightness-95 flex items-center justify-center gap-3"
                                >
                                    <Layers size={18} />
                                    Configurer les classes actives
                                </button>
                            )}
                        </div>

                        {/* COLONNE 2 & 3 : DÉTAILS CLASSES & MATIÈRES */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* SECTION DES CLASSES DE CETTE ÉCOLE */}
                            <div className="bg-base-200 rounded-md p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                                            <Layers size={16} />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-base-content">Salles de classes configurées</h2>
                                            <p className="text-xs text-base-content/50">Parcours pédagogique disponible dans cet établissement</p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 bg-base-300 text-base-content/70 text-xs font-medium rounded-sm">
                                        {school.classrooms?.length || 0} active(s)
                                    </span>
                                </div>

                                {!school.classrooms || school.classrooms.length === 0 ? (
                                    <div className="text-center py-10 bg-base-100 rounded-md">
                                        <p className="text-sm text-base-content/50">Aucune salle de classe n'est associée à cet établissement.</p>
                                        {canManage && (
                                            <button
                                                onClick={handleOpenModal}
                                                className="mt-3 text-sm text-primary font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
                                            >
                                                Associer des classes <ArrowRight size={12} />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {school.classrooms.map((classroom) => (
                                            <div key={classroom.id} className="p-4 bg-base-100 rounded-md flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm font-medium text-base-content">{classroom.name}</span>
                                                    <span className="block text-xs text-base-content/50 mt-0.5">
                                                        Pseudo: {classroom.short_name || 'N/A'} • Niveau: {classroom.level_index}
                                                    </span>
                                                </div>
                                                <span className="text-xs bg-success/10 text-success font-medium px-2 py-1 rounded-sm">
                                                    Actif
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* SECTION DES MATIÈRES HÉRITÉES */}
                            <div className="bg-base-200 rounded-md p-6">
                                <div className="flex items-center gap-2.5 mb-5">
                                    <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                                        <BookOpen size={16} />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-base-content">Matières & Disciplines dispensées</h2>
                                        <p className="text-xs text-base-content/50">Héritées automatiquement des classes associées</p>
                                    </div>
                                </div>

                                {inheritedSubjects.length === 0 ? (
                                    <div className="text-center py-8 bg-base-100 rounded-md">
                                        <p className="text-sm text-base-content/50">Aucune matière n'est actuellement dispensée dans cette école.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            {inheritedSubjects.map((sub, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-sm flex items-center gap-2"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="p-4 bg-warning/10 rounded-md flex gap-3">
                                            <Info className="text-warning shrink-0 mt-0.5" size={15} />
                                            <p className="text-xs text-base-content/70 leading-relaxed">
                                                <strong>Note système :</strong> Les matières dépendent directement de l'organisation de vos classes globales. Pour ajouter de nouvelles matières d'enseignement, veuillez lier ou modifier les classes associées à cet établissement.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SECTION TYPE D'ÉVALUATION */}
                            {evaluationType && <div className="bg-base-200 rounded-md p-6">
                                    <div className="flex items-center gap-2.5 mb-5">
                                        <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                                            <LuClipboardCheck size={16} />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold text-base-content">Type d'évaluation</h2>
                                            <p className="text-xs text-base-content/50">Ne peut être modifiée au cours de l'année scolaire</p>
                                        </div>
                                    </div>

                                    <div className='flex gap-4 flex-wrap items-center'>
                                        <span className='font-medium text-primary text-sm px-4 py-2.5 rounded-md bg-primary/10'>{evaluationType !== "skill" ? "Séquences" : "Compétences"}</span>
                                        <CtaGradient onAction={() => handleToggleEvaluation(school?.id)}>
                                            Basculer vers l'évaluation par {school?.evaluation_type === "skill" ? "Séquences" : "Compétences"}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/40">
                    <div className="bg-base-200 w-full h-full sm:h-auto sm:max-w-xl sm:rounded-md overflow-hidden flex flex-col sm:max-h-[85vh]">

                        {/* Header */}
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 text-primary rounded-md">
                                    <Layers size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-base-content">Configurer les classes</h3>
                                    <p className="text-xs text-base-content/50">Liaison des structures et disciplines d'enseignement</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 hover:bg-base-300 text-base-content/50 hover:text-base-content rounded-md transition-colors duration-150"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Note */}
                        <div className="bg-primary/10 p-4 flex gap-3 text-sm text-base-content/70">
                            <Info className="text-primary shrink-0 mt-0.5" size={16} />
                            <p className="leading-relaxed">
                                Cochez les classes existantes que vous souhaitez activer pour cet établissement. <strong>Leurs matières associées seront instantanément héritées</strong> par l'école.
                            </p>
                        </div>

                        {/* Recherche */}
                        <div className="px-6 py-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
                                <input
                                    type="text"
                                    placeholder="Rechercher une classe par nom..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-base-100 text-sm rounded-md outline-none"
                                />
                            </div>
                        </div>

                        {/* Liste des classes */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
                            {modalLoading ? (
                                <LoadingSkeleton />
                            ) : filteredClassrooms.map(classroom => {
                                const isSelected = selectedClasses.includes(classroom.id);
                                return (
                                    <div
                                        key={classroom.id}
                                        onClick={() => toggleClassSelection(classroom.id)}
                                        className={`p-4 rounded-md cursor-pointer flex items-center justify-between transition-colors duration-150 ${
                                            isSelected ? "bg-primary/10" : "bg-base-100 hover:bg-base-300"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {isSelected ? (
                                                <div className="text-primary">
                                                    <CheckSquare size={20} />
                                                </div>
                                            ) : (
                                                <div className="text-base-content/30">
                                                    <Square size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-sm font-medium text-base-content">{classroom.name}</span>
                                                <span className="block text-xs text-base-content/50 mt-0.5">
                                                    Cycle: {classroom.cycle} • Niveau: {classroom.level_index}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredClassrooms.length === 0 && !modalLoading && (
                                <div className="text-center py-6 text-base-content/50 text-sm">
                                    Aucune classe ne correspond à vos critères de recherche.
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 flex items-center justify-between gap-4">
                            <CtaDark onAction={() => setIsModalOpen(false)} icon={X}>
                                Annuler
                            </CtaDark>
                            <button
                                type="button"
                                onClick={handleSaveAssociations}
                                disabled={saving}
                                className="px-5 py-2.5 bg-primary disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors duration-150 hover:brightness-95 flex items-center gap-2"
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