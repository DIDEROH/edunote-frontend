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
import usePrintable from "../utils/usePrintable";
import PrintableTable from "../components/print/PrintableTable";

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
    const { printRef, print } = usePrintable("Liste des enseignants");

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
            onPrint: print,
        });

        return () => setNavbarActions({});
    }, [setNavbarActions, print]);

    /**
     * Rechargement auto
     */
    useEffect(() => {
        fetchTeachers();
    }, [debouncedSearch, filters]);

    return (
        <div className="min-h-screen bg-base-100">
            <PrintableTable
                ref={printRef}
                title="Liste des enseignants"
                meta={[{ label: "Total", value: teachers.length }]}
                columns={[
                    { key: "index", label: "#" },
                    { key: "name", label: "Noms et Prenoms" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Telephone" },
                    { key: "assignments", label: "Affectations" },
                ]}
                rows={teachers.map((teacher, index) => {
                    const assignments = teacher.teacher_assignments || [];
                    return {
                        id: teacher.id,
                        index: index + 1,
                        name: `${teacher.first_name} ${teacher.last_name}`,
                        email: teacher.email || "-",
                        phone: teacher.phone || "-",
                        assignments: assignments.length
                            ? assignments.map(a => `${a.subject?.name || "?"} (${a.classroom?.name || "?"})`).join(", ")
                            : "Aucune",
                    };
                })}
            />

            <PageHeader
                title="Liste des Enseignants"
                subtitle="Vue d'ensemble et affectations du corps professoral"
                onSearch={handleSearchTeacher}
            />

            {loading ? (
                <LoadingSkeletoon />
            ) : (
                <div className="max-w-7xl mx-auto p-4 lg:p-8">
                    <div className="flex gap-4 mb-6">
                        <Card4
                             icon={GraduationCap}
                            title={teachers.length || "0"}
                            subtitle="Enseignants enregistrés"
                        />
                    </div>

                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {teachers.length === 0 ? (
                            <div className="col-span-full bg-base-200 rounded-md p-10 text-center">
                                <GraduationCap className="mx-auto h-10 w-10 text-base-content/25 mb-4" />
                                <h3 className="text-base font-semibold text-base-content">
                                    Aucun enseignant trouvé
                                </h3>
                                <p className="text-sm text-base-content/60 mt-2">
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
                                        className="bg-base-200 rounded-md p-5 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <LuUser className="h-6 w-6 text-primary" />
                                                </div>

                                                <div className="flex-1 space-y-0.5">
                                                    <h3 className="font-medium text-sm text-base-content">
                                                        {teacher.first_name} {teacher.last_name}
                                                    </h3>
                                                    <p className="text-xs text-base-content/60">
                                                        {teacher.email}
                                                    </p>
                                                    {teacher.phone && (
                                                        <p className="text-xs text-base-content/60">
                                                            {teacher.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                {assignmentsCount > 0 ? (
                                                    <div className="rounded-md bg-base-100 p-4">
                                                        <p className="text-xs font-medium text-base-content/50 mb-2">
                                                            Affectations actives
                                                        </p>
                                                        <div className="flex items-center gap-2 text-sm text-base-content font-medium">
                                                            <BookOpen size={15} className="text-primary" />
                                                            {assignmentsCount} {assignmentsCount > 1 ? 'Matières enseignées' : 'Matière enseignée'}
                                                        </div>
                                                        <div className="mt-2 text-xs text-base-content/50">
                                                            Dernière: {assignments[assignmentsCount - 1]?.subject?.name} ({assignments[assignmentsCount - 1]?.classroom?.name})
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-warning/10 text-warning text-xs text-center p-4 rounded-md">
                                                        Aucune affectation définie
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleOpenAssignmentModal(teacher)}
                                            className="w-full mt-5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:brightness-95"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4">
                    <div className="w-full h-full sm:h-auto sm:max-w-lg sm:rounded-md bg-base-200 overflow-y-auto">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <Filter className="h-4 w-4 text-primary" />
                                <h2 className="text-base font-semibold text-base-content">Filtres avancés</h2>
                            </div>
                            <button
                                onClick={() => setShowFiltersModal(false)}
                                className="rounded-md p-2 hover:bg-base-300 transition-colors duration-150"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            {/* Filtre Ecole */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-base-content/70">École</label>
                                <select
                                    value={filters.school_id}
                                    onChange={(e) => setFilters(prev => ({ ...prev, school_id: e.target.value }))}
                                    className="w-full rounded-md bg-base-100 py-2.5 px-4 text-sm outline-none"
                                >
                                    <option value="">Toutes les écoles</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            {/* Filtre Année */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-base-content/70">Année académique</label>
                                <select
                                    value={filters.academic_year_id}
                                    onChange={(e) => setFilters(prev => ({ ...prev, academic_year_id: e.target.value }))}
                                    className="w-full rounded-md bg-base-100 py-2.5 px-4 text-sm outline-none"
                                >
                                    <option value="">Toutes les années</option>
                                    {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                </select>
                            </div>

                            {/* Filtre Classe */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-base-content/70">Classe</label>
                                <select
                                    value={filters.classroom_id}
                                    onChange={(e) => setFilters(prev => ({ ...prev, classroom_id: e.target.value }))}
                                    className="w-full rounded-md bg-base-100 py-2.5 px-4 text-sm outline-none"
                                >
                                    <option value="">Toutes les classes</option>
                                    {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Filtre Matière */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-base-content/70">Matière</label>
                                <select
                                    value={filters.subject_id}
                                    onChange={(e) => setFilters(prev => ({ ...prev, subject_id: e.target.value }))}
                                    className="w-full rounded-md bg-base-100 py-2.5 px-4 text-sm outline-none"
                                >
                                    <option value="">Toutes les matières</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6">
                            <button
                                onClick={handleResetFilters}
                                className="rounded-md bg-base-100 px-5 py-2.5 text-sm font-medium text-base-content transition-colors duration-150 hover:bg-base-300"
                            >
                                Réinitialiser
                            </button>
                            <button
                                onClick={handleApplyFilters}
                                className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:brightness-95"
                            >
                                Appliquer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'affectation multiple */}
            {showAssignmentModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-0 sm:p-4">
                    <div className="w-full h-full sm:h-auto sm:max-w-5xl sm:rounded-md bg-base-200 flex flex-col sm:max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 shrink-0">
                            <div>
                                <h2 className="text-base font-semibold text-base-content">Gérer les affectations</h2>
                                <p className="text-sm text-base-content/60">
                                    {selectedTeacher?.first_name} {selectedTeacher?.last_name}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAssignmentModal(false)}
                                className="rounded-md p-2 hover:bg-base-300 transition-colors duration-150"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid gap-6 p-6 lg:grid-cols-2 overflow-y-auto">
                            {/* Formulaire d'affectation */}
                            <div className="space-y-5 bg-base-100 p-6 rounded-md h-fit">
                                <h3 className="font-medium text-sm text-base-content mb-4 flex items-center gap-2">
                                    <Plus size={16} /> Nouvelle affectation
                                </h3>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-base-content/70"><Building2 size={16} /> École</label>
                                    <select
                                        value={assignmentForm.school_id}
                                        onChange={(e) => setAssignmentForm(prev => ({ ...prev, school_id: e.target.value }))}
                                        className="w-full rounded-md p-2.5 bg-base-200 text-sm outline-none"
                                    >
                                        <option value="">Sélectionner une école</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name} - {s.city}</option>)}
                                    </select>
                                </div>


                                <button
                                    onClick={handleAssignTeacher}
                                    disabled={assignmentSaving}
                                    className="w-full mt-4 rounded-md bg-primary py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:brightness-95 disabled:opacity-50"
                                >
                                    {assignmentSaving ? "Enregistrement..." : "Enregistrer l'affectation"}
                                </button>
                            </div>

                            {/* Historique des affectations */}
                            <div>
                                <h3 className="font-medium text-sm mb-4 text-base-content">
                                    Affectations actuelles ({assignmentHistory.length})
                                </h3>

                                <div className="space-y-2.5">
                                    {assignmentLoading ? (
                                        <LoadingSkeletoon />
                                    ) : assignmentHistory.length === 0 ? (
                                        <div className="rounded-md p-8 text-center text-sm text-base-content/50 bg-base-100">
                                            Aucune affectation définie pour cet enseignant.
                                        </div>
                                    ) : (
                                        assignmentHistory.map((assignment) => (
                                            <div key={assignment.id} className="rounded-md p-4 bg-base-100">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-base-content text-sm">
                                                            {assignment.subject?.name}
                                                        </p>
                                                        <p className="text-sm font-medium text-primary mt-0.5">
                                                            Classe: {assignment.classroom?.name}
                                                        </p>
                                                        <div className="text-xs text-base-content/50 mt-2 space-y-1">
                                                            <p>École: {assignment.school?.name}</p>
                                                            <p>Année: {assignment.academic_year?.name}</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                                        className="p-2 text-base-content/40 hover:text-error rounded-md transition-colors duration-150"
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