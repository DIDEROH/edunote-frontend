import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, Calculator, CheckCircle2, Plus, Save, Trash2, Search, Layers } from "lucide-react";
import axiosClient from "../../utils/AxiosClient";
import { toast } from "sonner";
import Navbar from "../../components/Navbar";
import TitleComponent from "../../components/TitleComponent";
import BackComponent from "../../components/BackComponent";
import Loading from "../../components/Loading";

function AssignSubjects() {
    const { id } = useParams(); // ID de la classe
    const [classroom, setClassroom] = useState(null);
    const [allSubjects, setAllSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [classRes, subRes] = await Promise.all([
                axiosClient.get(`/classrooms/${id}`),
                axiosClient.get("/subjects")
            ]);
            
            setClassroom(classRes.data.data);
            setAllSubjects(subRes.data.data);
            
            // Pré-remplir avec les matières déjà assignées
            const existing = classRes.data.data.subjects.map(s => ({
                id: s.id,
                name: s.name,
                code: s.code,
                coefficient: s.pivot?.coefficient || s.coefficient || 1
            }));
            setSelectedSubjects(existing);
        } catch (error) {
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    const addSubject = (subject) => {
        if (!selectedSubjects.find(s => s.id === subject.id)) {
            setSelectedSubjects([...selectedSubjects, { ...subject, coefficient: subject.coefficient || 1 }]);
        }
    };

    const removeSubject = (subjectId) => {
        setSelectedSubjects(selectedSubjects.filter(s => s.id !== subjectId));
    };

    const updateCoefficient = (id, val) => {
        setSelectedSubjects(selectedSubjects.map(s => 
            s.id === id ? { ...s, coefficient: parseInt(val) || 1 } : s
        ));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await axiosClient.post(`/classrooms/${id}/assign-subjects`, {
                subjects: selectedSubjects.map(s => ({
                    id: s.id,
                    coefficient: s.coefficient
                }))
            });
            toast.success("Programme mis à jour !");
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    const filteredSubjects = allSubjects.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-slate-50/50">
            <Navbar>
                <Navbar.Left>
                    <TitleComponent>Configuration du Programme</TitleComponent>
                </Navbar.Left>
                <Navbar.Center>
                    {classroom && (
                        <div className="bg-indigo-600 text-white px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200">
                            Classe : {classroom.name}
                        </div>
                    )}
                </Navbar.Center>
                <Navbar.Right>
                    <Loading load={loading} />
                    <BackComponent />
                </Navbar.Right>
            </Navbar>

            <div className="max-w-7xl mx-auto p-2 md:p-4 lg:p-6 xl:p-8 grid grid-cols-1 xl:grid-cols-12 gap-2 md:p-4 lg:p-6 xl:p-8">
                
                {/* Colonne GAUCHE : Bibliothèque des matières */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Rechercher une matière..."
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-2 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
                            {filteredSubjects.map(sub => {
                                const isAdded = selectedSubjects.find(s => s.id === sub.id);
                                return (
                                    <div 
                                        key={sub.id}
                                        onClick={() => !isAdded && addSubject(sub)}
                                        className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border-2 
                                        ${isAdded ? 'bg-emerald-50 border-emerald-100 opacity-50' : 'bg-white border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 shadow-sm'}`}
                                    >
                                        <div>
                                            <p className="text-[11px] font-black text-slate-700 uppercase">{sub.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 tracking-widest">{sub.code}</p>
                                        </div>
                                        {isAdded ? <CheckCircle2 className="text-emerald-500" size={18} /> : <Plus className="text-indigo-400" size={18} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Colonne DROITE : Liste de la classe & Coefficents */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="bg-white rounded-lg border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-2 md:p-4 lg:p-6 xl:p-8 border-b border-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                                    <Layers size={20} />
                                </div>
                                <h2 className="font-black text-slate-800 text-lg">Matières sélectionnées ({selectedSubjects.length})</h2>
                            </div>
                            <button 
                                onClick={handleSave}
                                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2"
                            >
                                <Save size={16} /> Enregistrer le programme
                            </button>
                        </div>

                        <div className="p-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="p-4 text-left">Matière</th>
                                        <th className="p-4 text-center">Coefficient</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSubjects.map(sub => (
                                        <tr key={sub.id} className="group border-b border-slate-50 last:border-0">
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-700 uppercase text-xs">{sub.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold">{sub.code}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center">
                                                    <div className="flex items-center bg-slate-50 rounded-xl px-4 py-1 border border-slate-100">
                                                        <Calculator size={14} className="text-slate-400 mr-2" />
                                                        <input 
                                                            type="number" 
                                                            min="1"
                                                            value={sub.coefficient}
                                                            onChange={(e) => updateCoefficient(sub.id, e.target.value)}
                                                            className="w-12 bg-transparent border-none text-center font-black text-indigo-600 focus:ring-0"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => removeSubject(sub.id)}
                                                    className="p-3 cursor-pointer text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {selectedSubjects.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                                                Aucune matière assignée
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default AssignSubjects;