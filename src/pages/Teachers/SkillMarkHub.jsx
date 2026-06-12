import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, School, Target, ChevronRight, PenTool, LayoutGrid, Layers, Loader2 } from "lucide-react";
import axiosClient from "../../utils/AxiosClient";
import Navbar from "../../components/Navbar";
import TitleComponent from "../../components/TitleComponent";

export default function SkillMarkHub() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [scope, setScope] = useState({ teacher_name: "", schools: [], terms: [] });
    const [skills, setSkills] = useState([]);
    
    const [form, setForm] = useState({ 
        school_id: "", 
        term_id: "", 
        classroom_id: "", 
        subject_id: "", 
        skill_id: "" 
    });

    // 1. Charger le périmètre de l'enseignant (écoles, classes, matières, périodes)
    useEffect(() => {
        axiosClient.get("/my-scope")
            .then(({ data }) => {
                if (data.success) {
                    setScope(data.data);
                }
            })
            .catch(err => console.error("Erreur Scope:", err))
            .finally(() => setLoading(false));
    }, []);

    // 2. Filtrer les classes/matières disponibles selon l'école choisie
    const availableAssignments = useMemo(() => {
        const selectedSchool = scope.schools.find(s => s.school_id == form.school_id);
        return selectedSchool ? selectedSchool.assignments : [];
    }, [form.school_id, scope.schools]);

    // 3. Charger les compétences quand Matière ET Classe sont sélectionnées
    useEffect(() => {
        if (form.subject_id && form.classroom_id) {
            axiosClient.get(`/skills`, { 
                params: { 
                    subject_id: form.subject_id, 
                    classroom_id: form.classroom_id // Le contrôleur skill utilisera la classe pour déduire le niveau
                } 
            }).then(({data}) => {
                setSkills(data);
            });
        } else {
            setSkills([]);
        }
    }, [form.subject_id, form.classroom_id]);

    const isReady = form.school_id && form.term_id && form.skill_id && form.classroom_id;

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-50/50">
            <Navbar>
                <Navbar.Left><TitleComponent>Espace Évaluation</TitleComponent></Navbar.Left>
            </Navbar>

            <div className="max-w-6xl mx-auto md:p-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    
                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
                            <header className="mb-12">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                                        <PenTool size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Session de Notation</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            Enseignant : <span className="text-indigo-600">{scope.teacher_name}</span>
                                        </p>
                                    </div>
                                </div>
                            </header>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                {/* Sélection ÉCOLE */}
                                <SelectGroup 
                                    label="Établissement" 
                                    icon={School} 
                                    value={form.school_id} 
                                    onChange={v => setForm({ ...form, school_id: v, classroom_id: "", subject_id: "", skill_id: "" })} 
                                    options={scope.schools.map(s => ({ id: s.school_id, name: s.school_name }))} 
                                />
                                
                                {/* Sélection PÉRIODE */}
                                <SelectGroup 
                                    label="Période" 
                                    icon={Target} 
                                    value={form.term_id} 
                                    onChange={v => setForm({ ...form, term_id: v })} 
                                    options={scope.terms} 
                                />
                                
                                {/* Sélection CLASSE / MATIÈRE (Combiné selon getMyScope) */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-4 flex items-center gap-2">
                                        <Layers size={14} /> Classe & Matière
                                    </label>
                                    <select 
                                        disabled={!form.school_id}
                                        value={`${form.classroom_id}-${form.subject_id}`}
                                        onChange={(e) => {
                                            const [classId, subId] = e.target.value.split('-');
                                            setForm({ ...form, classroom_id: classId, subject_id: subId, skill_id: "" });
                                        }}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-4 text-[11px] font-black uppercase appearance-none transition-all outline-none disabled:opacity-30"
                                    >
                                        <option value="-">Choisir une affectation...</option>
                                        {availableAssignments.map((as, idx) => (
                                            <option key={idx} value={`${as.classroom_id}-${as.subject_id}`}>
                                                {as.classroom_name} — {as.subject_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sélection COMPÉTENCE */}
                                <SelectGroup 
                                    label="Compétence visée" 
                                    icon={LayoutGrid} 
                                    value={form.skill_id} 
                                    onChange={v => setForm({ ...form, skill_id: v })} 
                                    options={skills} 
                                    disabled={!form.subject_id || !form.classroom_id} 
                                />
                            </div>

                            <button 
                                onClick={() => navigate(`/edunote/marks/entry?school_id=${form.school_id}&term_id=${form.term_id}&classroom_id=${form.classroom_id}&skill_id=${form.skill_id}&subject_id=${form.subject_id}`)}
                                disabled={!isReady}
                                className={`w-full mt-12 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[4px] transition-all flex items-center justify-center gap-4
                                    ${isReady ? 'bg-slate-900 text-white shadow-2xl hover:bg-indigo-600' : 'bg-slate-100 text-slate-300'}`}
                            >
                                Ouvrir le registre <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-indigo-600 rounded-3xl p-10 text-white shadow-xl">
                            <h3 className="font-black text-xl mb-4 italic">Périmètre Actif</h3>
                            <p className="text-indigo-100 text-[11px] font-bold leading-relaxed uppercase tracking-wider">
                                Année Académique : <span className="text-white underline">{scope.academic_year}</span>
                                <br /><br />
                                Vous ne voyez que les établissements et classes où vous possédez une affectation active pour cette année.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function SelectGroup({ label, icon: Icon, value, onChange, options, disabled }) {
    return (
        <div className={`space-y-3 ${disabled ? 'opacity-30' : ''}`}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-4 flex items-center gap-2">
                <Icon size={14} /> {label}
            </label>
            <select 
                disabled={disabled}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-4 text-[11px] font-black uppercase appearance-none transition-all outline-none"
            >
                <option value="">Sélectionner...</option>
                {options?.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name || opt.school_name}</option>
                ))}
            </select>
        </div>
    );
}