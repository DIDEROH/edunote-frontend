import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSkeletoon from "../components/LoadingSkeletoon";
import SchoolStatusScreen from "../components/SchoolStatusScreen";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user, hasRole } = useAuth();

  if (loading) return <LoadingSkeletoon />;

  if (!isAuthenticated) return <Navigate to="/login" />;

  // École gérée pas encore validée (ou refusée, suspendue) : écran d'attente,
  // sauf si la personne enseigne aussi dans une école active
  const managesSchool = hasRole("director") || hasRole("moderator");
  const school = user?.school;
  if (managesSchool && school && school.status !== "active" && !(user?.teaching_schools?.length)) {
    return <SchoolStatusScreen school={school} />;
  }

  return children;
};

export default PrivateRoute;
