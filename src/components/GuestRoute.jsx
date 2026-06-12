import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

export default function GuestRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
