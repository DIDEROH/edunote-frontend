import { useEffect, useState, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
    TrendingUp, Layers, Search,
} from "lucide-react";
import axiosClient from "../utils/AxiosClient";
import LoadingSkeletoon from "../components/LoadingSkeletoon";
import { Card5 } from "../components/ui/CardsComponents";

function SuccessRates() {
    const { setNavbarActions } = useOutletContext();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [years, setYears] = useState([]);
    const [terms, setTerms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedSchool, setExpandedSchool] = useState(null);
    const [filters, setFilters] = useState({ year_id: "", term_id: "", school_id: "" });



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

    useEffect(() => {
        fetchInitialData();

        setNavbarActions({
            onBack: () => navigate(-1),
            onPrint: () => window.print(),
            onFilter: () => alert("Ouvrir les filtres avancés (à implémenter)"),
            onSearch: () => alert("recherche active")
        });
        return () => setNavbarActions({});
    }, [setNavbarActions]);


    const filteredDetails = useMemo(() => {
        if (!stats?.details) return [];
        return stats.details.filter(s => s.school_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [stats, searchTerm]);

    const GenderRow = ({ label, m, f }) => (
        <div className="flex items-center justify-between text-xs py-1.5">
            <span className="text-base-content/50">{label}</span>
            <div className="flex gap-4">
                <span className="text-base-content/70">G: <b className="text-primary">{m}</b></span>
                <span className="text-base-content/70">F: <b className="text-secondary">{f}</b></span>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-base-100 pb-20">

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {loading ? <LoadingSkeletoon /> : !stats ? (
                    <Card5 icon={TrendingUp}>
                        Prêt pour l'analyse
                    </Card5>
                ) : (
                    <div>

                        {/* RÉSUMÉ GLOBAL AVEC DÉTAILS GENRE */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-10">
                            <div className="lg:col-span-2 bg-neutral rounded-md p-8 text-neutral-content">
                                <p className="text-primary text-xs mb-3">Moyenne de Réussite</p>
                                <h2 className="text-5xl font-semibold mb-5">{stats.summary.rates.success}%</h2>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-white/5 p-3 rounded-md"><p className="text-xs opacity-50">Total</p><p className="font-semibold text-base">{stats.summary.counts.total.all}</p></div>
                                    <div className="bg-white/5 p-3 rounded-md"><p className="text-xs opacity-50 text-success">Admis</p><p className="font-semibold text-base">{stats.summary.counts.success.all}</p></div>
                                    <div className="bg-white/5 p-3 rounded-md"><p className="text-xs opacity-50 text-error">Échecs</p><p className="font-semibold text-base">{stats.summary.counts.failure.all}</p></div>
                                </div>
                            </div>
                            <div className="lg:col-span-2 bg-base-200 rounded-md p-6 flex flex-col justify-center">
                                <h4 className="text-xs text-base-content/50 mb-3 px-2">Répartition Globale G / F</h4>
                                <div className="space-y-1 bg-base-100 p-5 rounded-md">
                                    <GenderRow label="Effectif Total" m={stats.summary.counts.total.m} f={stats.summary.counts.total.f} />
                                    <GenderRow label="Total Admis" m={stats.summary.counts.success.m} f={stats.summary.counts.success.f} />
                                    <GenderRow label="Total Échecs" m={stats.summary.counts.failure.m} f={stats.summary.counts.failure.f} />
                                </div>
                            </div>
                        </div>

                        {/* LISTE DES ÉTABLISSEMENTS */}
                        <div className="mb-5 flex flex-col md:flex-row justify-between items-center px-2 gap-4">
                            <h3 className="text-xs text-base-content/50">Statistiques par Établissement</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={14} />
                                <input type="text" placeholder="Rechercher une école..." className="bg-base-200 rounded-md pl-10 pr-4 py-2.5 text-sm w-72 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredDetails.map((school, sIdx) => (
                                <div key={sIdx} className="bg-base-200 rounded-md overflow-hidden">
                                    <div className="p-6 cursor-pointer group" onClick={() => setExpandedSchool(expandedSchool === sIdx ? null : sIdx)}>
                                        <div className="flex flex-col xl:flex-row justify-between gap-6">
                                            <div className="flex gap-4 items-center flex-1">
                                                <div className="h-12 w-12 bg-primary/10 text-primary rounded-md flex items-center justify-center text-lg font-semibold">
                                                    {school.school_name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-base font-semibold text-base-content">{school.school_name}</h4>
                                                    <div className="flex gap-2 mt-1.5">
                                                        <p className="text-xs text-base-content/50 bg-base-100 px-2 py-1 rounded-sm">{school.classrooms.length} Classes</p>
                                                        <p className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-sm">Taux: {school.rates.success}%</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Détails G/F rapides par École */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:w-2/3">
                                                <div className="bg-base-100 p-3 rounded-md">
                                                    <p className="text-xs text-base-content/50 mb-1.5">Inscrits ({school.counts.total.all})</p>
                                                    <div className="flex justify-between text-xs">
                                                        <span>G: <b className="text-primary">{school.counts.total.m}</b></span>
                                                        <span>F: <b className="text-secondary">{school.counts.total.f}</b></span>
                                                    </div>
                                                </div>
                                                <div className="bg-success/10 p-3 rounded-md">
                                                    <p className="text-xs text-success mb-1.5">Admis ({school.counts.success.all})</p>
                                                    <div className="flex justify-between text-xs">
                                                        <span>G: <b className="text-primary">{school.counts.success.m}</b></span>
                                                        <span>F: <b className="text-secondary">{school.counts.success.f}</b></span>
                                                    </div>
                                                </div>
                                                <div className="bg-error/10 p-3 rounded-md">
                                                    <p className="text-xs text-error mb-1.5">Échecs ({school.counts.failure.all})</p>
                                                    <div className="flex justify-between text-xs">
                                                        <span>G: <b className="text-primary">{school.counts.failure.m}</b></span>
                                                        <span>F: <b className="text-secondary">{school.counts.failure.f}</b></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DÉTAIL DES CLASSES */}
                                    {expandedSchool === sIdx && (
                                        <div className="px-6 pb-6 pt-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {school.classrooms.map((cls, cIdx) => (
                                                    <div key={cIdx} className="bg-base-100 p-5 rounded-md">
                                                        <div className="flex justify-between items-center mb-5">
                                                            <div className="bg-primary/10 p-2 rounded-md text-primary"><Layers size={16} /></div>
                                                            <div className="px-2.5 py-1 bg-success/10 text-success rounded-sm text-xs font-medium">{cls.rates.success}% Succès</div>
                                                        </div>
                                                        <h5 className="text-sm font-medium text-base-content mb-3 truncate">{cls.classroom_name}</h5>

                                                        <div className="space-y-1 bg-base-200 p-3 rounded-md mb-3">
                                                            <GenderRow label="Inscrits" m={cls.counts.total.m} f={cls.counts.total.f} />
                                                            <GenderRow label="Admis" m={cls.counts.success.m} f={cls.counts.success.f} />
                                                            <GenderRow label="Échecs" m={cls.counts.failure.m} f={cls.counts.failure.f} />
                                                        </div>

                                                        <div className="flex justify-between items-center pt-2 px-1">
                                                            <div className="flex gap-3">
                                                                <div className="text-center">
                                                                    <p className="text-xs text-base-content/50">Min</p>
                                                                    <p className="text-xs font-medium text-base-content">{cls.performance.min}</p>
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="text-xs text-base-content/50">Max</p>
                                                                    <p className="text-xs font-medium text-primary">{cls.performance.max}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-base-content/50">Moyenne</p>
                                                                <p className="text-sm font-semibold text-base-content">{cls.performance.avg}/20</p>
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
