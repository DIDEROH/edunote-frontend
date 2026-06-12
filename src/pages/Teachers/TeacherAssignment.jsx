import { useEffect, useState } from "react";
import { UserCheck, BookOpen, GraduationCap, School, Calendar, Save, Trash2, ArrowRight } from "lucide-react";
import axiosClient from "../../utils/AxiosClient";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import TitleComponent from "../../components/TitleComponent";
import Loading from "../../components/Loading";
import BackComponent from "../../components/BackComponent";

function TeacherAssignment() {
    const [teachers, setTeachers] = useState([]);
    const [schools, setSchools] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        user_id: "",
        school_id: "",
        classroom_id: "",
        subject_id: ""
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [tRes, sRes, cRes, subRes] = await Promise.all([
                axiosClient.get("/teachers/list"),
                axiosClient.get("/schools"),
                axiosClient.get("/classrooms"),
                axiosClient.get("/subjects")
            ]);
            setTeachers(tRes.data.data);
            setSchools(sRes.data || []);
            setClassrooms(cRes.data || []);
            setSubjects(subRes.data.data || []);
        } catch (error) {
            toast.error("Erreur de chargement des données");
        } finally {
            setLoading(false);
        }
    };

   const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosClient.post("/teachers/assignments", formData);
            toast.success("Enseignant affecté avec succès !");

            // On garde l'enseignant et l'école, on vide la classe et la matière
            setFormData(prev => ({
                ...prev,
                classroom_id: "",
                subject_id: ""
            }));
            
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de l'affectation");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer";
    const labelStyle = "block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2";

    return (
        <main className="min-h-screen bg-slate-50/50">
            <Navbar>
                <Navbar.Left>
                    <TitleComponent>Affectation Enseignant</TitleComponent>
                </Navbar.Left>
                <Navbar.Center></Navbar.Center>
                <Navbar.Right>
                    <Loading load={loading} />
                    <BackComponent />
                </Navbar.Right>
            </Navbar>

            <div className="max-w-5xl mx-auto p-2 md:p-4 lg:p-6 xl:p-8">
                <form onSubmit={handleSave} className="bg-white rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    
                    <div className="p-10 border-b border-slate-50 flex items-center gap-6 bg-slate-50/30">
                        <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-lg">
                            <UserCheck size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Nouvelle Assignation</h2>
                            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[2px]">Lier un enseignant à un programme spécifique</p>
                        </div>
                    </div>

                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-2 md:p-4 lg:p-6 xl:p-8">
                        
                        {/* Enseignant */}
                        <div>
                            <label className={labelStyle}>Sélectionner l'Enseignant</label>
                            <div className="relative">
                                <select 
                                    required
                                    value={formData.user_id}
                                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                                    className={inputStyle}
                                >
                                    <option value="">Choisir un enseignant...</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                                    ))}
                                </select>
                                <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {/* Ecole */}
                        <div>
                            <label className={labelStyle}><School size={12} className="inline mr-1"/> École</label>
                            <select 
                                required
                                value={formData.school_id}
                                onChange={(e) => setFormData({...formData, school_id: e.target.value})}
                                className={inputStyle}
                            >
                                <option value="">Choisir l'école...</option>
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        {/* Classe */}
                        <div>
                            <label className={labelStyle}><GraduationCap size={12} className="inline mr-1"/> Classe</label>
                            <select 
                                required
                                value={formData.classroom_id}
                                onChange={(e) => setFormData({...formData, classroom_id: e.target.value})}
                                className={inputStyle}
                            >
                                <option value="">Choisir la classe...</option>
                                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        {/* Matière */}
                        <div>
                            <label className={labelStyle}><BookOpen size={12} className="inline mr-1"/> Matière enseignée</label>
                            <select 
                                required
                                value={formData.subject_id}
                                onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                                className={inputStyle}
                            >
                                <option value="">Choisir la matière...</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-10 bg-slate-50/50 border-t border-slate-50 flex justify-end gap-4">
                        <button 
                            type="button"
                            onClick={() => setFormData({user_id: "", school_id: "", academic_year_id: "", classroom_id: "", subject_id: ""})}
                            className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                        >
                            Réinitialiser
                        </button>
                        <button 
                            type="submit"
                            className="px-10 py-4 cursor-pointer bg-indigo-600 text-white rounded-sm font-black text-[10px] uppercase tracking-[2px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3"
                        >
                            <Save size={18} /> Confirmer l'affectation
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default TeacherAssignment;