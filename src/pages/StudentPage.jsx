import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "../utils/AxiosClient";
import { useAnimations } from "../utils/animations";
import PageHeader from "../components/elements/PageHeader";
import { Table, TdBody, Th, Tr } from "../components/Table";
import LoadingSkeletoon from "../components/LoadingSkeletoon";
import { toast } from "sonner";
import { LuSearchX } from "react-icons/lu";
import { Card5 } from "../components/ui/CardsComponents";
import Paginate from "../components/Paginate";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Filter, X } from "lucide-react";
import usePrintable from "../utils/usePrintable";
import PrintableTable from "../components/print/PrintableTable";


function StudentsPage() {
    const containerRef = useRef(null);
    useAnimations(containerRef);
    const { setNavbarActions } = useOutletContext();
    const navigate = useNavigate();
    const { printRef, print } = usePrintable("Liste des eleves");

    // États principaux de données
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState({ data: [], current_page: 1, last_page: 1 });
    
    // Options des filtres
    const [classrooms, setClassrooms] = useState([]);
    const [schools, setSchools] = useState([]);
    const [showFiltersModal, setShowFiltersModal] = useState(false);



    // Recherche synchronisée & devancée (Debounce)
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1
    });

    // Filtres centralisés
    const [filters, setFilters] = useState({
        school_id: "",
        classroom_id: "",
        sexe: "",
    });



    // Chargement des élèves basé sur les filtres et la pagination
    const fetchStudents = useCallback(async (page = 1, query = "") => {
        setLoading(true);

        const payload = {
            search: query,
            page: page,
            school_id: filters.school_id,
            classroom_id: filters.classroom_id,
            sex: filters.sexe // Correspondance avec le paramètre attendu par votre API ('sex')
        };

        api.post(`/student_enrollments`, payload)
            .then(({ data }) => {
                setStudents(data);
                setPagination({
                    currentPage: data.current_page,
                    lastPage: data.last_page
                });
            })
            .catch((error) =>
                toast.error(
                    error.message || "Erreur lors du chargement des élèves."
                )
            )
            .finally(() => setLoading(false));
    }, [filters]); // Dépendance mise à jour sur l'objet filters complet

    // Chargement global initial des options de filtrage (Écoles, Classes)
    const fetchFilterOptions = async () => {
        try {
            const [classRes, schoolRes] = await Promise.all([
                api.get("/classrooms"),
                api.get("/schools")
            ]);
            setClassrooms(classRes.data);
            setSchools(schoolRes.data);
        } catch (error) {
            toast.error("Impossible de charger les options de filtrage.");
        }
    };


    // Fonction de redirection ou ouverture du formulaire pour inscrire un nouvel élève
    const handleAddStudent = () => {
        navigate("/students/create");
    };

    /**
     * Modal filtres
     */
    const handleShowFiltersOptions = () => {
        setShowFiltersModal(true);
    };

    const handleApplyFilters = () => {
        setShowFiltersModal(false);
        fetchStudents(1, debouncedQuery);
    };

    const handleResetFilters = () => {
        setFilters({
            school_id: "",
            classroom_id: "",
            sexe: ""
        });
    };

    // Debounce de la chaîne de recherche textuelle
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 400);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Déclencher la recherche à chaque mutation des filtres ou du texte synchronisé
    useEffect(() => {
        fetchStudents(1, debouncedQuery);
    }, [debouncedQuery, filters, fetchStudents]);

    // Chargement initial unique
    useEffect(() => {
        fetchFilterOptions();
    }, []); 


    // Liaison correcte des actions du Navbar
    useEffect(() => {
        setNavbarActions({
            onAdd: handleAddStudent, // Correction ici (passage direct de la référence de fonction)
            onFilter: handleShowFiltersOptions,
            onPrint: print,
        });
        return () => setNavbarActions({});
    }, [setNavbarActions, print]);


    return (
        <div ref={containerRef}>
            <PrintableTable
                ref={printRef}
                title="Liste des eleves"
                meta={[
                    { label: "Page", value: `${pagination.currentPage}/${pagination.lastPage}` },
                    { label: "Recherche", value: debouncedQuery || "-" },
                ]}
                columns={[
                    { key: "index", label: "#" },
                    { key: "name", label: "Noms et Prenoms" },
                    { key: "sexe", label: "Sexe" },
                    { key: "matricule", label: "Matricule" },
                    { key: "classe", label: "Classe" },
                    { key: "ecole", label: "Ecole" },
                ]}
                rows={(students.data || []).map((student, index) => {
                    const currentEnrol = student.enrollments?.[0];
                    return {
                        id: student.id,
                        index: index + 1,
                        name: `${student.first_name} ${student.last_name}`,
                        sexe: student.gender || student.student?.sex || "-",
                        matricule: student.matricule || "-",
                        classe: currentEnrol?.classroom?.name || "Non inscrit",
                        ecole: currentEnrol?.school?.name || "-",
                    };
                })}
            />

            <PageHeader
                title="Gestion des Élèves"
                subtitle="Consultez le fichier des apprenants, filtrez par structure ou gérez les réinscriptions."
                onSearch={(value) => setSearchQuery(value)}
                searchPlaceholder="Rechercher un élève par nom ou matricule..."
            />

            <section className="p-4">
                {loading ? (
                    <LoadingSkeletoon />
                ) : !students?.data || students.data.length === 0 ? (
                    <Card5 icon={LuSearchX}>
                        Aucun élève trouvé avec les critères actuels.
                    </Card5>
                ) : (<>
                        {/* Cartes mobiles */}
                        <div className="grid gap-2 md:hidden">
                            {students.data.map((student, index) => {
                                const currentEnrol = student.enrollments?.[0];
                                return (
                                    <button
                                        key={student.id}
                                        onClick={() => navigate(`/students/${student.id}`)}
                                        className="text-left rounded-md bg-base-200 p-4 transition-colors duration-150 hover:bg-base-300"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm text-base-content">
                                                {student.first_name} {student.last_name}
                                            </span>
                                            <span className="text-xs text-base-content/40">#{index + 1}</span>
                                        </div>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-base-content/60">
                                            <span className="px-2 py-0.5 bg-base-300 rounded-sm font-mono">{student.matricule || "Aucun"}</span>
                                            <span>{student.gender || student.student.sex || "-"}</span>
                                        </div>
                                        <div className="mt-1 text-xs text-base-content/60">
                                            {currentEnrol?.classroom?.name || <span className="text-error">Non inscrit</span>} — {currentEnrol?.school?.name || "-"}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tableau desktop */}
                        <div className="hidden md:block">
                            <Table>
                                <Table.Head>
                                    <Th className="font-bold">#</Th>
                                    <Th>Noms et Prénoms</Th>
                                    <Th>Sexe</Th>
                                    <Th>Matricule</Th>
                                    <Th>Classe Actuelle</Th>
                                    <Th>École</Th>
                                </Table.Head>

                                <Table.Body>
                                    {students.data.map((student, index) => {
                                        const currentEnrol = student.enrollments?.[0];
                                        return (
                                            <Tr
                                                        key={student.id}
                                                        onAction={() => navigate(`/students/${student.id}`)}
                                                        className="cursor-pointer"
                                                    >
                                                <TdBody>{index + 1}</TdBody>
                                                <TdBody className="font-medium">
                                                    {student.first_name} {student.last_name}
                                                </TdBody>
                                                <TdBody>{student.gender || student.student.sex || "-"}</TdBody>
                                                <TdBody>
                                                    <span className="px-2 py-1 bg-base-300 text-base-content/70 rounded-sm text-xs font-mono">
                                                        {student.matricule || "Aucun"}
                                                    </span>
                                                </TdBody>
                                                <TdBody>
                                                    {currentEnrol?.classroom?.name || (
                                                        <span className="text-error italic text-xs">Non inscrit</span>
                                                    )}
                                                </TdBody>
                                                <TdBody className="text-base-content font-medium">
                                                    {currentEnrol?.school?.name || "-"}
                                                </TdBody>
                                            </Tr>
                                        );
                                    })}
                                </Table.Body>
                            </Table>
                        </div>

                        <div className="flex items-center justify-center mt-5">
                            <Paginate 
                                currentPage={pagination.currentPage} 
                                lastPage={pagination.lastPage} 
                                onPageChange={(page) => fetchStudents(page, debouncedQuery)} 
                                siblingCount={1} 
                            />
                        </div>
                    </>
                )}
            </section>


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

                            {/* Filtre Classe */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-base-content/70">Classe</label>
                                <select
                                    value={filters.classroom_id}
                                    onChange={(e) => setFilters(prev => ({ ...prev, classroom_id: e.target.value }))}
                                    className="w-full rounded-md bg-base-100 py-2.5 px-4 text-sm outline-none"
                                >
                                    <option value="">Toutes les classes</option>
                                    {classrooms.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                </select>
                            </div>

                            {/* Filtre Sexe */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-base-content/70">Sexe</label>
                                <select
                                    value={filters.sexe}
                                    onChange={(e) => setFilters(prev => ({ ...prev, sexe: e.target.value }))}
                                    className="w-full rounded-md bg-base-100 py-2.5 px-4 text-sm outline-none"
                                >
                                    <option value="">Tous les sexes</option>
                                    <option value="M">Masculin</option>
                                    <option value="F">Feminin</option>

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
        </div>
    );
}

export default StudentsPage;