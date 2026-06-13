import { useEffect, useState } from "react";
import { 
    Users, UserCheck, ShieldCheck, GraduationCap, 
    BookOpen, School, Layers, Award, Calendar, 
    TrendingUp, Activity, Lock, Unlock, Globe
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axiosClient from "../utils/AxiosClient";
import Navbar from "../components/Navbar";
import TitleComponent from "../components/TitleComponent";
import Loading from "../components/Loading";
import LoadingSkeletoon from "../components/LoadingSkeletoon";
import BackComponent from "../components/BackComponent";

function Effectifs() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get("/stats/global");
            setStats(data.data);
        } catch (error) {
            console.error("Erreur stats:", error);
        } finally {
            setLoading(false);
        }
    };

    // Préparation des données pour les graphiques
    const getChartData = (groupData) => [
        { name: 'Hommes', value: groupData?.male || 0, color: '#4F46E5' }, // Indigo-600
        { name: 'Femmes', value: groupData?.female || 0, color: '#F472B6' } // Pink-400
    ];

    const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
        <div className={`bg-white rounded-lg p-4 lg:p-6 xl:p-8 border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${delay}`}>
            <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 ${colorClass.replace('bg-', 'text-')}`}>
                    <Icon size={24} />
                </div>
                <Activity size={14} className="text-slate-200" />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] mb-1">{title}</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value?.toLocaleString() ?? 0}</h3>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-50/50">
            <Navbar>
                <Navbar.Left><TitleComponent>Statistiques Globales</TitleComponent></Navbar.Left>
                <Navbar.Right>
                    <div className="hidden md:flex items-center gap-3 mr-4 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
                        <Calendar size={14} className="text-indigo-600" />
                        <span className="text-[10px] font-black text-indigo-600 uppercase">
                            Année Active : {stats?.context?.active_year}
                        </span>
                    </div>
                    <Loading load={loading} />
                    <button onClick={fetchStats} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
                        <TrendingUp size={20} />
                    </button>
                    <BackComponent />
                </Navbar.Right>
            </Navbar>

            {loading ? <LoadingSkeletoon /> : !stats ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <div className="bg-white p-10 rounded-xl shadow-xl text-center">
                        <Activity size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Aucune statistique trouvée</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto p-2 md:p-4 lg:p-6 xl:p-8">
                    
                    {/* SECTION 1: COMPTEURS PRINCIPAUX */}
                    <div className="mb-12">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-6 ml-4 flex items-center gap-2">
                            <Users size={14} /> Effectifs Généraux
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                            <StatCard title="Total Utilisateurs" value={stats.counters.staff.total_users} icon={Users} colorClass="bg-slate-900" delay="delay-0" />
                            <StatCard title="Élèves" value={stats.counters.students.total} icon={GraduationCap} colorClass="bg-emerald-500" delay="delay-75" />
                            <StatCard title="Enseignants" value={stats.counters.staff.teachers.total} icon={UserCheck} colorClass="bg-indigo-600" delay="delay-150" />
                            <StatCard title="Administrateurs" value={stats.counters.staff.admins.total} icon={ShieldCheck} colorClass="bg-red-500" delay="delay-200" />
                            <StatCard title="Directeurs" value={stats.counters.staff.directors.total} icon={Award} colorClass="bg-amber-500" delay="delay-300" />
                        </div>
                    </div>

                    {/* SECTION 2: RÉPARTITION PAR GENRE (DIAGRAMMES CIRCULAIRES) */}
                    <div className="mb-12">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-6 ml-4 flex items-center gap-2">
                            <Activity size={14} /> Répartition par Genre (Analytique)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "Élèves", data: stats.counters.students },
                                { label: "Enseignants", data: stats.counters.staff.teachers },
                                { label: "Directeurs", data: stats.counters.staff.directors },
                                { label: "Admins", data: stats.counters.staff.admins }
                            ].map((group, index) => (
                                <div key={index} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col items-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{group.label}</p>
                                    <div className="h-48 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={getChartData(group.data)}
                                                    innerRadius={45}
                                                    outerRadius={65}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {getChartData(group.data).map((entry, i) => (
                                                        <Cell key={`cell-${i}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                                            <span className="text-[10px] font-bold text-slate-600">{group.data.male} G</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                                            <span className="text-[10px] font-bold text-slate-600">{group.data.female} F</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    

                    {/* SECTION 3: PEDAGOGY & STRUCTURE */}
                    <div className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-6 ml-4 flex items-center gap-2">
                                <Layers size={14} /> Architecture Pédagogique
                            </h2>
                            <div className="grid grid-cols-3 gap-3">
                                <StatCard title="Classes" value={stats.counters.pedagogy.classrooms} icon={Layers} colorClass="bg-blue-500" />
                                <StatCard title="Matières" value={stats.counters.pedagogy.subjects} icon={BookOpen} colorClass="bg-pink-500" />
                                <StatCard title="Compétences" value={stats.counters.pedagogy.skills} icon={Award} colorClass="bg-cyan-500" />
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-6 ml-4 flex items-center gap-2">
                                <School size={14} /> Établissements
                            </h2>
                            <div className="bg-slate-900 rounded-lg p-6 xl:p-8 text-white relative overflow-hidden h-[154px] flex items-center shadow-xl">
                                <div className="relative z-10">
                                    <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-1">Écoles Actives</p>
                                    <h3 className="text-5xl font-black">{stats.counters.structure.schools}</h3>
                                </div>
                                <School size={100} className="absolute -right-4 -bottom-4 text-white opacity-10 rotate-12" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: GOUVERNANCE */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-xl p-10 border border-slate-100 shadow-xl flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                        <Globe size={20} />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Gouvernance</h2>
                                </div>
                                <p className="text-slate-400 text-[11px] font-bold leading-relaxed mb-6">
                                    Suivi du verrouillage des établissements pour l'année {stats.context.active_year}.
                                </p>
                                <div className="flex gap-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <Unlock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Ouvertes</p>
                                            <p className="text-lg font-bold text-slate-800">{stats.governance.schools_open}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                            <Lock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Verrouillées</p>
                                            <p className="text-lg font-black text-slate-800">{stats.governance.schools_locked}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-px h-px md:h-32 bg-slate-100"></div>

                            <div className="flex-1 text-center md:text-left">
                                <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Total Entrées (Log)</p>
                                <p className="text-4xl font-black text-indigo-600">{stats.governance.total_entries}</p>
                                <div className="mt-4 inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Données en temps réel</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-600 rounded-xl p-10 text-white flex flex-col justify-between shadow-2xl shadow-indigo-100 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-black mb-6 uppercase tracking-tight">Configuration Périodique</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end border-b border-indigo-500 pb-4">
                                        <span className="text-[10px] font-black uppercase opacity-60">Années en base</span>
                                        <span className="text-3xl font-black">{stats.counters.structure.years}</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-indigo-500 pb-4">
                                        <span className="text-[10px] font-black uppercase opacity-60">Découpage (Trimestres)</span>
                                        <span className="text-3xl font-black">{stats.counters.structure.terms}</span>
                                    </div>
                                </div>
                            </div>
                            <Calendar size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12" />
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default Effectifs;