import { useState, useEffect } from "react";
import { Lock, Unlock, ShieldAlert, School, Calendar, Layers, RefreshCw, ShieldCheck } from "lucide-react";
import axiosClient from "../../utils/AxiosClient";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import TitleComponent from "../../components/TitleComponent";
import Loading from "../../components/Loading";
import BackComponent from "../../components/BackComponent";
import { useHasRole } from "../../hooks/UseHasRole";

function TermLockConfig() {
    const isAdmin = useHasRole('Admin');
    const isDirector = useHasRole('Director');

    const [schools, setSchools] = useState([]);
    const [academicYears, setAcademicYears] = useState([]); // Utile seulement pour l'Admin
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    
    const [selection, setSelection] = useState({
        school_id: "", 
        academic_year_id: "",
        term_id: ""
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        // Pour le directeur, seul le term_id est requis pour déclencher le check
        const canCheck = selection.term_id && (isAdmin ? (selection.school_id && selection.academic_year_id) : true);
        if (canCheck) {
            checkStatus();
        }
    }, [selection, isAdmin]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const endpoints = [axiosClient.get("/terms")];
            
            // L'admin a besoin de choisir l'école et l'année manuellement
            if (isAdmin) {
                endpoints.push(axiosClient.get("/academic-years"));
                endpoints.push(axiosClient.get("/schools"));
            }

            const [tRes, yRes, sRes] = await Promise.all(endpoints);
            
            setTerms(tRes.data.data || tRes.data);
            if (isAdmin) {
                setAcademicYears(yRes.data.data || yRes.data);
                setSchools(sRes.data || []);
            }
        } catch (error) {
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = async () => {
        setLoading(true);
        try {
            const url = isDirector ? "/director-space/terms-status" : "/term-status";
            const { data } = await axiosClient.get(url, { params: selection });
            
            if (Array.isArray(data)) {
                const currentTerm = data.find(t => t.id == selection.term_id);
                setIsLocked(!!currentTerm?.is_locked);
            } else {
                setIsLocked(data.is_locked);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async () => {
        setLoading(true);
        try {
            const url = isDirector ? "/director-space/terms-status/toggle" : "/terms/toggle-lock";
            const { data } = await axiosClient.post(url, { ...selection, is_locked: !isLocked });
            setIsLocked(data.is_locked ?? !isLocked);
            toast.success(data.message);
        } catch (error) {
            toast.error("Erreur serveur");
        } finally {
            setLoading(false);
        }
    };

    const selectStyle = "w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer appearance-none";
    const labelStyle = "block text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-2 ml-2";

    return (
        <main className="min-h-screen bg-[#f8fafc]">
            <Navbar>
                <Navbar.Left><TitleComponent>Contrôle des Périodes</TitleComponent></Navbar.Left>
                <Navbar.Right><Loading load={loading} /><BackComponent /></Navbar.Right>
            </Navbar>

            <div className="max-w-4xl mx-auto p-6 mt-4">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    
                    <div className={`p-10 transition-all duration-500 flex items-center justify-between ${isLocked ? 'bg-rose-50/40' : 'bg-indigo-50/40'}`}>
                        <div className="flex items-center gap-6">
                            <div className={`p-6 rounded-2xl shadow-sm ${isLocked ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'}`}>
                                {isLocked ? <Lock size={32} /> : <Unlock size={32} />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                                    {isLocked ? "Saisies Bloquées" : "Saisies Ouvertes"}
                                </h2>
                                <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest mt-1">
                                    {isDirector ? "Gestion de votre établissement" : "Gestion globale système"}
                                </p>
                            </div>
                        </div>
                        <button onClick={checkStatus} className="p-4 text-slate-400 hover:text-indigo-600 transition-all bg-white rounded-xl shadow-sm">
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>

                    <div className="p-10">
                        {/* Grille dynamique : 1 colonne pour Directeur, 3 pour Admin */}
                        <div className={`grid grid-cols-1 gap-6 mb-10 ${isAdmin ? 'md:grid-cols-3' : 'max-w-md mx-auto'}`}>
                            
                            {isAdmin && (
                                <>
                                    <div>
                                        <label className={labelStyle}><School size={12} className="inline mr-1"/> École</label>
                                        <select className={selectStyle} value={selection.school_id} onChange={(e) => setSelection({...selection, school_id: e.target.value})}>
                                            <option value="">Sélectionner...</option>
                                            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelStyle}><Calendar size={12} className="inline mr-1"/> Année</label>
                                        <select className={selectStyle} value={selection.academic_year_id} onChange={(e) => setSelection({...selection, academic_year_id: e.target.value})}>
                                            <option value="">Sélectionner...</option>
                                            {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className={labelStyle}><Layers size={12} className="inline mr-1"/> Trimestre à configurer</label>
                                <select className={selectStyle} value={selection.term_id} onChange={(e) => setSelection({...selection, term_id: e.target.value})}>
                                    <option value="">Choisir la période...</option>
                                    {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col items-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                            <ShieldAlert size={40} className="text-indigo-200 mb-4" />
                            <button 
                                onClick={handleToggle}
                                disabled={loading || !selection.term_id}
                                className={`px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[2px] shadow-lg transition-all active:scale-95 flex items-center gap-4 ${
                                    isLocked ? 'bg-white text-rose-600 border-2 border-rose-100' : 'bg-slate-900 text-white'
                                } disabled:opacity-20`}
                            >
                                {isLocked ? <><Unlock size={18} /> Ouvrir les saisies</> : <><Lock size={18} /> Verrouiller</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default TermLockConfig;