import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) return (
    <div style={{
      display:'flex', justifyContent:'center',
      alignItems:'center', height:'100vh',
      background:'#0D0D0D', color:'#E63946',
      fontSize:'1.5rem', fontFamily:'Inter'
    }}>
      <div>Loading...</div>
    </div>
  );

  if (!user || !token) return (
    <Navigate to="/login" replace />
  );

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'donor') 
      return <Navigate to="/donor/dashboard" replace />;
    if (user.role === 'hospital') 
      return <Navigate to="/hospital/dashboard" replace />;
    if (user.role === 'admin') 
      return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
