import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users, ArrowRight, FileCheck, User, Loader2, CheckCircle2, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../utils/AxiosClient";
import PageHeader from "../../components/elements/PageHeader";
import { prepareBulletins } from "../../utils/bulletinPreparation";
import useNavbarRefresh from "../../hooks/useNavbarRefresh";

// La sélection est gardée si l'élément figure toujours dans la liste rechargée
const stillListed = (list, id) => !id || (list || []).some((item) => String(item.id) === String(id));

export default function Bulletins() {
    const navigate = useNavigate();
    
    // Directeur ou modérateur (droit « bulletins ») : l'école est déduite côté serveur
    const [classrooms, setClassrooms] = useState([]);
    const [students, setStudents] = useState([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    
    // Par défaut : l'enseignant n'a pas accès au scope 'school'
    const [scope, setScope] = useState('classroom'); 
    
    const [classroomId, setClassroomId] = useState("");
    const [studentId, setStudentId] = useState("");
    
    const [term, setTerm] = useState("");
    // Trimestres de l'année en cours de l'établissement (calendrier propre à l'école)
    const [terms, setTerms] = useState([]);

    // 1. Classes et trimestres de l'établissement
    useEffect(() => {
        let ignore = false;
        api.get("/classrooms")
            .then(({ data }) => { if (!ignore) setClassrooms(data || []); })
            .catch(err => toast.error(err.message));
        api.get("/terms")
            .then(({ data }) => { if (!ignore) setTerms(data || []); })
            .catch(err => toast.error(err.message));
        return () => { ignore = true; };
    }, []);

    // 3. Charger les élèves d'une classe lorsque le scope est 'student'
    useEffect(() => {
        if (scope === 'student' && classroomId) {
            setIsLoadingStudents(true);
            api.get(`/classrooms/${classroomId}/students`)
                .then(({ data }) => {
                    setStudents(data || []);
                    setStudentId(""); // Reset
                })
                .catch(err => toast.error(err.message))
                .finally(() => setIsLoadingStudents(false));
        } else {
            setStudents([]);
            setStudentId("");
        }
    }, [classroomId, scope]);

    // Actualiser : classes, trimestres et élèves, sans perdre la sélection en cours
    useNavbarRefresh(() => {
        const applyClassrooms = ({ data }) => {
            setClassrooms(data || []);
            if (!stillListed(data, classroomId)) setClassroomId("");
        };

        return Promise.all([
            api.get("/classrooms").then(applyClassrooms),
            api.get("/terms").then(({ data }) => setTerms(data || [])),
            scope === 'student' && classroomId && api
                .get(`/classrooms/${classroomId}/students`)
                .then(({ data }) => {
                    setStudents(data || []);
                    if (!stillListed(data, studentId)) setStudentId("");
                }),
        ]);
    });

    const isFormValid = useMemo(() => {
        if (!term) return false;
        if (!classroomId) return false;
        if (scope === 'student' && !studentId) return false;
        return true;
    }, [scope, classroomId, studentId, term]);

    const handleGenerate = () => {
        if (!isFormValid) return;

        // On construit l'URL de destination avec des paramètres de requête sécurisés (Query Params)
        const queryParams = new URLSearchParams({
            scope,
            classroom_id: classroomId || '',
            student_id: studentId || '',
            term
        });

        // Redirection vers le visualiseur de bulletins unique
        navigate(`/report-card/visualiser?${queryParams.toString()}`);
    };

    // ------------------------------------------------------------------
    // Préparation anticipée : le serveur calcule les bulletins de toute la
    // classe un par un et les garde en cache (ex. avant l'impression en
    // masse de fin de trimestre) ; l'affichage est ensuite immédiat.
    // ------------------------------------------------------------------
    const canRunBackground = scope === 'classroom' && !!classroomId && !!term;
    const [batchState, setBatchState] = useState(null); // null | { status, busy, total, processed, failed, progress_percent }
    const preparationRef = useRef(null);

    // Arrêt du suivi si l'on quitte la page (le calcul reprendra à la prochaine demande)
    useEffect(() => () => preparationRef.current?.abort(), []);

    const handleGenerateBackground = async () => {
        if (!canRunBackground) return;

        preparationRef.current?.abort();
        const controller = new AbortController();
        preparationRef.current = controller;
        setBatchState({ status: 'pending', busy: false, total: 0, processed: 0, failed: 0, progress_percent: 0 });

        try {
            const batch = await prepareBulletins(
                { classroom_id: classroomId, term },
                { onProgress: setBatchState, signal: controller.signal }
            );
            if (batch.status === 'completed') {
                toast.success(`Bulletins prêts : ${batch.processed}/${batch.total} élève(s).`);
            } else {
                toast.error("La préparation des bulletins a échoué.");
            }
        } catch (error) {
            if (controller.signal.aborted) return;
            setBatchState(null);
            toast.error(error?.message || "Impossible de préparer les bulletins.");
        }
    };

    const inputClass = "ui-field mb-4 font-medium";
    const labelClass = "ui-label flex items-center gap-2";

    return (
        <main className="">
            <PageHeader
                title="Génération de bulletins"
                subtitle="Ceci est votre espace de bulletins"
            />

            <div className="surface p-6 space-y-5 my-6">

                {/* 1. CHOIX DU SCOPE */}
                <div>
                    <label className={labelClass}>1. Niveau de génération</label>
                    <div className="flex rounded-full bg-base-100 p-1 ring-1 ring-base-300/60">

                        <button
                            type="button"
                            onClick={() => setScope('classroom')}
                            className={`flex-1 py-2.5 text-xs font-medium rounded-full transition-all duration-200 flex justify-center items-center gap-2 ${scope === 'classroom' ? 'bg-white text-primary shadow-sm ring-1 ring-base-300' : 'text-base-content/50 hover:text-base-content'}`}
                        >
                            <Users size={14}/> Classe
                        </button>
                        <button
                            type="button"
                            onClick={() => setScope('student')}
                            className={`flex-1 py-2.5 text-xs font-medium rounded-full transition-all duration-200 flex justify-center items-center gap-2 ${scope === 'student' ? 'bg-white text-primary shadow-sm ring-1 ring-base-300' : 'text-base-content/50 hover:text-base-content'}`}
                        >
                            <User size={14}/> Élève
                        </button>
                    </div>
                </div>

                {/* 2. FILTRES CASCADANTS */}
                <div className="space-y-0 relative">
                    {/* Sélecteur de classe : visible pour "Classe" ou "Élève" */}
                    {(scope === 'classroom' || scope === 'student') && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className={labelClass}>
                                2. Salle de classe
                            </label>
                            <select 
                                value={classroomId} 
                                onChange={(e) => setClassroomId(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Choisir la classe...</option>
                                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Sélecteur d'élève : visible uniquement si le scope est "Élève" */}
                    {scope === 'student' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className={labelClass}>
                                3. Choix de l'élève
                            </label>
                            <select 
                                value={studentId} 
                                onChange={(e) => setStudentId(e.target.value)}
                                className={inputClass}
                                disabled={!classroomId || isLoadingStudents}
                            >
                                <option value="">
                                    {isLoadingStudents ? "Chargement des élèves..." : "Sélectionner l'élève..."}
                                </option>
                                {students.map((s, index) => <option key={s.id} value={s.id}>{index+1}. {s.first_name} {s.last_name}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                {/* 3. PÉRIODE (Trimestre & Année) */}
                <div>
                    <label className={labelClass}>Période</label>
                    <select className={inputClass} value={term} onChange={(e) => setTerm(e.target.value)}>
                        <option value="">Choisir...</option>
                        {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                {/* BOUTON DE REDIRECTION ET GENERATION */}
                <button
                    type="button"
                    disabled={!isFormValid}
                    onClick={handleGenerate}
                    className="ui-btn ui-btn-primary ui-btn-lg mt-2 ml-auto flex w-fit"
                >
                    Générer les bulletins <ArrowRight size={16} />
                </button>

                {/* GÉNÉRATION EN ARRIÈRE-PLAN (toute la classe d'un coup) */}
                {canRunBackground && (
                    <div className="mt-3">
                        <button
                            type="button"
                            disabled={batchState && !['completed', 'failed'].includes(batchState.status)}
                            onClick={handleGenerateBackground}
                            className="ui-btn ui-btn-soft ui-btn-sm"
                        >
                            {batchState && !['completed', 'failed'].includes(batchState.status)
                                ? <Loader2 size={14} className="animate-spin" />
                                : <FileCheck size={14} />}
                            Préparer les bulletins de toute la classe à l'avance
                        </button>

                        {batchState && (
                            <div className="mt-3 rounded-xl bg-base-100 p-3 ring-1 ring-base-300/60">
                                <div className="flex items-center justify-between text-xs font-medium mb-2">
                                    <span className="flex items-center gap-1.5 text-base-content/70">
                                        {batchState.status === 'completed' && <CheckCircle2 size={14} className="text-success" />}
                                        {batchState.status === 'failed' && <XCircle size={14} className="text-error" />}
                                        {!['completed', 'failed'].includes(batchState.status) && <Loader2 size={14} className="animate-spin text-primary" />}
                                        {batchState.busy && !['completed', 'failed'].includes(batchState.status) && "Serveur occupé par une autre génération, en attente de votre tour..."}
                                        {!batchState.busy && batchState.status === 'pending' && "Démarrage..."}
                                        {!batchState.busy && batchState.status === 'processing' && `Préparation en cours (${batchState.processed}/${batchState.total})`}
                                        {batchState.status === 'completed' && `Terminé : ${batchState.processed}/${batchState.total} élève(s)`}
                                        {batchState.status === 'failed' && "Échec de la génération"}
                                    </span>
                                    <span className="text-base-content/50">{batchState.progress_percent}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-base-300 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-linear-to-r from-primary to-glow-cyan transition-all duration-300"
                                        style={{ width: `${batchState.progress_percent}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-6 rounded-2xl bg-linear-to-br from-primary to-violet-600 text-white shadow-lg shadow-primary/30">
                <h4 className="text-sm font-semibold mb-2">Prêt pour l'impression</h4>
                <p className="text-sm opacity-80 leading-relaxed mb-4">
                    Le système génère un flux paginé ultra-léger et optimisé pour le format physique standard A4. Vous pourrez lancer l'impression globale de chaque classe ou élève en un clic sans risque de saturation réseau ou de crash navigateur.
                </p>
                <div className="ui-chip bg-white/15 text-white">
                    <FileCheck size={12} /> Format A4 Standard
                </div>
            </div>
        </main>
    );
}