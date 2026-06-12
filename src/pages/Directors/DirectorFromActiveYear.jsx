import { useEffect, useState } from "react";
import { Building2, User, Calendar, Trash2, ShieldCheck, Search, Download, Trash2Icon } from "lucide-react";
import axiosClient from "../../utils/AxiosClient";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import TitleComponent from "../../components/TitleComponent";
import Loading from "../../components/Loading";
import BackComponent from "../../components/BackComponent";
import useShowConfirm from '../../hooks/UseShowConfirm'

function DirectorFromActiveYear() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [year, setYear] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const showConfirm = useShowConfirm()

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get("/directors/assignments/all");
            if (res.data.success) {
                setAssignments(res.data.data);
                setYear(res.data.academic_year);
            }
        } catch (error) {
            toast.error("Impossible de charger les affectations");
        } finally {
            setLoading(false);
        }
    };

    const handleDestroyAssignment = (id) => {
        showConfirm({
            title: "Supprimer",
            message: "Voulez-vous retirer ce directeur de cette école ?",
            onSuccess: () => {
                axiosClient.delete(`/directors/assignments/destroy/${id}`)
                .then(() => {
                    toast.success("Affectation supptimée avec succès")
                    fetchData()
                })
                .catch((error) => {
                    toast.error("Une erreur est survenue")
                    console.error(error)
                })
            }
        })
    }

    // Filtrage dynamique pour la recherche
    const filteredAssignments = assignments.filter(item => 
        item.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const inputStyle = "w-full bg-white border border-slate-200 rounded-2xl px-12 py-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none shadow-sm";

    return (
        <main className="min-h-screen bg-slate-50/50">
            <Navbar>
                <Navbar.Left><TitleComponent>Registre des Directions</TitleComponent></Navbar.Left>
                <Navbar.Right><Loading load={loading} /><BackComponent /></Navbar.Right>
            </Navbar>

            <div className="max-w-6xl mx-auto p-4 lg:p-12">
                
                {/* Header contextuel avec l'année active */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Année Académique</h2>
                            <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[2px]">{year || "Chargement..."}</p>
                        </div>
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="RECHERCHER UNE ÉCOLE OU UN DIRECTEUR..." 
                            className={inputStyle}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Liste des affectations */}
                <div className="bg-white rounded-xl shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Établissement</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Directeur Assigné</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredAssignments.length > 0 ? (
                                    filteredAssignments.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        <Building2 size={20} />
                                                    </div>
                                                    <span className="font-bold text-slate-700 text-sm">{item.school_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 text-sm uppercase tracking-tight">
                                                            {item.first_name} {item.last_name}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Chef d'établissement</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                    <ShieldCheck size={12} /> Officiel
                                                </span>
                                            </td>
                                            <td className="p-8 text-right">
                                                <button className="p-3 text-slate-300 hover:text-red-600 hover:bg-indigo-50 rounded-2xl transition-all cursor-pointer" onClick={() => {handleDestroyAssignment(item.id)}}>
                                                    <Trash2Icon size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-24 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <Search size={48} />
                                                <p className="font-black uppercase tracking-widest text-xs">Aucun résultat trouvé</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default DirectorFromActiveYear;

