import { Card5, SchoolCard } from '../components/ui/CardsComponents'
import { api } from '../utils/AxiosClient'
import { useOutletContext, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import LoadingSkeleton from '../components/LoadingSkeletoon'
import { BookOpen, ClipboardCheck, FileQuestion, Info } from 'lucide-react'
import { Panel } from '../components/dashboard/Board'
import PageHeader from '../components/elements/PageHeader'
import SchoolClassroomsPanel from '../components/schools/SchoolClassroomsPanel'
import useNavbarRefresh from '../hooks/useNavbarRefresh'

/**
 * Fiche d'un établissement pour l'équipe EduNote (consultation) : classes,
 * matières et mode d'évaluation sont gérés par le chef d'établissement.
 */
function SchoolInformations() {
    const { setNavbarActions } = useOutletContext();
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [school, setSchool] = useState(null);

    // Récupération de l'école, de ses classes et de SES matières par classe
    useEffect(() => {
        let ignore = false;

        api.get(`/schools/${id}`)
            .then(({ data }) => { if (!ignore) setSchool(data); })
            .catch(() => toast.error("Erreur lors de la récupération des détails de l'établissement"))
            .finally(() => { if (!ignore) setLoading(false); });

        return () => { ignore = true; };
    }, [id]);

    // Actualiser : la fiche reste affichée pendant le rechargement
    useNavbarRefresh(() => api.get(`/schools/${id}`).then(({ data }) => setSchool(data)));

    useEffect(() => {
        setNavbarActions({ onBack: () => navigate(-1) });
        return () => setNavbarActions({});
    }, [setNavbarActions, navigate]);

    // Matières enseignées dans l'établissement (toutes classes confondues)
    const taughtSubjects = [...new Set((school?.classrooms || []).flatMap((c) => (c.subjects || []).map((s) => s.name)))].sort();


    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <PageHeader kicker="Établissement" title={school?.name || "Fiche de l'établissement"} subtitle="Classes, matières et mode d'évaluation, gérés par le chef d'établissement." />
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
                            canManage={false}
                        />

                        {/* MATIÈRES ENSEIGNÉES DANS L'ÉCOLE */}
                        <Panel icon={BookOpen} title="Matières enseignées" subtitle="Toutes classes confondues">
                            {taughtSubjects.length === 0 ? (
                                <p className="rounded-2xl bg-base-100 py-8 text-center text-sm text-base-content/50">Aucune matière n'est encore configurée dans cet établissement.</p>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {taughtSubjects.map((name) => (
                                            <span key={name} className="ui-chip bg-primary/8 text-primary ring-1 ring-primary/15">
                                                <span className="size-1.5 rounded-full bg-primary" />
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-3 rounded-2xl bg-info/8 p-4 ring-1 ring-info/15">
                                        <Info className="mt-0.5 shrink-0 text-info" size={15} />
                                        <p className="text-xs leading-relaxed text-base-content/70">
                                            Chaque établissement définit ses propres matières et coefficients, classe par classe
                                            (bouton « Matières » sur chaque classe). Les autres écoles ne sont pas concernées.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Panel>

                        {/* TYPE D'ÉVALUATION */}
                        {school.evaluation_type && (
                            <Panel icon={ClipboardCheck} title="Type d'évaluation" subtitle="Choisi par le chef d'établissement">
                                <span className="ui-chip bg-primary/8 px-4 py-2 text-sm text-primary ring-1 ring-primary/15">
                                    {school.evaluation_type !== "skill" ? "Par séquences" : "Par compétences"}
                                </span>
                            </Panel>
                        )}
                    </div>
                </div>
            ) : (
                <Card5 icon={FileQuestion}>Informations non disponibles pour cette école</Card5>
            )}
        </div>
    );
}

export default SchoolInformations;
