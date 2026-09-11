import { useEffect, useState } from "react";
import {
    Users, UserCheck, ShieldCheck, GraduationCap,
    BookOpen, School, Layers, Award, Calendar,
    TrendingUp, Activity, Lock, Unlock, Globe
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
        { name: 'Hommes', value: groupData?.male || 0, color: '#4F46E5' },
        { name: 'Femmes', value: groupData?.female || 0, color: '#DB2777' }
    ];

    const StatCard = ({ title, value, icon: Icon }) => (
        <div className="bg-base-200 rounded-md p-5">
            <div className="flex items-center justify-between mb-5">
                <div className="p-3 rounded-md bg-primary/10 text-primary">
                    <Icon size={20} />
                </div>
                <Activity size={13} className="text-base-content/20" />
            </div>
            <div>
                <p className="text-xs text-base-content/50 mb-1">{title}</p>
                <h3 className="text-xl font-semibold text-base-content">{value?.toLocaleString() ?? 0}</h3>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-base-100">
            <Navbar>
                <Navbar.Left><TitleComponent>Statistiques Globales</TitleComponent></Navbar.Left>
                <Navbar.Right>
                    <div className="hidden md:flex items-center gap-3 mr-4 bg-primary/10 px-4 py-2 rounded-md">
                        <Calendar size={14} className="text-primary" />
                        <span className="text-xs font-medium text-primary">
                            Année Active : {stats?.context?.active_year}
                        </span>
                    </div>
                    <Loading load={loading} />
                    <button onClick={fetchStats} className="p-2.5 bg-base-200 rounded-md text-base-content/50 hover:text-primary transition-colors duration-150">
                        <TrendingUp size={18} />
                    </button>
                    <BackComponent />
                </Navbar.Right>
            </Navbar>

            {loading ? <LoadingSkeletoon /> : !stats ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <div className="bg-base-200 p-10 rounded-md text-center">
                        <Activity size={40} className="mx-auto text-base-content/20 mb-4" />
                        <p className="text-base-content/50 text-xs">Aucune statistique trouvée</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">

                    {/* SECTION 1: COMPTEURS PRINCIPAUX */}
                    <div className="mb-10">
                        <h2 className="text-xs text-base-content/50 mb-5 ml-1 flex items-center gap-2">
                            <Users size={14} /> Effectifs Généraux
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            <StatCard title="Total Utilisateurs" value={stats.counters.staff.total_users} icon={Users} />
                            <StatCard title="Élèves" value={stats.counters.students.total} icon={GraduationCap} />
                            <StatCard title="Enseignants" value={stats.counters.staff.teachers.total} icon={UserCheck} />
                            <StatCard title="Administrateurs" value={stats.counters.staff.admins.total} icon={ShieldCheck} />
                            <StatCard title="Directeurs" value={stats.counters.staff.directors.total} icon={Award} />
                        </div>
                    </div>

                    {/* SECTION 2: RÉPARTITION PAR GENRE */}
                    <div className="mb-10">
                        <h2 className="text-xs text-base-content/50 mb-5 ml-1 flex items-center gap-2">
                            <Activity size={14} /> Répartition par Genre
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Élèves", data: stats.counters.students },
                                { label: "Enseignants", data: stats.counters.staff.teachers },
                                { label: "Directeurs", data: stats.counters.staff.directors },
                                { label: "Admins", data: stats.counters.staff.admins }
                            ].map((group, index) => (
                                <div key={index} className="bg-base-200 rounded-md p-4 flex flex-col items-center">
                                    <p className="text-xs text-base-content/50 mb-2">{group.label}</p>
                                    <div className="h-40 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={getChartData(group.data)}
                                                    innerRadius={45}
                                                    outerRadius={65}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {getChartData(group.data).map((entry, i) => (
                                                        <Cell key={`cell-${i}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="text-xs text-base-content/70">{group.data.male} G</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-accent" />
                                            <span className="text-xs text-base-content/70">{group.data.female} F</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 3: PEDAGOGY & STRUCTURE */}
                    <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                            <h2 className="text-xs text-base-content/50 mb-5 ml-1 flex items-center gap-2">
                                <Layers size={14} /> Architecture Pédagogique
                            </h2>
                            <div className="grid grid-cols-3 gap-3">
                                <StatCard title="Classes" value={stats.counters.pedagogy.classrooms} icon={Layers} />
                                <StatCard title="Matières" value={stats.counters.pedagogy.subjects} icon={BookOpen} />
                                <StatCard title="Compétences" value={stats.counters.pedagogy.skills} icon={Award} />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xs text-base-content/50 mb-5 ml-1 flex items-center gap-2">
                                <School size={14} /> Établissements
                            </h2>
                            <div className="bg-neutral rounded-md p-6 text-neutral-content h-38 flex items-center">
                                <div>
                                    <p className="text-primary text-xs mb-1">Écoles Actives</p>
                                    <h3 className="text-3xl font-semibold">{stats.counters.structure.schools}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: GOUVERNANCE */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 bg-base-200 rounded-md p-8 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-warning/10 text-warning rounded-md">
                                        <Globe size={18} />
                                    </div>
                                    <h2 className="text-base font-semibold text-base-content">Gouvernance</h2>
                                </div>
                                <p className="text-base-content/50 text-sm mb-5">
                                    Suivi du verrouillage des établissements pour l'année {stats.context.active_year}.
                                </p>
                                <div className="flex gap-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-success/10 flex items-center justify-center text-success">
                                            <Unlock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-base-content/50">Ouvertes</p>
                                            <p className="text-base font-semibold text-base-content">{stats.governance.schools_open}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-error/10 flex items-center justify-center text-error">
                                            <Lock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-base-content/50">Verrouillées</p>
                                            <p className="text-base font-semibold text-base-content">{stats.governance.schools_locked}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <p className="text-base-content/50 text-xs mb-1">Total Entrées (Log)</p>
                                <p className="text-2xl font-semibold text-primary">{stats.governance.total_entries}</p>
                                <div className="mt-3 inline-flex items-center gap-2 bg-base-100 px-3 py-1.5 rounded-sm">
                                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                                    <span className="text-xs text-base-content/60">Données en temps réel</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary rounded-md p-8 text-primary-content flex flex-col justify-between">
                            <div>
                                <h3 className="text-base font-semibold mb-5">Configuration Périodique</h3>
                                <div className="space-y-5">
                                    <div className="flex justify-between items-end pb-3">
                                        <span className="text-xs opacity-70">Années en base</span>
                                        <span className="text-2xl font-semibold">{stats.counters.structure.years}</span>
                                    </div>
                                    <div className="flex justify-between items-end pb-3">
                                        <span className="text-xs opacity-70">Découpage (Trimestres)</span>
                                        <span className="text-2xl font-semibold">{stats.counters.structure.terms}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default Effectifs;
