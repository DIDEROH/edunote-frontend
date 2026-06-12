import { useEffect, useState } from "react";
import { User, Phone, Search, Edit2, UserCheck, ShieldCheck } from "lucide-react";
import axiosClient from "../../utils/AxiosClient";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import TitleComponent from "../../components/TitleComponent";
import Loading from "../../components/Loading";
import BtnList from "../../components/BtnList";
import AddBtn from "../../components/AddBtn";
import { useNavigate } from "react-router-dom";
import LoadingSkeletoon from "../../components/LoadingSkeletoon";

function DirectorsList() {
    const [directors, setDirectors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchDirectors();
    }, []);

    const fetchDirectors = async () => {
        setLoading(true);
        try {
            // Adapté pour récupérer uniquement les directeurs
            const { data } = await axiosClient.get("/directors/list");
            setDirectors(data.data || data);
        } catch (error) {
            toast.error("Erreur lors du chargement des directeurs");
            console.error(error)
        } finally {
            setLoading(false);
        }
    };

    const filteredDirectors = directors.filter(d => 
        `${d.first_name} ${d.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-slate-50/50">
            <Navbar>
                <Navbar.Left>
                    <AddBtn action={() => navigate('/edunote/create-personnel')} /> 
                    <span className="mx-1"></span>
                    <TitleComponent>Corps Administratif</TitleComponent>
                </Navbar.Left>

                <Navbar.Center>
                    <div className="relative w-64 md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Rechercher un directeur..."
                            className="w-full pl-12 pr-4 py-2.5 bg-white border-none rounded-2xl text-[11px] font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </Navbar.Center>

                <Navbar.Right>
                    <Loading load={loading} />
                    <BtnList action={fetchDirectors} />
                </Navbar.Right>
            </Navbar>

            {loading ? <LoadingSkeletoon /> :
                <div className="max-w-7xl mx-auto p-4 lg:p-8">
                    <div className="flex gap-4 mb-8">
                        <div className="bg-white px-6 py-4 rounded-sm shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Directeurs Actifs</p>
                                <p className="text-xl font-black text-slate-800">{directors.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDirectors.map((director) => (
                            <div key={director.id} className="group bg-white rounded-lg p-6 shadow-xl shadow-slate-200/40 border border-slate-100 hover:border-indigo-200 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 text-slate-50 group-hover:text-indigo-50 transition-colors">
                                    <UserCheck size={120} />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                                            {director.first_name.charAt(0)}{director.last_name.charAt(0)}
                                        </div>
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" onClick={() => navigate(`/edunote/create-personnel/${director.id}`)}>
                                            <Edit2 size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-1 mb-6">
                                        <h3 className="text-lg font-black text-slate-800 leading-tight uppercase tracking-tight">
                                            {director.first_name} <span className="text-indigo-600">{director.last_name}</span>
                                        </h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            ADMIN ID: #{director.id.toString().padStart(4, '0')}
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                            <Phone size={14} />
                                            <span className="text-[11px] font-black">{director?.phone || "N/A"}</span>
                                        </div>
                                        
                                        {/* <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline" onClick={() => navigate(`/edunote/directors/assign/${director.id}`)}>
                                            Affectations
                                        </button> */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredDirectors.length === 0 && !loading && (
                        <div className="bg-white rounded-lg p-20 text-center border-2 border-dashed border-slate-100">
                            <h3 className="text-slate-400 font-black uppercase tracking-widest text-sm">Aucun directeur trouvé</h3>
                        </div>
                    )}
                </div>
            }
        </main>
    );
}

export default DirectorsList;