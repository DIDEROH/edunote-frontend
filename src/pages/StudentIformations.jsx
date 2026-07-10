import { useEffect, useState } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { api } from "../utils/AxiosClient";
import { Building2, MapPin, Phone, Mail, History } from "lucide-react";
import { toast } from "sonner";
import LoadingSkeletoon from "../components/LoadingSkeletoon";
import { Table } from "../components/Table";
import PageHeader from "../components/elements/PageHeader";
import { StudentCard } from "../components/ui/CardsComponents";
import useShowConfirm from "../hooks/UseShowConfirm";
import { deleteElement } from "../utils/deleteElement";



// --- SOUS-COMPOSANT : CARTE ÉTABLISSEMENT STYLE PREMIUM ---
const SchoolCard = ({ school }) => {
    if (!school) return <div className="p-2 md:p-4 lg:p-6 xl:p-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 text-center text-xs font-medium">Aucune information d'établissement</div>;

    return (
        <div className="relative bg-indigo-900 text-white p-6 rounded-lg shadow-xl overflow-hidden group">
            {/* Décoration en arrière-plan */}
            <Building2 className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform" />
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                        <Building2 size={24} className="text-indigo-200" />
                    </div>
                    <span className="bg-orange-500 text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                        {school.code}
                    </span>
                </div>

                <h3 className="text-lg font-bold mb-4 leading-tight">{school.name}</h3>
                
                <div className="space-y-3">
                    <LabelComponent icon={<MapPin size={14}/>} label="Adresse" item={school.address} />
                    <LabelComponent icon={<Phone size={14}/>} label="Téléphone" item={school.phone} />
                    <LabelComponent icon={<Mail size={14}/>} label="Email" item={school.email} />
                </div>
            </div>
        </div>
    );
};

const LabelComponent = ({ icon, label, item }) => (
    <div className="flex items-center gap-3 text-[11px]">
        <span className="text-indigo-300">{icon}</span>
        <span className="text-indigo-100/60 w-16 uppercase font-bold tracking-tighter">{label}</span>
        <span className="font-semibold truncate">{item || "---"}</span>
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

    // ... reste du rendu

    const currentEnrollment = student?.enrollments?.[0];

    return (
        <main className="bg-[#f8fafc] min-h-screen pb-12">
            <PageHeader
                title="Informations de l'élève"
                subtitle={`Détails de l'élève ${student ? `${student.first_name} ${student.last_name}` : ''}`}
                />

            {loading ? <div className="p-10"><LoadingSkeletoon /></div> : (
                <>
                {showDeleteChoice && (
                    <dialog open className="modal modal-open">
                        <div className="modal-box max-w-lg rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
                            <h3 className="text-center text-xl font-bold mb-4">Choisir l'action de suppression</h3>
                            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                Voulez-vous supprimer l'élève et toutes ses données, ou seulement une de ses inscriptions ?
                            </p>

                            <div className="space-y-4">
                                <button
                                    className="btn btn-error w-full"
                                    onClick={handleDeleteStudent}
                                >
                                    Supprimer l'élève et toutes ses données
                                </button>

                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200">
                                    <p className="text-sm font-semibold mb-3">Supprimer une inscription uniquement</p>
                                    {student?.enrollments?.length ? (
                                        <div className="space-y-3 max-h-80 overflow-y-auto">
                                            {student.enrollments.map((enrol) => (
                                                <button
                                                    key={enrol.id}
                                                    type="button"
                                                    onClick={() => handleDeleteEnrollment(enrol.id)}
                                                    className="w-full text-left rounded-2xl border border-slate-200 px-4 py-3 bg-white hover:bg-slate-50"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{enrol.academic_year?.name || 'Année inconnue'} || {enrol.classroom?.name || 'Classe inconnue'}</span>
                                                        <span className="text-xs text-slate-500">Supprimer</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">Aucune inscription disponible pour suppression.</p>
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

                        <form method="dialog" className="modal-backdrop bg-black/40 backdrop-blur-sm">
                            <button onClick={() => setShowDeleteChoice(false)}>fermer</button>
                        </form>
                    </dialog>
                )}
                <div className="container mx-auto px-4 mt-8">

                    {/* SECTION CARTES INFO */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:p-4 lg:p-6 xl:p-8 mb-12">
                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[3px] ml-2">Informations personnelles</h2>
                            {/* Ici on suppose que StudentCardComponent est déjà adapté avec rounded-lg */}
                            {student && <div className="flex justify-center">
                                <StudentCard     student={student} />
                            </div>}
                        </div>
                        
                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[3px] ml-2">Scolarité Actuelle</h2>
                            <SchoolCard school={currentEnrollment?.school} />
                        </div>
                    </div>

                    {/* SECTION HISTORIQUE */}
                    {student?.enrollments && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 ml-2">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><History size={18}/></div>
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[3px]">Historique des Inscriptions</h2>
                            </div>
                            
                            <Table>
                                <Table.Head>
                                    <th className="pl-8">#</th>
                                    <th>Année scolaire</th>
                                    <th>Classe</th>
                                    <th>Établissement</th>
                                    <th className="pr-8">Date d'inscription</th>
                                </Table.Head>
                                <Table.Body>
                                    {student.enrollments.map((enrol, index) => (
                                        <tr key={enrol.id} className="group">
                                            <td className="bg-white py-5 pl-8 first:rounded-l-3xl border-y border-l border-slate-100 font-bold text-indigo-600">
                                                {student.enrollments.length - index}
                                            </td>
                                            <td className="bg-white py-5 border-y border-slate-100 font-bold">
                                                {enrol.academic_year?.name}
                                            </td>
                                            <td className="bg-white py-5 border-y border-slate-100">
                                                <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-600">
                                                    {enrol.classroom?.name}
                                                </span>
                                            </td>
                                            <td className="bg-white py-5 border-y border-slate-100 text-slate-500 italic">
                                                {enrol.school?.name}
                                            </td>
                                            <td className="bg-white py-5 pr-8 last:rounded-r-3xl border-y border-r border-slate-100 text-slate-400 text-[10px]">
                                                {new Date(enrol.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    )}

                </div>
                </>
            )}
        </main>
    );
}
