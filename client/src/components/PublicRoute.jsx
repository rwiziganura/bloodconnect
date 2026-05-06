import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Stops logged-in users from seeing login/register pages
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    if (user.role === 'donor') 
      return <Navigate to="/donor/dashboard" replace />;
    if (user.role === 'hospital') 
      return <Navigate to="/hospital/dashboard" replace />;
    if (user.role === 'admin') 
      return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
