import { useEffect, useState } from "react";
import { 
    TrendingUp, Award, Layers, Search, 
    ArrowRightCircle, Target, Zap, 
    ChevronRight, Info
} from "lucide-react";
import axiosClient from "../../utils/AxiosClient";
import Navbar from "../../components/Navbar";
import TitleComponent from "../../components/TitleComponent";
import LoadingSkeletoon from "../../components/LoadingSkeletoon";
import BackComponent from "../../components/BackComponent";

function DirectorPerformance() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [years, setYears] = useState([]);
    const [terms, setTerms] = useState([]);
    const [filters, setFilters] = useState({ year_id: "", term_id: "" });

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
            const { data } = await axiosClient.get("/director-space/performance-stats", { params: filters });
            setStats(data);
        } catch (error) { console.error("Erreur stats", error); }
        finally { setLoading(false); }
    };

    const GenderRow = ({ label, m, f }) => (
        <div className="flex items-center justify-between text-[10px] border-b border-slate-100 py-2 last:border-0">
            <span className="font-black text-slate-400 uppercase tracking-tighter">{label}</span>
            <div className="flex gap-4">
                <span className="font-bold text-slate-700 underline decoration-indigo-200 decoration-2">H: <b className="text-indigo-600">{m}</b></span>
                <span className="font-bold text-slate-700 underline decoration-pink-200 decoration-2">F: <b className="text-pink-500">{f}</b></span>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-50/50 pb-20">
            <Navbar>
                <Navbar.Left><TitleComponent>Analyse Performance</TitleComponent></Navbar.Left>
                <Navbar.Right>
                    <div className="flex items-center gap-2">
                        <select className="bg-white border-none rounded-xl px-3 py-2 text-[10px] font-black uppercase shadow-sm outline-none" 
                            value={filters.year_id} onChange={(e) => setFilters({...filters, year_id: e.target.value})}>
                            <option value="">Année...</option>
                            {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                        </select>
                        <select className="bg-white border-none rounded-xl px-3 py-2 text-[10px] font-black uppercase shadow-sm outline-none"
                            value={filters.term_id} onChange={(e) => setFilters({...filters, term_id: e.target.value})}>
                            <option value="">Trimestre...</option>
                            {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button onClick={fetchPerformance} className="p-2 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-indigo-600 transition-all group">
                            <Search size={16} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                    <BackComponent />
                </Navbar.Right>
            </Navbar>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {loading ? <LoadingSkeletoon /> : !stats ? (
                    <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-slate-800 font-black uppercase tracking-[2px] text-xs">Sélectionnez une période pour l'analyse</h3>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        
                        {/* HEADER ÉCOLE & RÉSUMÉ */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="lg:col-span-2 bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-indigo-600 p-2 rounded-xl"><Award size={20}/></div>
                                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[4px]">{stats.meta.school_name}</p>
                                    </div>
                                    <h2 className="text-8xl font-black mb-8 tracking-tighter">{stats.summary.rates.success}<span className="text-indigo-500 text-4xl">%</span></h2>
                                    <div className="flex gap-6">
                                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5">
                                            <p className="text-[8px] uppercase opacity-50 mb-1">Taux d'Échec</p>
                                            <p className="font-black text-red-400">{stats.summary.rates.failure}%</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5">
                                            <p className="text-[8px] uppercase opacity-50 mb-1">Effectif Total</p>
                                            <p className="font-black">{stats.summary.counts.total.all}</p>
                                        </div>
                                    </div>
                                </div>
                                <Zap className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64" />
                            </div>

                            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-6">
                                    <Info size={14} className="text-indigo-600"/>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global par Sexe</h4>
                                </div>
                                <div className="space-y-2">
                                    <GenderRow label="Total Inscrits" m={stats.summary.counts.total.m} f={stats.summary.counts.total.f} />
                                    <GenderRow label="Admis" m={stats.summary.counts.success.m} f={stats.summary.counts.success.f} />
                                    <GenderRow label="Échecs" m={stats.summary.counts.failure.m} f={stats.summary.counts.failure.f} />
                                </div>
                            </div>
                        </div>

                        {/* LISTE DES CLASSES */}
                        <div className="flex items-center justify-between mb-8 px-4">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[3px] flex items-center gap-3">
                                <span className="w-8 h-[2px] bg-indigo-600"></span>
                                Performances par Salle
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {stats.details.map((cls, idx) => (
                                <div key={idx} className="bg-white rounded-[35px] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="bg-slate-50 p-3 rounded-2xl text-slate-900 group-hover:bg-indigo-600 transition-colors">
                                            <Layers size={20} />
                                        </div>
                                        <div className={`px-4 py-2 rounded-full text-[10px] font-black shadow-sm ${
                                            cls.rates.success >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                            {cls.rates.success}% Réussite
                                        </div>
                                    </div>

                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6">{cls.classroom_name}</h4>

                                    <div className="bg-slate-50/50 rounded-2xl p-5 mb-6 border border-slate-50">
                                        <GenderRow label="Inscrits" m={cls.counts.total.m} f={cls.counts.total.f} />
                                        <GenderRow label="Admis" m={cls.counts.success.m} f={cls.counts.success.f} />
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 py-4 border-t border-slate-50">
                                        <div className="text-center">
                                            <p className="text-[7px] font-black text-slate-400 uppercase">Min</p>
                                            <p className="text-[11px] font-bold text-red-500">{cls.performance.min}</p>
                                        </div>
                                        <div className="text-center border-x border-slate-100">
                                            <p className="text-[7px] font-black text-slate-400 uppercase">Max</p>
                                            <p className="text-[11px] font-bold text-emerald-500">{cls.performance.max}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[7px] font-black text-slate-400 uppercase">Moy.</p>
                                            <p className="text-[11px] font-black text-indigo-600">{cls.performance.avg}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default DirectorPerformance;