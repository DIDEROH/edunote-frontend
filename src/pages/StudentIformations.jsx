import { useEffect, useState } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { api } from "../utils/AxiosClient";
import { Building2, MapPin, Phone, Mail, History } from "lucide-react";
import { toast } from "sonner";
import LoadingSkeletoon from "../components/LoadingSkeletoon";
import { Table, Th, Tr, TdBody } from "../components/Table";
import PageHeader from "../components/elements/PageHeader";
import { StudentCard } from "../components/ui/CardsComponents";
import useShowConfirm from "../hooks/UseShowConfirm";
import { deleteElement } from "../utils/deleteElement";



// --- SOUS-COMPOSANT : CARTE ÉTABLISSEMENT ---
const SchoolCard = ({ school }) => {
    if (!school) return <div className="p-6 bg-base-200 rounded-md text-base-content/50 text-center text-sm">Aucune information d'établissement</div>;

    return (
        <div className="bg-base-200 rounded-md p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-primary/10 rounded-md">
                    <Building2 size={20} className="text-primary" />
                </div>
                <span className="bg-base-300 text-base-content/70 text-xs font-medium px-2.5 py-1 rounded-sm">
                    {school.code}
                </span>
            </div>

            <h3 className="text-base font-semibold text-base-content mb-4">{school.name}</h3>

            <div className="space-y-2.5">
                <LabelComponent icon={<MapPin size={14}/>} label="Adresse" item={school.address} />
                <LabelComponent icon={<Phone size={14}/>} label="Téléphone" item={school.phone} />
                <LabelComponent icon={<Mail size={14}/>} label="Email" item={school.email} />
            </div>
        </div>
    );
};

const LabelComponent = ({ icon, label, item }) => (
    <div className="flex items-center gap-3 text-xs">
        <span className="text-base-content/40">{icon}</span>
        <span className="text-base-content/50 w-16">{label}</span>
        <span className="font-medium text-base-content truncate">{item || "---"}</span>
    </div>
);

export default function StudentIformations() {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDeleteChoice, setShowDeleteChoice] = useState(false);
    const navigate = useNavigate();
    const showConfirm = useShowConfirm();
    const { setNavbarActions } = useOutletContext(); // Récupération de la fonction pour définir les actions de la navbar

    useEffect(() => {
        const fetchStudentData = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/director-space/students/${id}`);
                const studentData = response.data?.data;

                if (!studentData) {
                    toast.error("Informations de l'élève introuvables.");
                    navigate(-1);
                    return;
                }

                setStudent(studentData);
            } catch (err) {
                toast.error(err.response?.data?.message || "Erreur de chargement de l'élève");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [id, navigate]);

    const handleDeleteStudent = async () => {
        deleteElement(
            'director-space/students',
            id,
            'Cet élève et toutes ses données ',
            showConfirm,
            {
                onStart: () => setLoading(true),
                onSuccess: () => {
                    toast.success("Élève et toutes ses données ont été supprimés.");
                    navigate(-1);
                },
                onFinally: () => setLoading(false),
            }
        );
    };

    const handleDeleteEnrollment = async (enrollmentId) => {
        const isLastEnrollment = student?.enrollments?.length === 1;

        deleteElement(
            'director-space/enrollments',
            enrollmentId,
            'Cette inscription ',
            showConfirm,
            {
                onStart: () => setLoading(true),
                onSuccess: async () => {
                    toast.success("Inscription supprimée.");

                    if (isLastEnrollment) {
                        navigate(-1);
                        return;
                    }

                    // Recharger les données de l'élève après suppression de l'inscription
                    try {
                        const response = await api.get(`/director-space/students/${id}`);
                        setStudent(response.data.data);
                    } catch (err) {
                        toast.error(err.response?.data?.message || "Erreur de chargement après suppression");
                    }
                },
                onFinally: () => setLoading(false),
            }
        );
    };

    useEffect(() => {
        // Définir les actions de la navbar pour cette page
        setNavbarActions({
            onBack: () => navigate(-1), // Retour à la page précédente
            onEdit: () => navigate(`/students/edit/${id}`),
            onDelete: () => setShowDeleteChoice(true),
        });

        // Nettoyage des actions de la navbar lorsque le composant est démonté
        return () => setNavbarActions({});
    }, [id, navigate, setNavbarActions]);

    const currentEnrollment = student?.enrollments?.[0];

    return (
        <main className="bg-base-100 min-h-screen pb-12">
            <PageHeader
                title="Informations de l'élève"
                subtitle={`Détails de l'élève ${student ? `${student.first_name} ${student.last_name}` : ''}`}
                />

            {loading ? <div className="p-10"><LoadingSkeletoon /></div> : (
                <>
                {showDeleteChoice && (
                    <dialog open className="modal modal-open">
                        <div className="modal-box max-w-lg rounded-md bg-base-200">
                            <h3 className="text-center text-base font-semibold text-base-content mb-4">Choisir l'action de suppression</h3>
                            <p className="text-sm text-base-content/60 mb-6 leading-relaxed">
                                Voulez-vous supprimer l'élève et toutes ses données, ou seulement une de ses inscriptions ?
                            </p>

                            <div className="space-y-4">
                                <button
                                    className="btn btn-error w-full"
                                    onClick={handleDeleteStudent}
                                >
                                    Supprimer l'élève et toutes ses données
                                </button>

                                <div className="bg-base-100 p-4 rounded-md">
                                    <p className="text-sm font-medium text-base-content mb-3">Supprimer une inscription uniquement</p>
                                    {student?.enrollments?.length ? (
                                        <div className="space-y-2 max-h-80 overflow-y-auto">
                                            {student.enrollments.map((enrol) => (
                                                <button
                                                    key={enrol.id}
                                                    type="button"
                                                    onClick={() => handleDeleteEnrollment(enrol.id)}
                                                    className="w-full text-left rounded-md px-4 py-3 bg-base-200 transition-colors duration-150 hover:bg-base-300"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-base-content">{enrol.academic_year?.name || 'Année inconnue'} — {enrol.classroom?.name || 'Classe inconnue'}</span>
                                                        <span className="text-xs text-base-content/50">Supprimer</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-base-content/50">Aucune inscription disponible pour suppression.</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setShowDeleteChoice(false)}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>

                        <form method="dialog" className="modal-backdrop bg-black/40">
                            <button onClick={() => setShowDeleteChoice(false)}>fermer</button>
                        </form>
                    </dialog>
                )}
                <div className="container mx-auto px-4 mt-6">

                    {/* SECTION CARTES INFO */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                        <div className="space-y-3">
                            <h2 className="text-xs font-medium text-base-content/50 ml-1">Informations personnelles</h2>
                            {student && <div className="flex justify-center">
                                <StudentCard student={student} />
                            </div>}
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-xs font-medium text-base-content/50 ml-1">Scolarité Actuelle</h2>
                            <SchoolCard school={currentEnrollment?.school} />
                        </div>
                    </div>

                    {/* SECTION HISTORIQUE */}
                    {student?.enrollments && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 ml-1">
                                <div className="p-1.5 bg-primary/10 text-primary rounded-md"><History size={16}/></div>
                                <h2 className="text-xs font-medium text-base-content/50">Historique des Inscriptions</h2>
                            </div>

                            <div className="bg-base-200 rounded-md overflow-hidden">
                                <Table>
                                    <Table.Head>
                                        <Th>#</Th>
                                        <Th>Année scolaire</Th>
                                        <Th>Classe</Th>
                                        <Th>Établissement</Th>
                                        <Th>Date d'inscription</Th>
                                    </Table.Head>
                                    <Table.Body>
                                        {student.enrollments.map((enrol, index) => (
                                            <Tr key={enrol.id}>
                                                <TdBody className="font-medium text-primary">
                                                    {student.enrollments.length - index}
                                                </TdBody>
                                                <TdBody className="font-medium text-base-content">
                                                    {enrol.academic_year?.name}
                                                </TdBody>
                                                <TdBody>
                                                    <span className="bg-base-300 px-2.5 py-1 rounded-sm text-xs font-medium text-base-content/70">
                                                        {enrol.classroom?.name}
                                                    </span>
                                                </TdBody>
                                                <TdBody className="text-base-content/60">
                                                    {enrol.school?.name}
                                                </TdBody>
                                                <TdBody className="text-base-content/50 text-xs">
                                                    {new Date(enrol.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </TdBody>
                                            </Tr>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </div>
                        </div>
                    )}

                </div>
                </>
            )}
        </main>
    );
}
