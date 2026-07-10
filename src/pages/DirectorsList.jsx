import { useEffect, useState } from "react";
import {
    ShieldCheck,
    X,
    Filter,
    Search,
    Building2,
    GraduationCap,
    Trash2,
    Plus,
} from "lucide-react";
import { api } from "../utils/AxiosClient";
import { toast } from "sonner";
import { useOutletContext } from "react-router-dom";
import LoadingSkeletoon from "../components/LoadingSkeletoon";
import PageHeader from "../components/elements/PageHeader";
import { Card4 } from "../components/ui/CardsComponents";
import { LuUser } from "react-icons/lu";

function DirectorsList() {
    const [directors, setDirectors] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [schools, setSchools] = useState([]);

    const [loading, setLoading] = useState(false);
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [assignmentSaving, setAssignmentSaving] = useState(false);

    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);

    const [selectedDirector, setSelectedDirector] = useState(null);
    const [assignmentHistory, setAssignmentHistory] = useState([]);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [filters, setFilters] = useState({
        city: "",
        academic_year_id: "",
    });

    const [assignmentForm, setAssignmentForm] = useState({
        school_id: "",
        academic_year_id: "",
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
     * Chargement des années académiques
     */
    const fetchAcademicYears = async () => {
        try {
            const { data } = await api.get("/academic-years");
            setAcademicYears(data.data || data);
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * Chargement des écoles
     */
    const fetchSchools = async () => {
        try {
            const { data } = await api.get("/schools");
            setSchools(data.data || data);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des écoles");
        }
    };

    /**
     * Chargement des directeurs
     */
    const fetchDirectors = async () => {
        setLoading(true);

        try {
            const params = {};

            if (debouncedSearch) {
                params.search = debouncedSearch;
            }

            if (filters.city) {
                params.city = filters.city;
            }

            if (filters.academic_year_id) {
                params.academic_year_id = filters.academic_year_id;
            }

            const { data } = await api.get("/users/directors", {
                params,
            });

            setDirectors(data.data || []);
        } catch (error) {
            toast.error(
                "Erreur lors du chargement des chefs d'établissement"
            );

            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Historique des affectations
     */
    const fetchDirectorAssignments = async (directorId) => {
        setAssignmentLoading(true);

        try {
            const { data } = await api.get(
                `/users/${directorId}/director-assignments`
            );

            setAssignmentHistory(data.data || data);
        } catch (error) {
            console.error(error);

            toast.error(
                "Erreur lors du chargement des affectations"
            );
        } finally {
            setAssignmentLoading(false);
        }
    };

    /**
     * Ouvrir modal affectation
     */
    const handleOpenAssignmentModal = async (director) => {
        setSelectedDirector(director);

        setAssignmentForm({
            school_id: "",
            academic_year_id: "",
        });

        setShowAssignmentModal(true);

        await fetchDirectorAssignments(director.id);
    };

    /**
     * Enregistrer affectation
     */
    const handleAssignDirector = async () => {
        if (
            !assignmentForm.school_id ||
            !assignmentForm.academic_year_id
        ) {
            toast.warning("Veuillez remplir tous les champs");

            return;
        }

        setAssignmentSaving(true);

        try {
            await api.post(
                `/users/${selectedDirector.id}/director-assignments`,
                assignmentForm
            );

            toast.success("Affectation enregistrée");

            await fetchDirectorAssignments(selectedDirector.id);
            await fetchDirectors();

            setAssignmentForm({
                school_id: "",
                academic_year_id: "",
            });
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                    "Erreur lors de l'affectation"
            );
        } finally {
            setAssignmentSaving(false);
        }
    };

    /**
     * Supprimer affectation
     */
    const handleDeleteAssignment = async (assignmentId) => {
        try {
            await api.delete(
                `/director-assignments/${assignmentId}`
            );

            toast.success("Affectation supprimée");

            await fetchDirectorAssignments(selectedDirector.id);
            await fetchDirectors();
        } catch (error) {
            console.error(error);

            toast.error(
                "Erreur lors de la suppression"
            );
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
        fetchDirectors();
    };

    const handleResetFilters = () => {
        setFilters({
            city: "",
            academic_year_id: "",
        });
    };

    /**
     * Recherche
     */
    const handleSearchDirector = (value) => {
        setSearch(value);
    };

    /**
     * Chargement initial
     */
    useEffect(() => {
        fetchAcademicYears();
        fetchSchools();

        setNavbarActions({
            onFilter: handleShowFiltersOptions,
        });

        return () => setNavbarActions({});
    }, [setNavbarActions]);

    /**
     * Rechargement auto
     */
    useEffect(() => {
        fetchDirectors();
    }, [debouncedSearch, filters]);

    return (
        <div className="min-h-screen bg-slate-50/50">
            <PageHeader
                title="Liste des chefs d'établissement"
                subtitle="Vue d'ensemble des responsables d'administration"
                onSearch={handleSearchDirector}
            />

            {loading ? (
                <LoadingSkeletoon />
            ) : (
                <div className="max-w-7xl mx-auto p-4 lg:p-8">
                    <div className="flex gap-4 mb-8">
                        <Card4
                            icon={ShieldCheck}
                            title={directors.length || "0"}
                            subtitle="Chefs d'établissements actifs"
                        />
                    </div>

                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {directors.length === 0 ? (
                            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center">
                                <ShieldCheck className="mx-auto h-12 w-12 text-slate-300 mb-4" />

                                <h3 className="text-lg font-semibold text-slate-700">
                                    Aucun chef d'établissement trouvé
                                </h3>

                                <p className="text-slate-500 mt-2">
                                    Modifiez vos critères de recherche ou vos filtres.
                                </p>
                            </div>
                        ) : (
                            directors.map((director) => {
                                const assignment = director.active_director_assignment;

                                return (
                                    <article
                                        key={director.id}
                                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                                                <LuUser className="h-7 w-7 text-blue-600" />
                                            </div>

                                            <div className="flex-1 space-y-1">
                                                <h3 className="font-semibold text-slate-900">
                                                    {director.first_name} {director.last_name}
                                                </h3>

                                                <p className="text-sm text-slate-500 italic">
                                                    {director.email}
                                                </p>

                                                {director.phone && (
                                                    <p className="text-sm text-slate-500">
                                                        {director.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {assignment ? (
                                            <div className="mt-6 space-y-3">
                                                <div>
                                                    <span className="text-xs text-slate-400">
                                                        École
                                                    </span>

                                                    <p className="font-medium text-slate-700">
                                                        {assignment.school?.name || "-"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <span className="text-xs text-slate-400">
                                                        Ville
                                                    </span>

                                                    <p className="font-medium text-slate-700">
                                                        {assignment.school?.city || "-"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <span className="text-xs text-slate-400">
                                                        Année académique
                                                    </span>

                                                    <p className="font-medium text-slate-700">
                                                        {assignment.academic_year?.name || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-100 text-slate-500 text-xs text-center p-6 mt-4 rounded-2xl">
                                                Ce chef d'établissement n'est assigné à aucune école
                                            </div>
                                        )}

                                        <button
                                            onClick={() =>
                                                handleOpenAssignmentModal(director)
                                            }
                                            className="w-full mt-6 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            Gérer l'affectation
                                        </button>
                                    </article>
                                );
                            })
                        )}
                    </section>
                </div>
            )}

            {showFiltersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 p-6">
                            <div className="flex items-center gap-3">
                                <Filter className="h-5 w-5 text-blue-600" />

                                <h2 className="text-lg font-semibold">
                                    Filtres avancés
                                </h2>
                            </div>

                            <button
                                onClick={() => setShowFiltersModal(false)}
                                className="rounded-full p-2 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-6 p-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Ville
                                </label>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        type="text"
                                        placeholder="Ex : Douala"
                                        value={filters.city}
                                        onChange={(e) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                city: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
                                    />
                                </div>
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
                                className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                            >
                                Appliquer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAssignmentModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b p-6">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Gérer l'affectation
                                </h2>

                                <p className="text-sm text-slate-500">
                                    {selectedDirector?.first_name} {selectedDirector?.last_name}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowAssignmentModal(false)}
                                className="rounded-full p-2 hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid gap-8 p-6 lg:grid-cols-2">
                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                        <Building2 size={16} />
                                        École
                                    </label>

                                    <select
                                        value={assignmentForm.school_id}
                                        onChange={(e) =>
                                            setAssignmentForm((prev) => ({
                                                ...prev,
                                                school_id: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border p-3"
                                    >
                                        <option value="">
                                            Sélectionner une école
                                        </option>

                                        {schools.map((school) => (
                                            <option
                                                key={school.id}
                                                value={school.id}
                                            >
                                                {school.name} - {school.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                        <GraduationCap size={16} />
                                        Année académique
                                    </label>

                                    <select
                                        value={assignmentForm.academic_year_id}
                                        onChange={(e) =>
                                            setAssignmentForm((prev) => ({
                                                ...prev,
                                                academic_year_id: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border p-3"
                                    >
                                        <option value="">
                                            Sélectionner une année
                                        </option>

                                        {academicYears.map((year) => (
                                            <option
                                                key={year.id}
                                                value={year.id}
                                            >
                                                {year.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={handleAssignDirector}
                                    disabled={assignmentSaving}
                                    className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Plus size={18} />

                                        {assignmentSaving
                                            ? "Enregistrement..."
                                            : "Enregistrer l'affectation"}
                                    </div>
                                </button>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-4">
                                    Historique des affectations
                                </h3>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {assignmentLoading ? (
                                        <p className="text-sm text-slate-500">
                                            Chargement...
                                        </p>
                                    ) : assignmentHistory.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">
                                            Aucune affectation.
                                        </div>
                                    ) : (
                                        assignmentHistory.map((assignment) => (
                                            <div
                                                key={assignment.id}
                                                className="rounded-2xl border p-4"
                                            >
                                                <p className="font-medium">
                                                    {assignment.school?.name}
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    {assignment.school?.city}
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    {assignment.academic_year?.name}
                                                </p>

                                                <button
                                                    onClick={() =>
                                                        handleDeleteAssignment(
                                                            assignment.id
                                                        )
                                                    }
                                                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                    Supprimer
                                                </button>
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

export default DirectorsList;