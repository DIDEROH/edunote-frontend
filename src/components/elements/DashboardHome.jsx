import { useAuth } from "../../context/AuthContext";
import Admin from "../../pages/dashboard/Admin";
import Director from "../../pages/dashboard/Director";
import SuccessRates from "../../pages/SuccessRates";
import TeacherMarkHub from "../../pages/Teachers/TeacherMarkHub";

const DashboardHome = () => {
  const { hasRole, loading } = useAuth();

  // On attend que le contexte ait fini de charger les rôles
  if (loading) {
    return <div>Chargement...</div>; 
  }

  if (hasRole("admin")) return <Admin />;
    if (hasRole("teacher")) return <TeacherMarkHub />;
    if (hasRole("director")) return <Director />;
    
  //   if (hasRole("director")) return <DirectorStudentList />;
  return <div>Accès non autorisé ou aucun rôle défini.</div>;
};

export default DashboardHome;
