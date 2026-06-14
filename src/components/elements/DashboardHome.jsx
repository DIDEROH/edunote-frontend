import { useAuth } from "../../context/AuthContext";
import SuccessRates from "../../pages/SuccessRates";
// import SkillMarkHub from "./SkillMarkHub";
// import DirectorStudentList from "./DirectorStudentList";

const DashboardHome = () => {
  const { hasRole, loading } = useAuth();

  // On attend que le contexte ait fini de charger les rôles
  if (loading) {
    return <div>Chargement...</div>; 
  }

  if (hasRole("admin")) return <SuccessRates />;
//   if (hasRole("teacher")) return <SkillMarkHub />;
//   if (hasRole("director")) return <DirectorStudentList />;

  return <div>Accès non autorisé ou aucun rôle défini.</div>;
};

export default DashboardHome;
