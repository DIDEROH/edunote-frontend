import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { Building2, Filter, GraduationCap, Info, Plus, Trash2, UserCog, X } from "lucide-react";
import { LuUser } from "react-icons/lu";
import { api } from "../utils/AxiosClient";
import LoadingSkeletoon from "../components/LoadingSkeletoon";
import PageHeader from "../components/elements/PageHeader";
import { Card4 } from "../components/ui/CardsComponents";
import usePrintable from "../utils/usePrintable";
import PrintableTable from "../components/print/PrintableTable";
import useShowConfirm from "../hooks/UseShowConfirm";
import useNavbarRefresh from "../hooks/useNavbarRefresh";

const EMPTY_ASSIGNMENT = { school_id: "", academic_year_id: "" };

// Paramètres de la liste : recherche et filtre école
const listParams = (search, schoolId) => ({
    ...(search ? { search } : {}),
    ...(schoolId ? { school_id: schoolId } : {}),
});

/**
 * Assistants d'établissement (rôle "moderator") : rattachement à une école.
 * Un assistant consulte les élèves et génère les bulletins de son école,
 * sans pouvoir rien modifier.
 */
function ModeratorsList() {
    const [moderators, setModerators] = useState([]);
    const [schools, setSchools] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);
    // Incrémenté pour recharger la liste après une affectation
    const [reloadKey, setReloadKey] = useState(0);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [schoolFilter, setSchoolFilter] = useState("");
    const [showFiltersModal, setShowFiltersModal] = useState(false);

    const [selectedModerator, setSelectedModerator] = useState(null);
    const [assignmentHistory, setAssignmentHistory] = useState([]);
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [assignmentSaving, setAssignmentSaving] = useState(false);
    const [assignmentForm, setAssignmentForm] = useState(EMPTY_ASSIGNMENT);

    const { setNavbarActions } = useOutletContext();
    const { printRef, print } = usePrintable("Liste des assistants d'etablissement");
    const showConfirm = useShowConfirm();

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const reloadModerators = () => setReloadKey((key) => key + 1);

    const fetchAssignments = async (moderatorId) => {
        setAssignmentLoading(true);
        try {
            const { data } = await api.get(`/users/${moderatorId}/moderator-assignments`);
            setAssignmentHistory(data.data || data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setAssignmentLoading(false);
        }
    };

    const handleOpenAssignment = (moderator) => {
        setSelectedModerator(moderator);
        // Année active proposée par défaut
        const activeYear = academicYears.find((year) => year.is_active);
        setAssignmentForm({ school_id: "", academic_year_id: activeYear ? String(activeYear.id) : "" });
        fetchAssignments(moderator.id);
    };

    const handleAssign = async () => {
        if (!assignmentForm.school_id || !assignmentForm.academic_year_id) {
            toast.warning("Veuillez choisir une école et une année académique.");
            return;
        }

        setAssignmentSaving(true);
        try {
            await api.post(`/users/${selectedModerator.id}/moderator-assignments`, assignmentForm);
            toast.success("Affectation enregistrée");
            await fetchAssignments(selectedModerator.id);
            reloadModerators();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setAssignmentSaving(false);
        }
    };

    const handleDeleteAssignment = (assignment) => {
        showConfirm({
            title: "Retirer l'affectation",
            message: `Retirer ${selectedModerator?.first_name} de « ${assignment.school?.name} » pour ${assignment.academic_year?.name} ?`,
            onSuccess: async () => {
                try {
                    await api.delete(`/moderator-assignments/${assignment.id}`);
                    toast.success("Affectation supprimée");
                    await fetchAssignments(selectedModerator.id);
                    reloadModerators();
                } catch (error) {
                    toast.error(error.message);
                }
            },
        });
    };

    // Chargement initial des listes de référence
    useEffect(() => {
        api.get("/schools").then(({ data }) => setSchools(data.data || data)).catch((error) => toast.error(error.message));
        api.get("/academic-years").then(({ data }) => setAcademicYears(data.data || data)).catch(() => {});
    }, []);

    useEffect(() => {
        setNavbarActions({
            onFilter: () => setShowFiltersModal(true),
            onPrint: print,
        });
        return () => setNavbarActions({});
    }, [setNavbarActions, print]);

    // Chargement de la liste (recherche, filtre école, rechargement après affectation)
    useEffect(() => {
        let ignore = false;

        api.get("/users/moderators", { params: listParams(debouncedSearch, schoolFilter) })
            .then(({ data }) => { if (!ignore) setModerators(data.data || []); })
            .catch((error) => toast.error(error.message))
            .finally(() => { if (!ignore) setLoading(false); });

        return () => { ignore = true; };
    }, [debouncedSearch, schoolFilter, reloadKey]);

    // Actualiser : liste (recherche et filtre conservés), listes de référence
    // et historique de la fenêtre d'affectation si elle est ouverte
    useNavbarRefresh(() => Promise.all([
        api.get("/users/moderators", { params: listParams(debouncedSearch, schoolFilter) })
            .then(({ data }) => setModerators(data.data || [])),
        api.get("/schools").then(({ data }) => setSchools(data.data || data)),
        api.get("/academic-years").then(({ data }) => setAcademicYears(data.data || data)),
        selectedModerator && fetchAssignments(selectedModerator.id),
    ]));

    return (
        <div className="min-h-screen bg-base-100">
            <PrintableTable
                ref={printRef}
                title="Liste des assistants d'etablissement"
                meta={[{ label: "Total", value: moderators.length }]}
                columns={[
                    { key: "index", label: "#" },
                    { key: "name", label: "Noms et Prenoms" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Telephone" },
                    { key: "school", label: "Ecole" },
                    { key: "year", label: "Annee" },
                ]}
                rows={moderators.map((moderator, index) => {
                    const assignment = moderator.active_moderator_assignment;
                    return {
                        id: moderator.id,
                        index: index + 1,
                        name: `${moderator.first_name} ${moderator.last_name || ""}`,
                        email: moderator.email || "-",
                        phone: moderator.phone || "-",
                        school: assignment?.school?.name || "Non affecte",
                        year: assignment?.academic_year?.name || "-",
                    };
                })}
            />

            <PageHeader
                title="Assistants d'établissement"
                subtitle="Rattachez chaque assistant à une école : il consulte les élèves et les bulletins de cet établissement, sans pouvoir les modifier."
                onSearch={setSearch}
                searchPlaceholder="Rechercher un assistant..."
            />

            <div className="max-w-7xl mx-auto p-4 lg:p-8">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
                    <Card4 icon={UserCog} title={moderators.length || "0"} subtitle="Assistants enregistrés" />
                    <div className="flex flex-1 items-start gap-3 rounded-md bg-primary/10 p-4 text-sm text-base-content/70">
                        <Info size={16} className="mt-0.5 shrink-0 text-primary" />
                        <p>
                            Pour ajouter un assistant, attribuez d'abord le rôle <strong>moderator</strong> à son compte
                            dans « Gestion des utilisateurs », puis rattachez-le à une école ici.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <LoadingSkeletoon />
                ) : moderators.length === 0 ? (
                    <div className="rounded-md bg-base-200 p-10 text-center">
                        <UserCog className="mx-auto mb-4 h-10 w-10 text-base-content/25" />
                        <h3 className="text-base font-semibold text-base-content">Aucun assistant trouvé</h3>
                        <p className="mt-2 text-sm text-base-content/60">Modifiez vos critères de recherche ou vos filtres.</p>
                    </div>
                ) : (
                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {moderators.map((moderator) => {
                            const assignment = moderator.active_moderator_assignment;

                            return (
                                <article key={moderator.id} className="rounded-md bg-base-200 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                            <LuUser className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-0.5">
                                            <h3 className="truncate text-sm font-medium text-base-content">
                                                {moderator.first_name} {moderator.last_name}
                                            </h3>
                                            <p className="truncate text-xs text-base-content/60">{moderator.email}</p>
                                            {moderator.phone && <p className="text-xs text-base-content/60">{moderator.phone}</p>}
                                        </div>
                                    </div>

                                    {assignment ? (
                                        <div className="mt-5 space-y-2.5">
                                            <div>
                                                <span className="text-xs text-base-content/50">École</span>
                                                <p className="text-sm font-medium text-base-content">{assignment.school?.name || "-"}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-base-content/50">Année académique</span>
                                                <p className="text-sm font-medium text-base-content">{assignment.academic_year?.name || "-"}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-md bg-base-100 p-5 text-center text-xs text-base-content/50">
                                            Cet assistant n'est rattaché à aucune école pour l'année active
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleOpenAssignment(moderator)}
                                        className="mt-5 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:brightness-95"
                                    >
                                        Gérer l'affectation
                                    </button>
                                </article>
                            );
                        })}
                    </section>
                )}
            </div>

            {/* Filtres */}
            {showFiltersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-4">
                    <div className="h-full w-full overflow-y-auto bg-base-200 sm:h-auto sm:max-w-lg sm:rounded-md">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <Filter className="h-4 w-4 text-primary" />
                                <h2 className="text-base font-semibold text-base-content">Filtres</h2>
                            </div>
                            <button onClick={() => setShowFiltersModal(false)} className="rounded-md p-2 transition-colors duration-150 hover:bg-base-300">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 pt-0">
                            <label className="mb-2 block text-sm font-medium text-base-content/70">École</label>
                            <select
                                value={schoolFilter}
                                onChange={(e) => setSchoolFilter(e.target.value)}
                                className="w-full rounded-md bg-base-100 px-4 py-2.5 text-sm outline-none"
                            >
                                <option value="">Toutes les écoles</option>
                                {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 p-6">
                            <button
                                onClick={() => setSchoolFilter("")}
                                className="rounded-md bg-base-100 px-5 py-2.5 text-sm font-medium text-base-content transition-colors duration-150 hover:bg-base-300"
                            >
                                Réinitialiser
                            </button>
                            <button
                                onClick={() => setShowFiltersModal(false)}
                                className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:brightness-95"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Affectation */}
            {selectedModerator && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-0 sm:p-4">
                    <div className="h-full w-full overflow-y-auto bg-base-200 sm:h-auto sm:max-w-4xl sm:rounded-md">
                        <div className="flex items-center justify-between p-6">
                            <div>
                                <h2 className="text-base font-semibold text-base-content">Gérer l'affectation</h2>
                                <p className="text-sm text-base-content/60">
                                    {selectedModerator.first_name} {selectedModerator.last_name}
                                </p>
                            </div>
                            <button onClick={() => setSelectedModerator(null)} className="rounded-md p-2 transition-colors duration-150 hover:bg-base-300">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid gap-6 p-6 pt-0 lg:grid-cols-2">
                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-base-content/70">
                                        <Building2 size={16} /> École
                                    </label>
                                    <select
                                        value={assignmentForm.school_id}
                                        onChange={(e) => setAssignmentForm((prev) => ({ ...prev, school_id: e.target.value }))}
                                        className="w-full rounded-md bg-base-100 p-2.5 text-sm outline-none"
                                    >
                                        <option value="">Sélectionner une école</option>
                                        {schools.map((school) => (
                                            <option key={school.id} value={school.id}>{school.name}{school.city ? ` - ${school.city}` : ""}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-base-content/70">
                                        <GraduationCap size={16} /> Année académique
                                    </label>
                                    <select
                                        value={assignmentForm.academic_year_id}
                                        onChange={(e) => setAssignmentForm((prev) => ({ ...prev, academic_year_id: e.target.value }))}
                                        className="w-full rounded-md bg-base-100 p-2.5 text-sm outline-none"
                                    >
                                        <option value="">Sélectionner une année</option>
                                        {academicYears.map((year) => (
                                            <option key={year.id} value={year.id}>{year.name}{year.is_active ? " (active)" : ""}</option>
                                        ))}
                                    </select>
                                </div>

                                <p className="text-xs leading-relaxed text-base-content/50">
                                    Un assistant n'est rattaché qu'à une école par année : une nouvelle affectation
                                    sur la même année remplace la précédente.
                                </p>

                                <button
                                    onClick={handleAssign}
                                    disabled={assignmentSaving}
                                    className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:brightness-95 disabled:opacity-50"
                                >
                                    <Plus size={18} />
                                    {assignmentSaving ? "Enregistrement..." : "Enregistrer l'affectation"}
                                </button>
                            </div>

                            <div>
                                <h3 className="mb-4 text-sm font-medium text-base-content">Historique des affectations</h3>
                                <div className="max-h-100 space-y-2.5 overflow-y-auto">
                                    {assignmentLoading ? (
                                        <p className="text-sm text-base-content/60">Chargement...</p>
                                    ) : assignmentHistory.length === 0 ? (
                                        <div className="rounded-md bg-base-100 p-6 text-center text-sm text-base-content/50">Aucune affectation.</div>
                                    ) : (
                                        assignmentHistory.map((assignment) => (
                                            <div key={assignment.id} className="flex items-start justify-between gap-3 rounded-md bg-base-100 p-4">
                                                <div>
                                                    <p className="text-sm font-medium text-base-content">{assignment.school?.name}</p>
                                                    <p className="text-sm text-base-content/60">{assignment.academic_year?.name}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteAssignment(assignment)}
                                                    className="rounded-md p-2 text-error transition-colors duration-150 hover:bg-error/10"
                                                    title="Supprimer cette affectation"
                                                >
                                                    <Trash2 size={15} />
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

export default ModeratorsList;
