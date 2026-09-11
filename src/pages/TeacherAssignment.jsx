import { useEffect, useState } from "react";
import { UserCheck, BookOpen, GraduationCap, School, Save, ArrowRight } from "lucide-react";
import axiosClient from "../utils/AxiosClient";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import TitleComponent from "../components/TitleComponent";
import Loading from "../components/Loading";
import BackComponent from "../components/BackComponent";

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

    const inputStyle = "w-full bg-base-100 rounded-md px-4 py-3 text-sm text-base-content outline-none appearance-none cursor-pointer";
    const labelStyle = "block text-xs font-medium text-base-content/60 mb-2";

    return (
        <main className="min-h-screen bg-base-100">
            <Navbar>
                <Navbar.Left>
                    <TitleComponent>Affectation Enseignant</TitleComponent>
                </Navbar.Left>
                <Navbar.Right>
                    <Loading load={loading} />
                    <BackComponent />
                </Navbar.Right>
            </Navbar>

            <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
                <form onSubmit={handleSave} className="bg-base-200 rounded-md overflow-hidden">

                    <div className="p-8 flex items-center gap-5">
                        <div className="p-4 bg-neutral text-neutral-content rounded-md">
                            <UserCheck size={26} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-base-content">Nouvelle Assignation</h2>
                            <p className="text-base-content/50 text-xs">Lier un enseignant à un programme spécifique</p>
                        </div>
                    </div>

                    <div className="p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-5">

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
                                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" size={16} />
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
                    <div className="p-8 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({user_id: "", school_id: "", academic_year_id: "", classroom_id: "", subject_id: ""})}
                            className="px-6 py-3 text-sm font-medium text-base-content/50 hover:text-base-content transition-colors duration-150"
                        >
                            Réinitialiser
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 cursor-pointer bg-primary text-white rounded-md font-medium text-sm transition-colors duration-150 hover:brightness-95 flex items-center gap-3"
                        >
                            <Save size={16} /> Confirmer l'affectation
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default TeacherAssignment;
