import { useEffect, useState, useMemo } from 'react'
import { Plus, Trash2, Loader2, Search, Users, ShieldCheck } from 'lucide-react'
import { toast } from 'react-toastify'
import axiosClient from '../../utils/AxiosClient'
import Navbar from '../../components/Navbar'
import BackComponent from '../../components/BackComponent'
import useShowConfirm from '../../hooks/UseShowConfirm'

function DirectorTeacherManagement() {
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [assignments, setAssignments] = useState([])
    const [teachers, setTeachers] = useState([])
    const [classes, setClasses] = useState([])
    const [subjects, setSubjects] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const showConfirm = useShowConfirm()
    
    const [formData, setFormData] = useState({
        user_id: '',
        classroom_id: '',
        subject_id: ''
    })

    useEffect(() => {
        loadInitialData()
    }, [])

    const loadInitialData = async () => {
        try {
            const [resA, resT, resC, resS] = await Promise.all([
                axiosClient.get('/director-space/teacher-assignments'),
                axiosClient.get('/director-space/teachers/list'),
                axiosClient.get('/classrooms'),
                axiosClient.get('/subjects')
            ])
            // Note: resA.data.data car ton backend renvoie ['status' => 'success', 'data' => $assignments]
            setAssignments(resA.data.data || [])
            setTeachers(resT.data || [])
            setClasses(resC.data || [])
            setSubjects(resS.data.data || [])
        } catch (err) {
            toast.error("Erreur de chargement des données")
            console.error(err);
        } finally {
            setLoading(false)
        }
    }

    // LOGIQUE DE FILTRE MISE À JOUR (Basée sur les nouveaux alias SQL)
    const filteredAssignments = useMemo(() => {
        return assignments.filter(as => {
            const search = searchTerm.toLowerCase();
            return (
                as.last_name?.toLowerCase().includes(search) ||
                as.first_name?.toLowerCase().includes(search) ||
                as.classroom_name?.toLowerCase().includes(search) ||
                as.subject_name?.toLowerCase().includes(search)
            )
        })
    }, [assignments, searchTerm])

    const handleAssign = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await axiosClient.post('/director-space/teacher-assignments', formData)
            toast.success("Affectation réussie")
            loadInitialData()
            setFormData({ user_id: '', classroom_id: '', subject_id: '' })
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur d'affectation")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        showConfirm({
            title: "Supprimer",
            message: "Voulez-vous vraiment Retirer cette affectation ?",
            onSuccess: () => {
                axiosClient.delete(`/director-space/teacher-assignments/${id}`)
                .then(() => {
                    setAssignments(prev => prev.filter(a => a.id !== id))
                    toast.success("Affectation retirée")
                })
                .catch((err) => {
                    toast.error("Erreur lors de la suppression")
                })
            }
        })
    }

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
            <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
        </div>
    )

    return (
        <main className="min-h-screen bg-[#f8fafc] pb-20">
            <Navbar>
                <Navbar.Left>
                    <div className="flex flex-col">
                        <h1 className='font-bold text-xl text-slate-800'>Affectations Enseignants</h1>
                        <span className="text-[10px] font-black text-indigo-600 flex items-center gap-1 uppercase tracking-widest">
                            <ShieldCheck size={12}/> Espace Directeur
                        </span>
                    </div>
                </Navbar.Left>
                <Navbar.Right><BackComponent /></Navbar.Right>
            </Navbar>

            <section className="p-4 max-w-7xl mx-auto mt-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* FORMULAIRE */}
                <div className="lg:col-span-4">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 sticky top-24">
                        <h2 className="text-slate-800 font-bold text-lg mb-6 flex items-center gap-2">
                            <Plus className="text-indigo-600" size={20}/> Nouvelle Affectation
                        </h2>
                        
                        <form onSubmit={handleAssign} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Enseignant</label>
                                <select 
                                    className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none text-sm"
                                    value={formData.user_id}
                                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                                    required
                                >
                                    <option value="">Sélectionner...</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.last_name?.toUpperCase()} {t.first_name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Classe</label>
                                <select 
                                    className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none text-sm"
                                    value={formData.classroom_id}
                                    onChange={(e) => setFormData({...formData, classroom_id: e.target.value})}
                                    required
                                >
                                    <option value="">Sélectionner...</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Matière</label>
                                <select 
                                    className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none text-sm"
                                    value={formData.subject_id}
                                    onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                                    required
                                >
                                    <option value="">Sélectionner...</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20}/> : "Assigner l'enseignant"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* TABLEAU */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2 shrink-0">
                                <Users className="text-indigo-600" size={20}/> Personnel ({filteredAssignments.length})
                            </h2>
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text"
                                    placeholder="Chercher un prof, une classe..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none outline-none text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Enseignant</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Classe</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Matière</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredAssignments.map((as) => (
                                        <tr key={as.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                        {as.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-700 uppercase text-xs">{as.last_name}</p>
                                                        <p className="text-[11px] text-slate-400">{as.first_name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase">
                                                    {as.classroom_name}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                                                    {as.subject_name}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => handleDelete(as.id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default DirectorTeacherManagement