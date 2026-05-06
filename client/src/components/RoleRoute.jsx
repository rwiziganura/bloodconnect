import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function dashboardPath(role) {
  if (role === "donor") return "/donor/dashboard";
  if (role === "hospital") return "/hospital/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/";
}

export default function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }

  return children;
}
