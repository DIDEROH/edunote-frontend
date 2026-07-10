import { useEffect, useState } from "react";
import { UserCheck, School, Save, Shield, Info } from "lucide-react";
import axiosClient from "../../utils/AxiosClient";
import { toast } from "sonner";
import Navbar from "../../components/Navbar";
import TitleComponent from "../../components/TitleComponent";
import Loading from "../../components/Loading";
import BackComponent from "../../components/BackComponent";

function DirectorAssignment() {
    const [directors, setDirectors] = useState([]);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // On retire academic_year_id du state initial
    const [formData, setFormData] = useState({
        user_id: "",
        school_id: ""
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // On ne fetch plus les années académiques ici
            const [dRes, sRes] = await Promise.all([
                axiosClient.get("/directors/list"),
                axiosClient.get("/schools")
            ]);
            setDirectors(dRes.data.data || dRes.data);
            setSchools(sRes.data || []);
        } catch (error) {
            toast.error("Erreur de chargement des données");
            console.error(error)
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // L'API Laravel s'occupe d'injecter l'année active
            await axiosClient.post("/directors/assignments", formData);
            toast.success("Directeur assigné avec succès sur l'année active !");
            
            // Reset du formulaire
            setFormData({ user_id: "", school_id: "" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de l'assignation");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer";
    const labelStyle = "block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2";

    return (
        <main className="min-h-screen bg-slate-50/50">
            <Navbar>
                <Navbar.Left><TitleComponent>Assignation Direction</TitleComponent></Navbar.Left>
                <Navbar.Right><Loading load={loading} /><BackComponent /></Navbar.Right>
            </Navbar>

            <div className="max-w-4xl mx-auto p-4 lg:p-12">
                <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    
                    {/* Header thème Indigo/Blanc */}
                    <div className="p-10 border-b border-slate-50 flex items-center gap-6 bg-indigo-600 text-white">
                        <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight uppercase">Gestion des Pouvoirs</h2>
                            <p className="text-indigo-100 font-bold text-[10px] uppercase tracking-[2px]">Affectation automatique sur l'année active</p>
                        </div>
                    </div>

                    <div className="p-10 space-y-8">
                        
                        {/* Information Bulle - Pour prévenir que l'année est auto-gérée */}
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4 text-blue-700">
                            <Info size={20} className="shrink-0" />
                            <p className="text-[11px] font-bold italic">Note : L'assignation sera enregistrée pour l'année académique définie comme "Active" dans les paramètres.</p>
                        </div>

                        {/* Choix du Directeur */}
                        <div>
                            <label className={labelStyle}>Directeur à assigner</label>
                            <div className="relative">
                                <select 
                                    required 
                                    value={formData.user_id} 
                                    className={inputStyle}
                                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                                >
                                    <option value="">Sélectionner un administrateur...</option>
                                    {directors.map(d => (
                                        <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Choix de l'Ecole */}
                        <div>
                            <label className={labelStyle}><School size={12} className="inline mr-1"/> Établissement de destination</label>
                            <select 
                                required 
                                value={formData.school_id} 
                                className={inputStyle}
                                onChange={(e) => setFormData({...formData, school_id: e.target.value})}
                            >
                                <option value="">Choisir l'école...</option>
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 bg-slate-50 flex justify-end gap-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-10 py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            <Save size={18} /> Confirmer l'assignation
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default DirectorAssignment;