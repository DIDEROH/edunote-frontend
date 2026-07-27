import { useEffect, useState, useMemo } from 'react'
import { Plus, Trash2, Loader2, Search, Users, Edit2, X } from 'lucide-react'
import { toast } from 'sonner'
import axiosClient from '../utils/AxiosClient'
import useShowConfirm from '../hooks/UseShowConfirm'
import PageHeader from '../components/elements/PageHeader'

function DirectorTeacherManagement() {
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [assignments, setAssignments] = useState([])
    const [teachers, setTeachers] = useState([])
    const [classes, setClasses] = useState([])
    const [subjects, setSubjects] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [editingId, setEditingId] = useState(null)
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
            const [resA, resT, resC] = await Promise.all([
                axiosClient.get('/director-space/teacher-assignments'),
                axiosClient.get('/director-space/teachers/list'),
                axiosClient.get('/classrooms')
            ])
            setAssignments(resA.data.data || [])
            setTeachers(resT.data.data || [])
            setClasses(resC.data || [])
        } catch (err) {
            toast.error("Erreur de chargement des données")
        } finally {
            setLoading(false)
        }
    }

    const filteredAssignments = useMemo(() => {
        return assignments.filter(as => {
            const search = searchTerm.toLowerCase();
            return (
                as.user?.last_name?.toLowerCase().includes(search) ||
                as.user?.first_name?.toLowerCase().includes(search) ||
                as.classroom?.name?.toLowerCase().includes(search) ||
                as.subject?.name?.toLowerCase().includes(search)
            )
        })
    }, [assignments, searchTerm])

    const fetchSubjectsForClass = async (classroomId) => {
        if (!classroomId) {
            setSubjects([])
            return
        }
        try {
            const { data } = await axiosClient.get(`/classrooms/${classroomId}/subjects`)
            setSubjects(data.data || data || [])
        } catch (err) {
            setSubjects([])
        }
    }

    const handleClassroomChange = async (value) => {
        setFormData(prev => ({ ...prev, classroom_id: value, subject_id: '' }))
        await fetchSubjectsForClass(value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            if (editingId) {
                await axiosClient.put(`/director-space/teacher-assignments/${editingId}`, formData)
                toast.success("Affectation modifiée avec succès")
            } else {
                await axiosClient.post('/director-space/teacher-assignments', formData)
                toast.success("Affectation créée avec succès")
            }
            loadInitialData()
            setFormData({ user_id: '', classroom_id: '', subject_id: '' })
            setEditingId(null)
            setSubjects([])
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur lors de l'opération")
        } finally {
            setSubmitting(false)
        }
    }

    const handleEditStart = (as) => {
        setEditingId(as.id)
        setFormData({
            user_id: as.user_id,
            classroom_id: as.classroom_id,
            subject_id: as.subject_id
        })
        fetchSubjectsForClass(as.classroom_id)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setFormData({ user_id: '', classroom_id: '', subject_id: '' })
        setSubjects([])
    }

    const handleDelete = async (id) => {
        showConfirm({
            title: "Supprimer",
            message: "Voulez-vous vraiment retirer cette affectation ?",
            onSuccess: () => {
                axiosClient.delete(`/director-space/teacher-assignments/${id}`)
                .then(() => {
                    setAssignments(prev => prev.filter(a => a.id !== id))
                    toast.success("Affectation retirée")
                })
                .catch(() => toast.error("Erreur lors de la suppression"))
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
            <PageHeader title="Affectations" subtitle="Gérez les enseignants par classe et matière" />
            <section className="max-w-7xl mx-auto mt-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 sticky top-24">
                        <h2 className="text-slate-800 font-bold text-lg mb-6 flex items-center gap-2">
                            {editingId ? <Edit2 className="text-amber-500" size={20}/> : <Plus className="text-indigo-600" size={20}/>}
                            {editingId ? "Modifier l'affectation" : "Nouvelle Affectation"}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    onChange={(e) => handleClassroomChange(e.target.value)}
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
                                    disabled={!formData.classroom_id}
                                >
                                    <option value="">Sélectionner...</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button type="submit" disabled={submitting} className="flex-1 py-4 mt-4 bg-indigo-600 text-white rounded-2xl font-bold flex justify-center items-center gap-2">
                                    {submitting ? <Loader2 className="animate-spin" size={20}/> : (editingId ? "Enregistrer" : "Assigner")}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={handleCancelEdit} className="px-6 mt-4 bg-slate-100 rounded-2xl font-bold text-slate-600 flex items-center">
                                        <X size={20}/>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <Users className="text-indigo-600" size={20}/> Affectations ({filteredAssignments.length})
                            </h2>
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input type="text" placeholder="Rechercher..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none outline-none text-sm focus:ring-2 focus:ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Enseignant</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Classe/Matière</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredAssignments.map((as) => (
                                        <tr key={as.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-slate-700 uppercase text-xs">{as.user?.last_name}</p>
                                                <p className="text-[11px] text-slate-400">{as.user?.first_name}</p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase">{as.classroom?.name}</span>
                                                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-black uppercase">{as.subject?.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 flex justify-center gap-2">
                                                <button onClick={() => handleEditStart(as)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl"><Edit2 size={18} /></button>
                                                <button onClick={() => handleDelete(as.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={18} /></button>
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