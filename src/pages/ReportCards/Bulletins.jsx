import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    School, Users, ArrowRight, ChevronRight, 
    FileCheck, Calendar, Layout, ShieldCheck
} from "lucide-react";
import axiosClient from "../../utils/AxiosClient";
import Navbar from "../../components/Navbar";
import TitleComponent from "../../components/TitleComponent";
import { useHasRole } from "../../hooks/UseHasRole";

function Bulletins() {
    const navigate = useNavigate();
    const isAdmin = useHasRole('Admin');
    const isDirector = useHasRole('Director');

    const [schools, setSchools] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    
    // États pour les sélections
    const [selectedClass, setSelectedClass] = useState("");
    const [schoolForClass, setSchoolForClass] = useState("");

    useEffect(() => {
        // L'admin a besoin de la liste des écoles, le directeur non
        if (isAdmin) {
            axiosClient.get("/schools").then(({data}) => setSchools(data || []));
        }
        
        // On charge les classes
        // Note : Si tu as une route /director-space/classrooms, utilise-la pour le directeur
        const classUrl = isDirector ? "/director-space/classrooms" : "/classrooms";
        axiosClient.get(classUrl).then(({data}) => setClassrooms(data || []));
    }, [isAdmin, isDirector]);

    const handleGenerate = () => {
        if (isDirector) {
            // Route simplifiée pour le directeur : le backend gère le school_id et l'année active
            navigate(`/edunote/bulletins/classe/${selectedClass}`);
        } else {
            // Route complète pour l'admin
            navigate(`/edunote/bulletins/ecole/${schoolForClass}/classe/${selectedClass}`);
        }
    };

    const inputClass = "w-full bg-white/50 border-2 border-transparent focus:border-indigo-200 focus:bg-white rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-wider transition-all outline-none mb-4";

    return (
        <main className="min-h-screen bg-slate-50/50">
            <Navbar>
                <Navbar.Left>
                    <div className="flex flex-col">
                        <TitleComponent>Centre d'Impression</TitleComponent>
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                            <ShieldCheck size={10}/> {isDirector ? "Espace Direction" : "Administration"}
                        </span>
                    </div>
                </Navbar.Left>
                <Navbar.Right>
                    <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase text-slate-400">Serveur d'impression actif</span>
                    </div>
                </Navbar.Right>
            </Navbar>

            <div className="max-w-6xl mx-auto p-4 pt-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    
                    {/* OPTION : PAR CLASSE */}
                    <div className="group bg-white rounded-[2rem] p-10 shadow-2xl shadow-slate-200/60 border border-slate-100 transition-all duration-500">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="h-16 w-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                <Users size={28} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Bulletins par Classe</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {isDirector ? "Génération pour votre établissement" : "Sélection par établissement"}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-[1.5rem] p-8">
                            {/* Étape 1 : Choisir l'école (UNIQUEMENT SI ADMIN) */}
                            {isAdmin && (
                                <>
                                    <label className="block text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-3 ml-2">1. Choisir l'établissement</label>
                                    <select 
                                        value={schoolForClass}
                                        onChange={(e) => setSchoolForClass(e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">Sélectionner une école...</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </>
                            )}

                            {/* Étape 2 : Choisir la classe */}
                            <label className="block text-[9px] font-black text-indigo-400 uppercase tracking-[2px] mb-3 ml-2">
                                {isAdmin ? "2. Sélectionner la classe" : "1. Sélectionner la classe"}
                            </label>
                            <select 
                                disabled={isAdmin && !schoolForClass}
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className={`${inputClass} ${(isAdmin && !schoolForClass) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <option value="">Choisir une classe...</option>
                                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>

                            <button 
                                disabled={!selectedClass || (isAdmin && !schoolForClass)}
                                onClick={handleGenerate}
                                className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[2px] flex items-center justify-center gap-3 transition-all active:scale-95 ${
                                    (selectedClass && (isAdmin ? schoolForClass : true)) 
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700' 
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                Générer les bulletins <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Bloc d'informations contextuel */}
                    <div className="space-y-6">
                        <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                                    <Calendar size={20} />
                                </div>
                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Calcul Automatique</h4>
                            </div>
                            <p className="text-xs text-slate-400 font-bold leading-relaxed">
                                Les bulletins sont générés pour l'<b>année académique active</b>. 
                                En tant que {isDirector ? 'directeur' : 'administrateur'}, assurez-vous que toutes les notes 
                                ont été verrouillées pour garantir la cohérence des moyennes.
                            </p>
                        </div>

                        <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                            <Layout className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" size={120} />
                            <h4 className="text-[11px] font-black uppercase tracking-widest mb-2">Prêt pour l'impression</h4>
                            <p className="text-xs font-medium text-indigo-100 leading-relaxed mb-6">
                                Le système génère un flux paginé optimisé pour les imprimantes laser et la génération PDF.
                            </p>
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-indigo-500/30 w-fit px-3 py-1.5 rounded-full">
                                <FileCheck size={12} /> Format A4 Standard
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}

export default Bulletins;