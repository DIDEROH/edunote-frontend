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
import usePrintable from "../utils/usePrintable";
import PrintableTable from "../components/print/PrintableTable";

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
    const { printRef, print } = usePrintable("Liste des chefs d'etablissement");

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
            onPrint: print,
        });

        return () => setNavbarActions({});
    }, [setNavbarActions, print]);

    /**
     * Rechargement auto
     */
    useEffect(() => {
        fetchDirectors();
    }, [debouncedSearch, filters]);

    return (
        <div className="min-h-screen bg-base-100">
            <PrintableTable
                ref={printRef}
                title="Liste des chefs d'etablissement"
                meta={[{ label: "Total", value: directors.length }]}
                columns={[
                    { key: "index", label: "#" },
                    { key: "name", label: "Noms et Prenoms" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Telephone" },
                    { key: "school", label: "Ecole" },
                    { key: "year", label: "Annee" },
                ]}
                rows={directors.map((director, index) => {
                    const assignment = director.active_director_assignment;
                    return {
                        id: director.id,
                        index: index + 1,
                        name: `${director.first_name} ${director.last_name}`,
                        email: director.email || "-",
                        phone: director.phone || "-",
                        school: assignment?.school?.name || "Non affecte",
                        year: assignment?.academic_year?.name || "-",
                    };
                })}
            />

            <PageHeader
                title="Liste des chefs d'établissement"
                subtitle="Vue d'ensemble des responsables d'administration"
                onSearch={handleSearchDirector}
            />

            {loading ? (
                <LoadingSkeletoon />
            ) : (
                <div className="max-w-7xl mx-auto p-4 lg:p-8">
                    <div className="flex gap-4 mb-6">
                        <Card4
                            icon={ShieldCheck}
                            title={directors.length || "0"}
                            subtitle="Chefs d'établissements actifs"
                        />
                    </div>

                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {directors.length === 0 ? (
                            <div className="col-span-full bg-base-200 rounded-md p-10 text-center">
                                <ShieldCheck className="mx-auto h-10 w-10 text-base-content/25 mb-4" />

                                <h3 className="text-base font-semibold text-base-content">
                                    Aucun chef d'établissement trouvé
                                </h3>

                                <p className="text-sm text-base-content/60 mt-2">
                                    Modifiez vos critères de recherche ou vos filtres.
                                </p>
                            </div>
                        ) : (
                            directors.map((director) => {
                                const assignment = director.active_director_assignment;

                                return (
                                    <article
                                        key={director.id}
                                        className="bg-base-200 rounded-md p-5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <LuUser className="h-6 w-6 text-primary" />
                                            </div>

                                            <div className="flex-1 space-y-0.5">
                                                <h3 className="font-medium text-sm text-base-content">
                                                    {director.first_name} {director.last_name}
                                                </h3>

                                                <p className="text-xs text-base-content/60">
                                                    {director.email}
                                                </p>

                                                {director.phone && (
                                                    <p className="text-xs text-base-content/60">
                                                        {director.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {assignment ? (
                                            <div className="mt-5 space-y-2.5">
                                                <div>
                                                    <span className="text-xs text-base-content/50">
                                                        École
                                                    </span>

                                                    <p className="text-sm font-medium text-base-content">
                                                        {assignment.school?.name || "-"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <span className="text-xs text-base-content/50">
                                                        Ville
                                                    </span>

                                                    <p className="text-sm font-medium text-base-content">
                                                        {assignment.school?.city || "-"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <span className="text-xs text-base-content/50">
                                                        Année académique
                                                    </span>

                                                    <p className="text-sm font-medium text-base-content">
                                                        {assignment.academic_year?.name || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-base-100 text-base-content/50 text-xs text-center p-5 mt-4 rounded-md">
                                                Ce chef d'établissement n'est assigné à aucune école
                                            </div>
                                        )}

                                        <button
                                            onClick={() =>
                                                handleOpenAssignmentModal(director)
                                            }
                                            className="w-full mt-5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:brightness-95"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4">
                    <div className="w-full h-full sm:h-auto sm:max-w-lg sm:rounded-md bg-base-200 overflow-y-auto">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <Filter className="h-4 w-4 text-primary" />

                                <h2 className="text-base font-semibold text-base-content">
                                    Filtres avancés
                                </h2>
                            </div>

                            <button
                                onClick={() => setShowFiltersModal(false)}
                                className="rounded-md p-2 hover:bg-base-300 transition-colors duration-150"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-5 p-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-base-content/70">
                                    Ville
                                </label>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />

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
                                        className="w-full rounded-md bg-base-100 py-2.5 pl-10 pr-4 text-sm outline-none"
                                    />
                                </div>
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

            {showAssignmentModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-0 sm:p-4">
                    <div className="w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-md bg-base-200 overflow-y-auto">
                        <div className="flex items-center justify-between p-6">
                            <div>
                                <h2 className="text-base font-semibold text-base-content">
                                    Gérer l'affectation
                                </h2>

                                <p className="text-sm text-base-content/60">
                                    {selectedDirector?.first_name} {selectedDirector?.last_name}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowAssignmentModal(false)}
                                className="rounded-md p-2 hover:bg-base-300 transition-colors duration-150"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid gap-6 p-6 lg:grid-cols-2">
                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-base-content/70">
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
                                        className="w-full rounded-md p-2.5 bg-base-100 text-sm outline-none"
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
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-base-content/70">
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
                                        className="w-full rounded-md p-2.5 bg-base-100 text-sm outline-none"
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
                                    className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:brightness-95 disabled:opacity-50"
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
                                <h3 className="font-medium text-sm mb-4 text-base-content">
                                    Historique des affectations
                                </h3>

                                <div className="space-y-2.5 max-h-100 overflow-y-auto">
                                    {assignmentLoading ? (
                                        <p className="text-sm text-base-content/60">
                                            Chargement...
                                        </p>
                                    ) : assignmentHistory.length === 0 ? (
                                        <div className="rounded-md p-6 text-center text-sm text-base-content/50 bg-base-100">
                                            Aucune affectation.
                                        </div>
                                    ) : (
                                        assignmentHistory.map((assignment) => (
                                            <div
                                                key={assignment.id}
                                                className="rounded-md p-4 bg-base-100"
                                            >
                                                <p className="font-medium text-sm text-base-content">
                                                    {assignment.school?.name}
                                                </p>

                                                <p className="text-sm text-base-content/60">
                                                    {assignment.school?.city}
                                                </p>

                                                <p className="text-sm text-base-content/60">
                                                    {assignment.academic_year?.name}
                                                </p>

                                                <button
                                                    onClick={() =>
                                                        handleDeleteAssignment(
                                                            assignment.id
                                                        )
                                                    }
                                                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-error"
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