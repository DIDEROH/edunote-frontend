import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    School, Users, ArrowRight, FileCheck, Calendar, Layout, User, Loader2, CheckCircle2, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../utils/AxiosClient";
import { useHasRole } from "../../hooks/UseHasRole";
import PageHeader from "../../components/elements/PageHeader";

export default function Bulletins() {
    const navigate = useNavigate();
    
    const isAdmin = useHasRole('admin');
    const isDirector = useHasRole('director');
    const isTeacher = useHasRole('teacher') || (!isAdmin && !isDirector); // Fallback si le rôle de prof n'est pas explicite

    const [schools, setSchools] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [students, setStudents] = useState([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    
    // Par défaut : l'enseignant n'a pas accès au scope 'school'
    const [scope, setScope] = useState('classroom'); 
    
    const [schoolId, setSchoolId] = useState("");
    const [classroomId, setClassroomId] = useState("");
    const [studentId, setStudentId] = useState("");
    
    const [term, setTerm] = useState("");

    // 1. Chargement initial des écoles si Admin, ou chargement direct des classes selon le rôle
    useEffect(() => {
        // L'admin a besoin de charger tous les établissements
        if (isAdmin) {
            api.get("/schools")
                .then(({ data }) => setSchools(data || []))
                .catch(err => console.error("Erreur de chargement des écoles:", err));
        }
        
        // Si directeur ou enseignant, on charge directement les classes associées à leur périmètre
        if (isDirector || isTeacher) {
            const classUrl = isDirector ? "/director-space/classrooms" : "/classrooms";
            api.get(classUrl)
                .then(({ data }) =>{
                     setClassrooms(data || []);
                })
                .catch(err => console.error("Erreur de chargement des classes:", err));
        }
    }, [isAdmin, isDirector, isTeacher]);

    // 2. Pour l'Admin : charger les classes d'un établissement dès qu'il est sélectionné
    useEffect(() => {
        if (isAdmin && schoolId) {
            api.get(`/schools/${schoolId}/classrooms`)
                .then(({ data }) => {
                    setClassrooms(data || []);
                    setClassroomId(""); // Reset de la classe sélectionnée
                    setStudentId(""); // Reset de l'élève
                })
                .catch(err => console.error("Erreur lors du filtrage des classes par établissement:", err));
        }
    }, [schoolId, isAdmin]);

    // 3. Charger les élèves d'une classe lorsque le scope est 'student'
    useEffect(() => {
        if (scope === 'student' && classroomId) {
            setIsLoadingStudents(true);
            api.get(`/classrooms/${classroomId}/students`)
                .then(({ data }) => {
                    setStudents(data || []);
                    setStudentId(""); // Reset
                })
                .catch(err => console.error("Erreur lors du chargement des élèves:", err))
                .finally(() => setIsLoadingStudents(false));
        } else {
            setStudents([]);
            setStudentId("");
        }
    }, [classroomId, scope]);

    const isFormValid = useMemo(() => {
        if (!term) return false;
        
        if (isTeacher) {
            if (scope === 'classroom' && !classroomId) return false;
            if (scope === 'student' && (!classroomId || !studentId)) return false;
        } else if (isDirector) {
            if (scope === 'school') return true; // Le directeur n'a pas besoin de choisir d'école (c'est la sienne par défaut)
            if (scope === 'classroom' && !classroomId) return false;
            if (scope === 'student' && (!classroomId || !studentId)) return false;
        } else if (isAdmin) {
            if (!schoolId) return false;
            if (scope === 'classroom' && !classroomId) return false;
            if (scope === 'student' && (!classroomId || !studentId)) return false;
        }
        return true;
    }, [scope, schoolId, classroomId, studentId, term, isTeacher, isDirector, isAdmin]);

    const handleGenerate = () => {
        if (!isFormValid) return;

        // On construit l'URL de destination avec des paramètres de requête sécurisés (Query Params)
        const queryParams = new URLSearchParams({
            scope,
            school_id: schoolId || '',
            classroom_id: classroomId || '',
            student_id: studentId || '',
            term
        });

        // Redirection vers le visualiseur de bulletins unique
        navigate(`/report-card/visualiser?${queryParams.toString()}`);
    };

    // ------------------------------------------------------------------
    // Génération en arrière-plan (file d'attente) : utile pour préparer
    // d'un coup les bulletins de toute une classe (ex. avant impression
    // en masse en fin de trimestre) sans attendre page par page.
    // ------------------------------------------------------------------
    const canRunBackground = (isAdmin || isDirector) && scope === 'classroom' && !!classroomId && !!term;
    const [batchState, setBatchState] = useState(null); // null | { status, total, processed, failed, progress_percent }
    const pollRef = useRef(null);

    useEffect(() => () => clearInterval(pollRef.current), []);

    const pollBatch = (batchId) => {
        pollRef.current = setInterval(async () => {
            try {
                const { data } = await api.get(`/reports/batches/${batchId}`);
                setBatchState(data);
                if (data.status === 'completed' || data.status === 'failed') {
                    clearInterval(pollRef.current);
                    if (data.status === 'completed') {
                        toast.success(`Bulletins générés : ${data.processed}/${data.total} élève(s) traité(s).`);
                    } else {
                        toast.error("La génération en arrière-plan a échoué.");
                    }
                }
            } catch (error) {
                clearInterval(pollRef.current);
                toast.error("Impossible de suivre la progression de la génération.");
            }
        }, 2000);
    };

    const handleGenerateBackground = async () => {
        if (!canRunBackground) return;
        try {
            const { data } = await api.post("/reports/batches", {
                school_id: schoolId || undefined,
                classroom_id: classroomId,
                term,
            });
            setBatchState({ status: 'pending', total: 0, processed: 0, failed: 0, progress_percent: 0 });
            toast.info("Génération des bulletins lancée en arrière-plan.");
            pollBatch(data.batch_id);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Impossible de démarrer la génération en arrière-plan.");
        }
    };

    const inputClass = "w-full bg-base-100 rounded-md px-4 py-3 text-sm font-medium outline-none mb-4 disabled:opacity-50 disabled:cursor-not-allowed";
    const labelClass = "block text-xs font-medium text-base-content/60 mb-2.5 ml-0.5 flex items-center gap-2";

    return (
        <main className="min-h-screen bg-base-100">
            <PageHeader
                title="Génération de bulletins"
                subtitle="Ceci est votre espace de bulletins"
            />

            <div className="rounded-md bg-base-200 p-6 space-y-5 my-6">

                {/* 1. CHOIX DU SCOPE */}
                <div>
                    <label className={labelClass}>1. Niveau de génération</label>
                    <div className="flex bg-base-100 p-1 rounded-md">

                        <button
                            type="button"
                            onClick={() => setScope('classroom')}
                            className={`flex-1 py-2.5 text-xs font-medium rounded-sm transition-colors duration-150 flex justify-center items-center gap-2 ${scope === 'classroom' ? 'bg-base-200 text-primary' : 'text-base-content/50 hover:text-base-content'}`}
                        >
                            <Users size={14}/> Classe
                        </button>
                        <button
                            type="button"
                            onClick={() => setScope('student')}
                            className={`flex-1 py-2.5 text-xs font-medium rounded-sm transition-colors duration-150 flex justify-center items-center gap-2 ${scope === 'student' ? 'bg-base-200 text-primary' : 'text-base-content/50 hover:text-base-content'}`}
                        >
                            <User size={14}/> Élève
                        </button>
                    </div>
                </div>

                {/* 2. FILTRES CASCADANTS */}
                <div className="space-y-0 relative">
                    {/* Sélecteur d'école : visible uniquement par l'admin central */}
                    {isAdmin && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className={labelClass}>2. Établissement</label>
                            <select 
                                value={schoolId} 
                                onChange={(e) => setSchoolId(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Sélectionner l'établissement...</option>
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Sélecteur de classe : visible pour "Classe" ou "Élève" */}
                    {(scope === 'classroom' || scope === 'student') && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className={labelClass}>
                                {isAdmin ? "3. Salle de classe" : "2. Salle de classe"}
                            </label>
                            <select 
                                value={classroomId} 
                                onChange={(e) => setClassroomId(e.target.value)}
                                className={inputClass}
                                disabled={isAdmin && !schoolId}
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
                                {isAdmin ? "4. Choix de l'élève" : "3. Choix de l'élève"}
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
                        <option value="1">1er Trimestre</option>
                        <option value="2">2ème Trimestre</option>
                        <option value="3">3ème Trimestre</option>
                    </select>
                </div>

                {/* BOUTON DE REDIRECTION ET GENERATION */}
                <button
                    type="button"
                    disabled={!isFormValid}
                    onClick={handleGenerate}
                    className={`w-full py-3.5 mt-4 rounded-md font-medium text-sm flex items-center justify-center gap-3 transition-colors duration-150 ${
                        isFormValid
                        ? 'bg-primary text-white hover:brightness-95'
                        : 'bg-base-300 text-base-content/40 cursor-not-allowed'
                    }`}
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
                            className="w-full py-3 rounded-md font-medium text-xs flex items-center justify-center gap-2 bg-base-100 text-base-content/70 hover:text-base-content transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {batchState && !['completed', 'failed'].includes(batchState.status)
                                ? <Loader2 size={14} className="animate-spin" />
                                : <FileCheck size={14} />}
                            Préparer toute la classe en arrière-plan
                        </button>

                        {batchState && (
                            <div className="mt-3 rounded-md bg-base-100 p-3">
                                <div className="flex items-center justify-between text-xs font-medium mb-2">
                                    <span className="flex items-center gap-1.5 text-base-content/70">
                                        {batchState.status === 'completed' && <CheckCircle2 size={14} className="text-success" />}
                                        {batchState.status === 'failed' && <XCircle size={14} className="text-error" />}
                                        {!['completed', 'failed'].includes(batchState.status) && <Loader2 size={14} className="animate-spin text-primary" />}
                                        {batchState.status === 'pending' && "En attente de traitement..."}
                                        {batchState.status === 'processing' && `Traitement en cours (${batchState.processed}/${batchState.total})`}
                                        {batchState.status === 'completed' && `Terminé : ${batchState.processed}/${batchState.total} élève(s)`}
                                        {batchState.status === 'failed' && "Échec de la génération"}
                                    </span>
                                    <span className="text-base-content/50">{batchState.progress_percent}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-base-300 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${batchState.progress_percent}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-6 bg-primary rounded-md text-primary-content">
                <h4 className="text-sm font-semibold mb-2">Prêt pour l'impression</h4>
                <p className="text-sm opacity-80 leading-relaxed mb-4">
                    Le système génère un flux paginé ultra-léger et optimisé pour le format physique standard A4. Vous pourrez lancer l'impression globale de chaque classe ou élève en un clic sans risque de saturation réseau ou de crash navigateur.
                </p>
                <div className="flex items-center gap-2 text-xs font-medium bg-white/15 w-fit px-3 py-1.5 rounded-sm">
                    <FileCheck size={12} /> Format A4 Standard
                </div>
            </div>
        </main>
    );
}