import { useEffect, useState, useMemo } from "react";
import { 
    TrendingUp, Award, School, Layers, Search, Activity,
    FilterX, ArrowDownCircle, ArrowUpCircle, Users2, 
    UserCheck2, UserX2
} from "lucide-react";
import axiosClient from "../utils/AxiosClient";
import Navbar from "../components/Navbar";
import TitleComponent from "../components/TitleComponent";
import LoadingSkeletoon from "../components/LoadingSkeletoon";
import BackComponent from "../components/BackComponent";

function SuccessRates() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [years, setYears] = useState([]);
    const [terms, setTerms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedSchool, setExpandedSchool] = useState(null);
    const [filters, setFilters] = useState({ year_id: "", term_id: "", school_id: "" });

    useEffect(() => { fetchInitialData(); }, []);

    const fetchInitialData = async () => {
        try {
            const [yRes, tRes] = await Promise.all([
                axiosClient.get("/academic-years"),
                axiosClient.get("/terms")
            ]);
            setYears(yRes.data.data || []);
            setTerms(tRes.data.data || []);
        } catch (error) { console.error("Erreur filtres", error); }
    };

    const fetchPerformance = async () => {
        if (!filters.year_id || !filters.term_id) return;
        setLoading(true);
        try {
            const { data } = await axiosClient.get("/stats/performance", { params: filters });
            setStats(data);
        } catch (error) { console.error("Erreur stats", error); }
        finally { setLoading(false); }
    };

    const filteredDetails = useMemo(() => {
        if (!stats?.details) return [];
        return stats.details.filter(s => s.school_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [stats, searchTerm]);

    // Composant interne mis à jour pour G et F
    const GenderRow = ({ label, m, f }) => (
        <div className="flex items-center justify-between text-[10px] border-b border-slate-50 py-1.5 last:border-0">
            <span className="font-black text-slate-400 uppercase tracking-tighter">{label}</span>
            <div className="flex gap-4">
                <span className="font-bold text-slate-700">G: <b className="text-indigo-600">{m}</b></span>
                <span className="font-bold text-slate-700">F: <b className="text-pink-500">{f}</b></span>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-50/50 pb-20 font-sans">
            <Navbar>
                <Navbar.Left><TitleComponent>Analyse de Réussite</TitleComponent></Navbar.Left>
                <Navbar.Right>
                    <div className="flex items-center gap-3">
                        <select className="bg-white border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase shadow-sm cursor-pointer" 
                            value={filters.year_id} onChange={(e) => setFilters({...filters, year_id: e.target.value})}>
                            <option value="">Année...</option>
                            {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                        </select>
                        <select className="bg-white border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase shadow-sm cursor-pointer"
                            value={filters.term_id} onChange={(e) => setFilters({...filters, term_id: e.target.value})}>
                            <option value="">Trimestre...</option>
                            {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button onClick={fetchPerformance} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
                            <Search size={18} strokeWidth={3} />
                        </button>
                    </div>
                    <BackComponent />
                </Navbar.Right>
            </Navbar>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {loading ? <LoadingSkeletoon /> : !stats ? (
                    <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                        <TrendingUp size={48} className="mx-auto text-slate-200 mb-4" />
                        <h3 className="text-slate-800 font-black uppercase tracking-[2px] text-sm">Prêt pour l'analyse</h3>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        
                        {/* RÉSUMÉ GLOBAL AVEC DÉTAILS GENRE */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                            <div className="lg:col-span-2 bg-slate-900 rounded-[35px] p-10 text-white relative overflow-hidden shadow-2xl">
                                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[4px] mb-4">Moyenne de Réussite</p>
                                <h2 className="text-8xl font-black mb-6">{stats.summary.rates.success}%</h2>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white/5 p-3 rounded-xl"><p className="text-[8px] uppercase opacity-50">Total</p><p className="font-black text-lg">{stats.summary.counts.total.all}</p></div>
                                    <div className="bg-white/5 p-3 rounded-xl"><p className="text-[8px] uppercase opacity-50 text-emerald-400">Admis</p><p className="font-black text-lg">{stats.summary.counts.success.all}</p></div>
                                    <div className="bg-white/5 p-3 rounded-xl"><p className="text-[8px] uppercase opacity-50 text-red-400">Échecs</p><p className="font-black text-lg">{stats.summary.counts.failure.all}</p></div>
                                </div>
                            </div>
                            <div className="lg:col-span-2 bg-white rounded-[35px] p-8 border border-slate-100 flex flex-col justify-center shadow-sm">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Répartition Globale G / F</h4>
                                <div className="space-y-1 bg-slate-50/50 p-6 rounded-[25px]">
                                    <GenderRow label="Effectif Total" m={stats.summary.counts.total.m} f={stats.summary.counts.total.f} />
                                    <GenderRow label="Total Admis" m={stats.summary.counts.success.m} f={stats.summary.counts.success.f} />
                                    <GenderRow label="Total Échecs" m={stats.summary.counts.failure.m} f={stats.summary.counts.failure.f} />
                                </div>
                            </div>
                        </div>

                        {/* LISTE DES ÉTABLISSEMENTS */}
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-center px-4 gap-4">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[3px]">Statistiques par Établissement</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Rechercher une école..." className="bg-white border-none rounded-xl pl-10 pr-4 py-2.5 text-[11px] font-bold shadow-sm w-72 focus:ring-2 focus:ring-indigo-500 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            {filteredDetails.map((school, sIdx) => (
                                <div key={sIdx} className="bg-white rounded-[35px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="p-8 cursor-pointer group" onClick={() => setExpandedSchool(expandedSchool === sIdx ? null : sIdx)}>
                                        <div className="flex flex-col xl:flex-row justify-between gap-8">
                                            <div className="flex gap-6 items-center flex-1">
                                                <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    {school.school_name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{school.school_name}</h4>
                                                    <div className="flex gap-4 mt-2">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-md">{school.classrooms.length} Classes</p>
                                                        <p className="text-[10px] font-black text-indigo-500 uppercase bg-indigo-50 px-2 py-1 rounded-md">Taux: {school.rates.success}%</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Détails G/F rapides par École */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:w-2/3 border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-8 border-slate-100">
                                                <div className="bg-slate-50/50 p-3 rounded-2xl">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Inscrits ({school.counts.total.all})</p>
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span>G: <b className="text-indigo-600">{school.counts.total.m}</b></span>
                                                        <span>F: <b className="text-pink-500">{school.counts.total.f}</b></span>
                                                    </div>
                                                </div>
                                                <div className="bg-emerald-50/30 p-3 rounded-2xl">
                                                    <p className="text-[8px] font-black text-emerald-500 uppercase mb-2">Admis ({school.counts.success.all})</p>
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span>G: <b className="text-indigo-600">{school.counts.success.m}</b></span>
                                                        <span>F: <b className="text-pink-500">{school.counts.success.f}</b></span>
                                                    </div>
                                                </div>
                                                <div className="bg-red-50/30 p-3 rounded-2xl">
                                                    <p className="text-[8px] font-black text-red-400 uppercase mb-2">Échecs ({school.counts.failure.all})</p>
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span>G: <b className="text-indigo-600">{school.counts.failure.m}</b></span>
                                                        <span>F: <b className="text-pink-500">{school.counts.failure.f}</b></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DÉTAIL DES CLASSES */}
                                    {expandedSchool === sIdx && (
                                        <div className="px-8 pb-8 pt-4 bg-slate-50/40 border-t border-slate-100 animate-in slide-in-from-top-4 duration-500">
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                {school.classrooms.map((cls, cIdx) => (
                                                    <div key={cIdx} className="bg-white p-6 rounded-[28px] border border-slate-200/60 shadow-sm hover:border-indigo-200 transition-colors">
                                                        <div className="flex justify-between items-center mb-6">
                                                            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><Layers size={18} /></div>
                                                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black">{cls.rates.success}% Succès</div>
                                                        </div>
                                                        <h5 className="text-[11px] font-black text-slate-800 uppercase mb-4 truncate border-b pb-2 border-slate-50">{cls.classroom_name}</h5>
                                                        
                                                        <div className="space-y-1 bg-slate-50/80 p-4 rounded-2xl mb-4">
                                                            <GenderRow label="Inscrits" m={cls.counts.total.m} f={cls.counts.total.f} />
                                                            <GenderRow label="Admis" m={cls.counts.success.m} f={cls.counts.success.f} />
                                                            <GenderRow label="Échecs" m={cls.counts.failure.m} f={cls.counts.failure.f} />
                                                        </div>

                                                        <div className="flex justify-between items-center pt-2 px-1">
                                                            <div className="flex gap-3">
                                                                <div className="text-center">
                                                                    <p className="text-[7px] font-black text-slate-400 uppercase">Min</p>
                                                                    <p className="text-[10px] font-bold text-slate-700">{cls.performance.min}</p>
                                                                </div>
                                                                <div className="text-center border-l border-slate-100 pl-3">
                                                                    <p className="text-[7px] font-black text-slate-400 uppercase">Max</p>
                                                                    <p className="text-[10px] font-bold text-indigo-600">{cls.performance.max}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[7px] font-black text-slate-400 uppercase">Moyenne</p>
                                                                <p className="text-xs font-black text-slate-900">{cls.performance.avg}/20</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default SuccessRates;