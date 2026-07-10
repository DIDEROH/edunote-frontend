import { useEffect, useState } from "react";
import {
    X,
    Filter,
    Building2,
    GraduationCap,
    Trash2,
    Plus,
    BookOpen,
    Users
} from "lucide-react";
import { api } from "../utils/AxiosClient";
import { toast } from "sonner";
import { useOutletContext } from "react-router-dom";
import LoadingSkeletoon from "../components/LoadingSkeletoon";
import PageHeader from "../components/elements/PageHeader";
import { Card4 } from "../components/ui/CardsComponents";
import { LuUser } from "react-icons/lu";

function TeachersList() {
    const [teachers, setTeachers] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [schools, setSchools] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [loading, setLoading] = useState(false);
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [assignmentSaving, setAssignmentSaving] = useState(false);

    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);

    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [assignmentHistory, setAssignmentHistory] = useState([]);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [filters, setFilters] = useState({
        school_id: "",
        academic_year_id: "",
        classroom_id: "",
        subject_id: "",
    });

    const [assignmentForm, setAssignmentForm] = useState({
        school_id: "",
    });

    const { setNavbarActions } = useOutletContext();

    /**
     * Debounce recherche
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    /**
     * Chargement des données de référence (Années, Ecoles, Classes, Matières)
     */
    const fetchReferenceData = async () => {
        try {
            const [yearsRes, schoolsRes, classroomsRes, subjectsRes] = await Promise.all([
                api.get("/academic-years"),
                api.get("/schools"),
                api.get("/classrooms").catch(() => ({ data: [] })), // Remplacer par ta route
                api.get("/subjects").catch(() => ({ data: [] }))    // Remplacer par ta route
            ]);

            setAcademicYears(yearsRes.data.data || yearsRes.data);
            setSchools(schoolsRes.data.data || schoolsRes.data);
            setClassrooms(classroomsRes.data.data || classroomsRes.data);
            setSubjects(subjectsRes.data.data || subjectsRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des données de référence");
        }
    };

    /**
     * Chargement des enseignants
     */
    const fetchTeachers = async () => {
        setLoading(true);

        try {
            const params = {};

            if (debouncedSearch) params.search = debouncedSearch;
            if (filters.school_id) params.school_id = filters.school_id;
            if (filters.academic_year_id) params.academic_year_id = filters.academic_year_id;
            if (filters.classroom_id) params.classroom_id = filters.classroom_id;
            if (filters.subject_id) params.subject_id = filters.subject_id;

            const { data } = await api.get("/users/teachers", { params });

            setTeachers(data.data || []);
        } catch (error) {
            toast.error("Erreur lors du chargement des enseignants");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Historique des affectations
     */
    const fetchTeacherAssignments = async (teacherId) => {
        setAssignmentLoading(true);

        try {
            // Assure-toi que cette route existe dans ton api.php
            const { data } = await api.get(`/teachers/${teacherId}/assignments`);
            setAssignmentHistory(data.data || data);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des affectations");
        } finally {
            setAssignmentLoading(false);
        }
    };

    /**
     * Ouvrir modal affectation
     */
    const handleOpenAssignmentModal = async (teacher) => {
        setSelectedTeacher(teacher);

        setAssignmentForm({
            school_id: "",
        });

        setShowAssignmentModal(true);
        await fetchTeacherAssignments(teacher.id);
    };

    /**
     * Enregistrer affectation
     */
    const handleAssignTeacher = async () => {
        if (!assignmentForm.school_id) {
            toast.warning("Veuillez sélectionner une école");
            return;
        }

        setAssignmentSaving(true);

        try {
            await api.post(`/teachers/${selectedTeacher.id}/assignments`, assignmentForm);
            
            toast.success("Affectation de l'enseignant enregistrée");

            await fetchTeacherAssignments(selectedTeacher.id);
            await fetchTeachers(); // Pour rafraîchir les données de la liste principale

            setAssignmentForm({
                school_id: "",
                academic_year_id: "",
                classroom_id: "",
                subject_id: "",
            });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Erreur lors de l'affectation");
        } finally {
            setAssignmentSaving(false);
        }
    };

    /**
     * Supprimer affectation
     */
    const handleDeleteAssignment = async (assignmentId) => {
        try {
            await api.delete(`/teachers/${assignmentId}`);
            toast.success("Affectation supprimée");

            await fetchTeacherAssignments(selectedTeacher.id);
            await fetchTeachers();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la suppression");
        }
    };

    /**
     * Modal filtres
     */
    const handleShowFiltersOptions = () => {
        setShowFiltersModal(true);
    };

    const handleApplyFilters = () => {
        setShowFiltersModal(false);
        fetchTeachers();
    };

    const handleResetFilters = () => {
        setFilters({
            school_id: "",
            academic_year_id: "",
            classroom_id: "",
            subject_id: "",
        });
    };

    /**
     * Recherche
     */
    const handleSearchTeacher = (value) => {
        setSearch(value);
    };

    /**
     * Chargement initial
     */
    useEffect(() => {
        fetchReferenceData();

        setNavbarActions({
            onFilter: handleShowFiltersOptions,
        });

        return () => setNavbarActions({});
    }, [setNavbarActions]);

    /**
     * Rechargement auto
     */
    useEffect(() => {
        fetchTeachers();
    }, [debouncedSearch, filters]);

    return (
        <div className="min-h-screen bg-slate-50/50">
            <PageHeader
                title="Liste des Enseignants"
                subtitle="Vue d'ensemble et affectations du corps professoral"
                onSearch={handleSearchTeacher}
            />

            {loading ? (
                <LoadingSkeletoon />
            ) : (
                <div className="max-w-7xl mx-auto p-4 lg:p-8">
                    <div className="flex gap-4 mb-8">
                        <Card4
                             icon={GraduationCap}
                            title={teachers.length || "0"}
                            subtitle="Enseignants enregistrés"
                        />
                    </div>

                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {teachers.length === 0 ? (
                            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center">
                                <GraduationCap className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700">
                                    Aucun enseignant trouvé
                                </h3>
                                <p className="text-slate-500 mt-2">
                                    Modifiez vos critères de recherche ou vos filtres.
                                </p>
                            </div>
                        ) : (
                            teachers.map((teacher) => {
                                const assignments = teacher.teacher_assignments || [];
                                const assignmentsCount = assignments.length;

                                return (
                                    <article
                                        key={teacher.id}
                                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <LuUser className="h-7 w-7 text-indigo-600" />
                                                </div>

                                                <div className="flex-1 space-y-1">
                                                    <h3 className="font-semibold text-slate-900">
                                                        {teacher.first_name} {teacher.last_name}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 italic">
                                                        {teacher.email}
                                                    </p>
                                                    {teacher.phone && (
                                                        <p className="text-sm text-slate-500">
                                                            {teacher.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-6">
                                                {assignmentsCount > 0 ? (
                                                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                                            Affectations actives
                                                        </p>
                                                        <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                                            <BookOpen size={16} className="text-indigo-500" />
                                                            {assignmentsCount} {assignmentsCount > 1 ? 'Matières enseignées' : 'Matière enseignée'}
                                                        </div>
                                                        <div className="mt-2 text-xs text-slate-500">
                                                            Dernière: {assignments[assignmentsCount - 1]?.subject?.name} ({assignments[assignmentsCount - 1]?.classroom?.name})
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-orange-50 text-orange-600 text-xs text-center p-4 rounded-xl border border-orange-100">
                                                        Aucune affectation définie
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleOpenAssignmentModal(teacher)}
                                            className="w-full mt-6 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700"
                                        >
                                            Gérer les affectations
                                        </button>
                                    </article>
                                );
                            })
                        )}
                    </section>
                </div>
            )}

            {/* Modal des filtres avancés */}
            {showFiltersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 p-6">
                            <div className="flex items-center gap-3">
                                <Filter className="h-5 w-5 text-indigo-600" />
                                <h2 className="text-lg font-semibold">Filtres avancés</h2>
                            </div>
                            <button
                                onClick={() => setShowFiltersModal(false)}
                                className="rounded-full p-2 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            {/* Filtre Ecole */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">École</label>
                                <select
                                    value={filters.school_id}
                                    onChange={(e) => setFilters(prev => ({ ...prev, school_id: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-300 py-3 px-4 outline-none focus:border-indigo-500"
                                >
                                    <option value="">Toutes les écoles</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            {/* Filtre Année */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Année académique</label>
                                <select
                                    value={filters.academic_year_id}
                                    onChange={(e) => setFilters(prev => ({ ...prev, academic_year_id: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-300 py-3 px-4 outline-none focus:border-indigo-500"
                                >
                                    <option value="">Toutes les années</option>
                                    {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                </select>
                            </div>

                            {/* Filtre Classe */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Classe</label>
                                <select
                                    value={filters.classroom_id}
                                    onChange={(e) => setFilters(prev => ({ ...prev, classroom_id: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-300 py-3 px-4 outline-none focus:border-indigo-500"
                                >
                                    <option value="">Toutes les classes</option>
                                    {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Filtre Matière */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Matière</label>
                                <select
                                    value={filters.subject_id}
                                    onChange={(e) => setFilters(prev => ({ ...prev, subject_id: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-300 py-3 px-4 outline-none focus:border-indigo-500"
                                >
                                    <option value="">Toutes les matières</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-200 p-6">
                            <button
                                onClick={handleResetFilters}
                                className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Réinitialiser
                            </button>
                            <button
                                onClick={handleApplyFilters}
                                className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700"
                            >
                                Appliquer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'affectation multiple */}
            {showAssignmentModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b p-6 shrink-0">
                            <div>
                                <h2 className="text-xl font-semibold">Gérer les affectations</h2>
                                <p className="text-sm text-slate-500">
                                    {selectedTeacher?.first_name} {selectedTeacher?.last_name}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAssignmentModal(false)}
                                className="rounded-full p-2 hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid gap-8 p-6 lg:grid-cols-2 overflow-y-auto">
                            {/* Formulaire d'affectation */}
                            <div className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-100 h-fit">
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Plus size={18} /> Nouvelle affectation
                                </h3>
                                
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium"><Building2 size={16} /> École</label>
                                    <select
                                        value={assignmentForm.school_id}
                                        onChange={(e) => setAssignmentForm(prev => ({ ...prev, school_id: e.target.value }))}
                                        className="w-full rounded-xl border p-3 bg-white"
                                    >
                                        <option value="">Sélectionner une école</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name} - {s.city}</option>)}
                                    </select>
                                </div>


                                <button
                                    onClick={handleAssignTeacher}
                                    disabled={assignmentSaving}
                                    className="w-full mt-4 rounded-xl bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-all"
                                >
                                    {assignmentSaving ? "Enregistrement..." : "Enregistrer l'affectation"}
                                </button>
                            </div>

                            {/* Historique des affectations */}
                            <div>
                                <h3 className="font-semibold mb-4 text-slate-800">
                                    Affectations actuelles ({assignmentHistory.length})
                                </h3>

                                <div className="space-y-3">
                                    {assignmentLoading ? (
                                        <LoadingSkeletoon />
                                    ) : assignmentHistory.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500 bg-slate-50">
                                            Aucune affectation définie pour cet enseignant.
                                        </div>
                                    ) : (
                                        assignmentHistory.map((assignment) => (
                                            <div key={assignment.id} className="rounded-2xl border border-slate-200 p-4 hover:border-indigo-200 transition-colors bg-white">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm">
                                                            {assignment.subject?.name}
                                                        </p>
                                                        <p className="text-sm font-medium text-indigo-600 mt-0.5">
                                                            Classe: {assignment.classroom?.name}
                                                        </p>
                                                        <div className="text-xs text-slate-500 mt-2 space-y-1">
                                                            <p>École: {assignment.school?.name}</p>
                                                            <p>Année: {assignment.academic_year?.name}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <button
                                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Supprimer cette affectation"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeachersList;