import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import BackComponent from "../../components/BackComponent";
import axiosClient from "../../utils/AxiosClient";
import { Building2, MapPin, Phone, Mail, Calendar, GraduationCap, History, User } from "lucide-react";
import EditBtn from "../../components/EditBtn";
import DeleteBtn from "../../components/DeleteBtn";
import useShowConfirm from "../../hooks/UseShowConfirm";
import { toast } from "react-toastify";
import LoadingSkeletoon from "../../components/LoadingSkeletoon";
import Table from "../../components/Table";
import StudentCardComponent from "../../components/StudentCardComponent";
import { useHasRole } from '../../hooks/UseHasRole';



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

function StudentIformations() {
    const navigate = useNavigate();
    const showConfirm = useShowConfirm();
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(false);

    // Utilisation de tes hooks de rôle
    const isAdmin = useHasRole('Admin');
    const isDirector = useHasRole('Director');

    const fetchStudentData = async () => {
        setLoading(true);
        // On adapte l'URL de récupération selon le profil
        axiosClient.get(`/student-enrollments/${id}`) 
            .then(({ data }) => setStudent(data.data))
            .catch(() => toast.error("Erreur de chargement"))
            .finally(() => setLoading(false));
    };

    const handleDeleteStudent = () => {
        // Définition de la cible de suppression
        const deleteUrl = isAdmin 
            ? `/students/${id}` 
            : `/director-space/enrollments/${id}`;

        const warningMsg = isAdmin 
            ? "Attention : Vous allez supprimer l'élève de TOUT le système (toutes les écoles)." 
            : "Vous allez retirer cet élève de votre établissement.";

        showConfirm({
            title: "Confirmation de suppression",
            message: warningMsg,
            onSuccess: () => {
                axiosClient.delete(deleteUrl)
                    .then(() => {
                        toast.success(isAdmin ? "Élève rayé du système" : "Inscription annulée");
                        // Redirection vers la liste correspondante
                        navigate(isAdmin ? '/edunote/students' : '/edunote/directors/students/list');
                    })
                    .catch((err) => {
                        toast.error(err.response?.data?.message || "Action non autorisée");
                        console.error(err)
                    });
            }
        });
    };

    useEffect(() => { fetchStudentData(); }, [id]);

    // ... reste du rendu

    const currentEnrollment = student?.enrollments?.[0];

    return (
        <main className="bg-[#f8fafc] min-h-screen pb-12">
            <Navbar>
                <Navbar.Left>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <User className="text-indigo-600" size={20}/> Fiche Élève
                        </h1>
                        <div className="flex gap-4 mt-1">
                            <EditBtn text={true} action={() => navigate(`/edunote/add-student/${id}`)} />
                            <DeleteBtn text={"Supprimer"} action={handleDeleteStudent} />
                        </div>
                    </div>
                </Navbar.Left>

                <Navbar.Right>
                    <div className="flex items-center gap-4">
                        {currentEnrollment && (
                            <div className="hidden md:flex flex-col items-end border-r pr-4 border-slate-200">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{currentEnrollment.classroom?.name}</span>
                                <span className="text-[10px] text-slate-400 font-bold">{currentEnrollment.academic_year?.name}</span>
                            </div>
                        )}
                        <BackComponent />
                    </div>
                </Navbar.Right>
            </Navbar>

            {loading ? <div className="p-10"><LoadingSkeletoon /></div> : (
                <div className="container mx-auto px-4 mt-8">
                    {/* SECTION CARTES INFO */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:p-4 lg:p-6 xl:p-8 mb-12">
                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[3px] ml-2">Informations personnelles</h2>
                            {/* Ici on suppose que StudentCardComponent est déjà adapté avec rounded-lg */}
                            {student && <div className="flex justify-center">
                                <StudentCardComponent student={student} />
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
                                            <td className="bg-white py-5 pl-8 first:rounded-l-[1.5rem] border-y border-l border-slate-100 font-bold text-indigo-600">
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
                                            <td className="bg-white py-5 pr-8 last:rounded-r-[1.5rem] border-y border-r border-slate-100 text-slate-400 text-[10px]">
                                                {new Date(enrol.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}

export default StudentIformations;