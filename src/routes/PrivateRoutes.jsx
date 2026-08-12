import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSkeletoon from "../components/LoadingSkeletoon";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSkeletoon />;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;