import { Card5, SchoolCard } from '../components/ui/CardsComponents'
import { api } from '../utils/AxiosClient'
import { useOutletContext, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import LoadingSkeleton from '../components/LoadingSkeletoon'
import { LuClipboardCheck, LuFileQuestion } from 'react-icons/lu'
import { useAuth } from '../context/AuthContext'
import { CtaGradient } from '../components/ui/ButtonsComponents'
import { BookOpen, Info } from 'lucide-react'
import SchoolClassroomsPanel from '../components/schools/SchoolClassroomsPanel'
import useNavbarRefresh from '../hooks/useNavbarRefresh'

function SchoolInformations() {
    const { setNavbarActions } = useOutletContext();
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasRole } = useAuth();

    const [loading, setLoading] = useState(true);
    const [school, setSchool] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    // Seuls l'administrateur et le directeur de l'école ont les droits de configuration
    const canManage = hasRole('admin') || hasRole('director');

    // Récupération de l'école, de ses classes et de SES matières par classe
    useEffect(() => {
        let ignore = false;

        api.get(`/schools/${id}`)
            .then(({ data }) => { if (!ignore) setSchool(data); })
            .catch(() => toast.error("Erreur lors de la récupération des détails de l'établissement"))
            .finally(() => { if (!ignore) setLoading(false); });

        return () => { ignore = true; };
    }, [id, reloadKey]);

    const reload = () => setReloadKey((key) => key + 1);

    // Actualiser : la fiche reste affichée pendant le rechargement
    useNavbarRefresh(() => api.get(`/schools/${id}`).then(({ data }) => setSchool(data)));

    useEffect(() => {
        setNavbarActions({ onBack: () => navigate(-1) });
        return () => setNavbarActions({});
    }, [setNavbarActions, navigate]);

    // Matières enseignées dans l'établissement (toutes classes confondues)
    const taughtSubjects = [...new Set((school?.classrooms || []).flatMap((c) => (c.subjects || []).map((s) => s.name)))].sort();

    const handleToggleEvaluation = async (schoolId) => {
        api.patch(`/schools/${schoolId}/toggle-evaluation`)
        .then(({ data }) => {
            reload();
            toast.success(data?.message)
        })
        .catch(error => toast.error(error.message))
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {loading ? (
                <LoadingSkeleton />
            ) : school ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* COLONNE 1 : FICHE DE L'ÉCOLE */}
                    <div className="lg:col-span-1 space-y-4">
                        <SchoolCard data={school} />
                    </div>

                    {/* COLONNES 2 & 3 : CLASSES, MATIÈRES, ÉVALUATION */}
                    <div className="lg:col-span-2 space-y-6">

                        <SchoolClassroomsPanel
                            schoolId={school.id}
                            classrooms={school.classrooms || []}
                            canManage={canManage}
                            onChanged={reload}
                            configurePath={(classroomId) => `/schools/${school.id}/classrooms/${classroomId}`}
                        />

                        {/* MATIÈRES ENSEIGNÉES DANS L'ÉCOLE */}
                        <div className="bg-base-200 rounded-md p-6">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                                    <BookOpen size={16} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-base-content">Matières enseignées</h2>
                                    <p className="text-xs text-base-content/50">Toutes classes confondues</p>
                                </div>
                            </div>

                            {taughtSubjects.length === 0 ? (
                                <div className="text-center py-8 bg-base-100 rounded-md">
                                    <p className="text-sm text-base-content/50">Aucune matière n'est encore configurée dans cet établissement.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {taughtSubjects.map((name) => (
                                            <span key={name} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-sm flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                {name}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="p-4 bg-primary/10 rounded-md flex gap-3">
                                        <Info className="text-primary shrink-0 mt-0.5" size={15} />
                                        <p className="text-xs text-base-content/70 leading-relaxed">
                                            Chaque établissement définit ses propres matières et coefficients, classe par classe
                                            (bouton « Matières » sur chaque classe). Les autres écoles ne sont pas concernées.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* TYPE D'ÉVALUATION */}
                        {school.evaluation_type && <div className="bg-base-200 rounded-md p-6">
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
                                    <span className='font-medium text-primary text-sm px-4 py-2.5 rounded-md bg-primary/10'>{school.evaluation_type !== "skill" ? "Séquences" : "Compétences"}</span>
                                    <CtaGradient onAction={() => handleToggleEvaluation(school.id)}>
                                        Basculer vers l'évaluation par {school.evaluation_type === "skill" ? "Séquences" : "Compétences"}
                                    </CtaGradient>
                                </div>
                        </div>}
                    </div>
                </div>
            ) : (
                <Card5 icon={LuFileQuestion}>Informations non disponibles pour cette école</Card5>
            )}
        </div>
    );
}

export default SchoolInformations;
