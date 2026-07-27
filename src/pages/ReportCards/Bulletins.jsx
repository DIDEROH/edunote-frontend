import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
    School, Users, ArrowRight, FileCheck, Calendar, Layout, User
} from "lucide-react";
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

    const inputClass = "w-full bg-white/50 border-2 border-transparent focus:border-indigo-200 focus:bg-white rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-wider transition-all outline-none mb-4 disabled:opacity-50 disabled:cursor-not-allowed";
    const labelClass = "block text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-3 ml-2 flex items-center gap-2";

    return (
        <main className="min-h-screen bg-slate-50/50">
            <PageHeader
                title="Génération de bulletins"
                subtitle="Ceci est votre espace de bulletins"
            />

            <div className=" rounded-xl p-6 space-y-5 border border-slate-100 my-8">
                
                {/* 1. CHOIX DU SCOPE */}
                <div>
                    <label className={labelClass}>1. Niveau de génération</label>
                    <div className="flex bg-slate-200/50 p-1 rounded-2xl">
                        
                        <button 
                            type="button"
                            onClick={() => setScope('classroom')}
                            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex justify-center items-center gap-2 ${scope === 'classroom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Users size={14}/> Classe
                        </button>
                        <button 
                            type="button"
                            onClick={() => setScope('student')}
                            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex justify-center items-center gap-2 ${scope === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
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
                    className={`w-full py-5 mt-4 rounded-2xl font-black text-[10px] uppercase tracking-[2px] flex items-center justify-center gap-3 transition-all active:scale-95 ${
                        isFormValid
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    Générer les bulletins <ArrowRight size={16} />
                </button>
            </div>
            
            <div className="p-8 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                <Layout className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" size={120} />
                <h4 className="text-[11px] font-black uppercase tracking-widest mb-2">Prêt pour l'impression</h4>
                <p className="text-xs font-medium text-indigo-100 leading-relaxed mb-6">
                    Le système génère un flux paginé ultra-léger et optimisé pour le format physique standard A4. Vous pourrez lancer l'impression globale de chaque classe ou élève en un clic sans risque de saturation réseau ou de crash navigateur.
                </p>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-indigo-500/30 w-fit px-3 py-1.5 rounded-full">
                    <FileCheck size={12} /> Format A4 Standard
                </div>
            </div>
        </main>
    );
}