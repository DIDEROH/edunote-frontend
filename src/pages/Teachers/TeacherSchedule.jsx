import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
    User, BookOpen, GraduationCap, School, Calendar, 
    Trash2, Search, Filter, LayoutGrid, ClipboardList 
} from "lucide-react";
import axiosClient from "../../utils/AxiosClient";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import TitleComponent from "../../components/TitleComponent";
import Loading from "../../components/Loading";
import BackComponent from "../../components/BackComponent";
import useShowConfirm from "../../hooks/UseShowConfirm";

function TeacherSchedule() {
    const { teacherId } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(false);
    const showConfirm = useShowConfirm()

    useEffect(() => {
        fetchInitialData();
    }, [teacherId]);

    // Re-charger les assignations quand l'année change
    useEffect(() => {
        if (selectedYear) {
            fetchSchedule();
        }
    }, [selectedYear]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [yearsRes, teacherRes] = await Promise.all([
                axiosClient.get("/academic-years"),
                axiosClient.get(`/personnels/${teacherId}`) // Pour afficher le nom du prof
            ]);
            setAcademicYears(yearsRes.data.data || []);
            setTeacher(teacherRes.data.data);
            
            // Sélectionner l'année en cours par défaut si elle existe
            if (yearsRes.data.data.length > 0) {
                setSelectedYear(yearsRes.data.data[0].id);
            }
        } catch (error) {
            toast.error("Erreur de chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get(`/teachers/assignments/teacher/${teacherId}/${selectedYear}`);
            setAssignments(data);
        } catch (error) {
            toast.error("Erreur lors de la récupération du planning");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {

        showConfirm({
            title: "Retirer la classe",
            message: "Voulez-vous retirer cette matière à cet enseignant ?",
            onSuccess: () => {
                axiosClient.delete(`/teachers/assignments/${id}`)
                .then(() => {
                    toast.success("Assignation retirée");
                    setAssignments(assignments.filter(a => a.id !== id));
                })
                .catch(() => {
                    toast.error("Erreur lors de la suppression")
                })
            }
        })
        
    };

    return (
        <main className="min-h-screen bg-slate-50/50">
            <Navbar>
                <Navbar.Left>
                    <TitleComponent>Planning de Service</TitleComponent>
                </Navbar.Left>
                <Navbar.Center>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <Calendar size={16} className="text-indigo-500 ml-2" />
                        <select 
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer"
                        >
                            {academicYears.map(y => (
                                <option key={y.id} value={y.id}>{y.name}</option>
                            ))}
                        </select>
                    </div>
                </Navbar.Center>
                <Navbar.Right>
                    <Loading load={loading} />
                    <BackComponent />
                </Navbar.Right>
            </Navbar>

            <div className="max-w-6xl mx-auto p-2 md:p-4 lg:p-6 xl:p-8">
                {/* Header Profil Enseignant */}
                {teacher && (
                    <div className="bg-slate-900 rounded-lg p-2 md:p-4 lg:p-6 xl:p-8 mb-10 flex items-center justify-between shadow-2xl shadow-slate-200">
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 bg-indigo-500 rounded-3xl flex items-center justify-center text-white text-2xl font-black">
                                {teacher.first_name[0]}{teacher.last_name[0]}
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                                    {teacher.first_name} {teacher.last_name}
                                </h1>
                                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[3px]">
                                    Enseignant Titulaire • {assignments.length} Classes
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:block text-right">
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Contact</p>
                            <p className="text-white font-bold text-sm">{teacher.phone || "---"}</p>
                        </div>
                    </div>
                )}

                {/* Liste des Assignations */}
                <div className="space-y-4">
                    <h2 className="ml-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px] mb-6 flex items-center gap-2">
                        <ClipboardList size={14} /> Répartition des enseignements
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {assignments.map((item) => (
                            <div key={item.id} className="group bg-white rounded-lg p-2 pr-6 border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    {/* Badge Classe */}
                                    <div className="h-16 w-24 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center border border-indigo-100/50">
                                        <GraduationCap size={18} className="text-indigo-600 mb-1" />
                                        <span className="text-[11px] text-center font-black text-indigo-700">{item.classroom?.name}</span>
                                    </div>

                                    {/* Infos Matière */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <BookOpen size={14} className="text-slate-400" />
                                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                                {item.subject?.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <School size={12} className="text-slate-300" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.school?.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="hidden md:flex flex-col text-right">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Code Matière</span>
                                        <span className="text-[11px] font-bold text-slate-600">{item.subject?.code || '---'}</span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                                        title="Supprimer l'assignation"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {assignments.length === 0 && !loading && (
                            <div className="bg-white rounded-lg p-20 text-center border-2 border-dashed border-slate-100">
                                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
                                    Aucune assignation trouvée pour cette année
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default TeacherSchedule;