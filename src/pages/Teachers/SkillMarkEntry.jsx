import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Target, Users, Save, Send, SaveAll } from "lucide-react";
import axiosClient from "../../utils/AxiosClient";
import Navbar from "../../components/Navbar";
import { toast } from "react-toastify";

export default function SkillMarkEntry() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [meta, setMeta] = useState({ skill: "", total_students: 0 });
    const [loading, setLoading] = useState(true);
    const [savingAll, setSavingAll] = useState(false);

    const schoolId = searchParams.get("school_id");
    const termId = searchParams.get("term_id");
    const skillId = searchParams.get("skill_id");

    useEffect(() => { 
        if (!schoolId || !termId || !skillId) {
            toast.error("Paramètres manquants");
            navigate("edunote/marks/hub");
            return;
        }
        fetchData(); 
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await axiosClient.get(`/skill-marks`, { 
                params: { school_id: schoolId, term_id: termId, skill_id: skillId } 
            });
            setStudents(data.data);
            setMeta(data.meta);
        } catch (err) { 
            toast.error("Erreur de chargement");
        } finally { setLoading(false); }
    };

    // Met à jour la note dans l'état local sans appeler l'API
    const handleInputChange = (studentId, val) => {
        setStudents(prev => prev.map(s => 
            s.student_id === studentId ? { ...s, mark: val } : s
        ));
    };

    // Enregistrement final de toute la liste
    const handleSaveAll = async () => {
        setSavingAll(true);
        try {
            // Option A : Si ton backend accepte un tableau (Bulk Update) - RECOMMANDÉ
            await axiosClient.post("/skill-marks", {
                skill_id: skillId,
                term_id: termId,
                school_id: schoolId,
                marks: students.map(s => ({ student_id: s.student_id, mark: s.mark }))
            });

            /* 
            // Option B : Si ton backend n'accepte qu'un par un, garde ce code :
            const promises = students.map(s => axiosClient.post("/skill-marks", {
                student_id: s.student_id,
                skill_id: skillId,
                term_id: termId,
                school_id: schoolId,
                mark: s.mark
            }));
            await Promise.all(promises);
            */

            toast.success("Toutes les notes ont été enregistrées avec succès !");
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement");
        } finally {
            setSavingAll(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50/50 pb-20">
            <Navbar>
                <Navbar.Left>
                    <button onClick={() => navigate(-1)} className="p-3 ml-3 bg-white rounded-xl shadow-sm border border-slate-100 hover:text-indigo-600 transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div className=" pr-4">
                        <h1 className="text-xs font-medium text-slate-800 mb-1">{loading ? "Chargement..." : meta.skill}</h1>
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic">Saisie manuelle active</p>
                    </div>
                </Navbar.Left>
            </Navbar>

            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-sm shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50/80">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Apprenant</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Note / 20</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[2026]">
                            {!loading && students.map((item) => (
                                <tr key={item.student_id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-[10px]">
                                                {item.first_name[0]}{item.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-800 uppercase">{item.last_name} {item.first_name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.matricule}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex justify-center">
                                            <input 
                                                type="number" 
                                                step="0.5" min="0" max="20"
                                                value={item.mark || ""} 
                                                onChange={(e) => handleInputChange(item.student_id, e.target.value)}
                                                className="w-15 bg-slate-800 text-white focus:bg-indigo-600 rounded-xl p-3 text-center font-black outline-none transition-all text-sm"
                                                placeholder="--"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="fab">
                <button 
                        onClick={handleSaveAll}
                        disabled={savingAll || loading}
                        className="btn btn-circle btn-success font-bold transition-all disabled:opacity-50  uppercase"
                    >
                        {savingAll ? <Loader2 size={16} className="animate-spin" /> : <SaveAll size={16} />}
                    </button>
            </div>
        </main>
    );
}
