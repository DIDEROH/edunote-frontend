import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Plus, Save, Trash2, GripVertical, Award, Star } from "lucide-react";
import axiosClient from "../utils/AxiosClient";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import TitleComponent from "../components/TitleComponent";
import Loading from "../components/Loading";

function SkillsConfig() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // État du formulaire
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("");
    const [classrooms, setClassrooms] = useState([])
    const [skills, setSkills] = useState([
        { name: "", max_mark: 10, position: 1 } // Une ligne par défaut
    ]);

    useEffect(() => {
        axiosClient.get("/subjects").then(({ data }) => setSubjects(data.data));
        axiosClient.get("/classrooms").then(({ data }) => setClassrooms(data));
       
        if (selectedSubject && selectedLevel) {
            setLoading(true);
            axiosClient.get(`/skills?subject_id=${selectedSubject}&classroom_id=${selectedLevel}`)
                .then(({ data }) => {
                    if (data.length > 0) {
                        setSkills(data); // Remplit le formulaire avec l'existant
                    } else {
                        setSkills([{ name: "", max_mark: 20, position: 1 }]); // Vide si rien en base
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [selectedSubject, selectedLevel]);

    const addSkillRow = () => {
        setSkills([...skills, { 
            name: "", 
            max_mark: 20, 
            position: skills.length + 1 
        }]);
    };

    const removeSkillRow = (index) => {
        const newSkills = skills.filter((_, i) => i !== index);
        // Réorganiser les positions
        const reordered = newSkills.map((s, i) => ({ ...s, position: i + 1 }));
        setSkills(reordered);
    };

    const updateSkill = (index, field, value) => {
        const newSkills = [...skills];
        newSkills[index][field] = value;
        setSkills(newSkills);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.post("/skills/bulk", {
                subject_id: selectedSubject,
                level: selectedLevel,
                skills: skills
            });
            
            toast.success("Synchronisé !");
            
            // IMPORTANT : On met à jour l'état avec les données du serveur (qui contiennent les IDs)
            setSkills(data.data); 
            
        } catch (error) {
            toast.error("Erreur");
            console.error(error)
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50/50">
            <Navbar>
                <Navbar.Left>
                    <TitleComponent>Référentiel de Compétences</TitleComponent>
                </Navbar.Left>
                <Navbar.Center>
                    <div className="flex gap-4">
                        {/* Sélecteur Matière */}
                        <select 
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="bg-white border-none rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Choisir Matière</option>
                            {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>

                        {/* Sélecteur Niveau */}
                        <select 
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="bg-white border-none rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Choisir une classe</option>
                            {
                                classrooms?.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))
                            }
                        </select>
                    </div>
                </Navbar.Center>
                <Navbar.Right>
                    <Loading load={loading} />
                    <button 
                        onClick={handleSave}
                        className="btn btn-circle bg-slate-900 text-white font-black hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                    >
                        <Save size={16} />
                    </button>
                </Navbar.Right>
            </Navbar>

            <div className="max-w-5xl mx-auto p-2 md:p-4 lg:p-6 xl:p-8">
                <div className="bg-white rounded-lg border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    
                    {/* Header Info */}
                    <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-5 bg-amber-500 text-white rounded-3xl shadow-lg shadow-amber-100">
                                <Award size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Définition des Compétences</h2>
                                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[2px]">Matière : {subjects?.find(s => s.id == selectedSubject)?.name || '---'}</p>
                            </div>
                        </div>
                        <button 
                            onClick={addSkillRow}
                            className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
                        >
                            <Plus size={18} /> Ajouter une compétence
                        </button>
                    </div>

                    {/* Table des compétences */}
                    <div className="p-2 md:p-4 lg:p-6 xl:p-8">
                        <div className="space-y-4">
                            {skills.map((skill, index) => (
                                <div key={index} className="group flex items-center gap-4 p-4 bg-slate-50 rounded-sm border-2 border-transparent hover:border-indigo-100 hover:bg-white transition-all animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="text-slate-300" size={20} />
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100">
                                            {index + 1}
                                        </div>
                                    </div>

                                    <div className="flex-1 grid grid-cols-12 gap-4">
                                        {/* Nom de la compétence */}
                                        <div className="col-span-8">
                                            <input 
                                                type="text"
                                                placeholder="Intitulé de la compétence (ex: Calculer des fractions)"
                                                value={skill.name}
                                                onChange={(e) => updateSkill(index, 'name', e.target.value)}
                                                className="w-full bg-transparent border-none outline-none p-0 font-semibold text-slate-700 placeholder:text-slate-300 focus:ring-0 text-sm"
                                            />
                                        </div>

                                        {/* Note Maximale */}
                                        <div className="col-span-4 flex items-center gap-3 justify-end">
                                            <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                                <Star size={14} className="text-amber-400 mr-2" />
                                                <input 
                                                    type="number"
                                                    value={skill.max_mark}
                                                    onChange={(e) => updateSkill(index, 'max_mark', e.target.value)}
                                                    className="w-8 bg-transparent border-none outline-none p-0 text-center font-black text-slate-700 focus:ring-0 text-xs"
                                                />
                                                <span className="text-[10px] font-black text-slate-300 ml-1">PTS</span>
                                            </div>
                                            
                                            <button 
                                                onClick={() => removeSkillRow(index)}
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {skills.length === 0 && (
                            <div className="py-20 text-center">
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cliquez sur le bouton pour ajouter votre première compétence</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default SkillsConfig;