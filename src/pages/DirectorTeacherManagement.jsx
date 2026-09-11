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
        <div className="h-screen flex items-center justify-center bg-base-100">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
    )

    return (
        <main className="min-h-screen bg-base-100 pb-20">
            <PageHeader title="Affectations" subtitle="Gérez les enseignants par classe et matière" />
            <section className="max-w-7xl mx-auto mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                    <div className="bg-base-200 p-6 rounded-md sticky top-24">
                        <h2 className="text-base-content font-semibold text-base mb-5 flex items-center gap-2">
                            {editingId ? <Edit2 className="text-warning" size={18}/> : <Plus className="text-primary" size={18}/>}
                            {editingId ? "Modifier l'affectation" : "Nouvelle Affectation"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Enseignant</label>
                                <select
                                    className="w-full p-3 rounded-md bg-base-100 outline-none text-sm"
                                    value={formData.user_id}
                                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                                    required
                                >
                                    <option value="">Sélectionner...</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.last_name?.toUpperCase()} {t.first_name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Classe</label>
                                <select
                                    className="w-full p-3 rounded-md bg-base-100 outline-none text-sm"
                                    value={formData.classroom_id}
                                    onChange={(e) => handleClassroomChange(e.target.value)}
                                    required
                                >
                                    <option value="">Sélectionner...</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Matière</label>
                                <select
                                    className="w-full p-3 rounded-md bg-base-100 outline-none text-sm disabled:opacity-50"
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
                                <button type="submit" disabled={submitting} className="flex-1 py-3 mt-4 bg-primary text-white rounded-md text-sm font-medium transition-colors duration-150 hover:brightness-95 flex justify-center items-center gap-2">
                                    {submitting ? <Loader2 className="animate-spin" size={18}/> : (editingId ? "Enregistrer" : "Assigner")}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={handleCancelEdit} className="px-5 mt-4 bg-base-100 rounded-md text-sm font-medium text-base-content transition-colors duration-150 hover:bg-base-300 flex items-center">
                                        <X size={18}/>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-base-200 rounded-md overflow-hidden">
                        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="font-medium text-sm text-base-content flex items-center gap-2">
                                <Users className="text-primary" size={18}/> Affectations ({filteredAssignments.length})
                            </h2>
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" size={15} />
                                <input type="text" placeholder="Rechercher..." className="w-full pl-11 pr-4 py-2.5 rounded-md bg-base-100 outline-none text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        {/* Cartes mobiles */}
                        <div className="grid gap-2 p-4 pt-0 md:hidden">
                            {filteredAssignments.map((as) => (
                                <div key={as.id} className="rounded-md bg-base-100 p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-sm text-base-content">{as.user?.last_name} {as.user?.first_name}</p>
                                            <div className="mt-1.5 flex gap-2 text-xs">
                                                <span className="px-2 py-0.5 rounded-sm bg-primary/10 text-primary">{as.classroom?.name}</span>
                                                <span className="px-2 py-0.5 rounded-sm bg-base-300 text-base-content/70">{as.subject?.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEditStart(as)} className="p-2 text-warning hover:bg-warning/10 rounded-md transition-colors duration-150"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(as.id)} className="p-2 text-error hover:bg-error/10 rounded-md transition-colors duration-150"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tableau desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-4 text-xs font-medium text-base-content/50">Enseignant</th>
                                        <th className="p-4 text-xs font-medium text-base-content/50">Classe/Matière</th>
                                        <th className="p-4 text-xs font-medium text-base-content/50 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssignments.map((as, i) => (
                                        <tr key={as.id} className={`transition-colors duration-150 hover:bg-base-300 ${i % 2 === 1 ? 'bg-zebra' : ''}`}>
                                            <td className="p-4">
                                                <p className="font-medium text-base-content text-sm">{as.user?.last_name}</p>
                                                <p className="text-xs text-base-content/50">{as.user?.first_name}</p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <span className="px-2 py-1 rounded-sm bg-primary/10 text-primary text-xs font-medium">{as.classroom?.name}</span>
                                                    <span className="px-2 py-1 rounded-sm bg-base-300 text-base-content/70 text-xs font-medium">{as.subject?.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-1">
                                                    <button onClick={() => handleEditStart(as)} className="p-2 text-warning hover:bg-warning/10 rounded-md transition-colors duration-150"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDelete(as.id)} className="p-2 text-error hover:bg-error/10 rounded-md transition-colors duration-150"><Trash2 size={16} /></button>
                                                </div>
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
