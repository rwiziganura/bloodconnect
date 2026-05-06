import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  MapIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  MapIcon as MapSolid,
  ClipboardDocumentListIcon as ClipSolid,
  UserCircleIcon as UserSolid,
} from "@heroicons/react/24/solid";
import { useAuth } from "../context/AuthContext.jsx";

function dashboardPath(role) {
  if (role === "donor") return "/donor/dashboard";
  if (role === "hospital") return "/hospital/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/";
}

const linkClass =
  "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors";

export default function MobileBottomNav() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <nav className="safe-pb fixed bottom-0 left-0 right-0 z-40 flex border-t border-white/10 bg-surfaceLight/95 px-1 pt-1 shadow-[0_-4px_24px_rgba(230,57,70,0.12)] backdrop-blur-xl dark:bg-surfaceDark/95 md:hidden">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `${linkClass} ${isActive ? "text-primary" : "text-slate-500 dark:text-slate-400"}`
        }
      >
        {({ isActive }) => (
          <>
            {isActive ? (
              <HomeSolid className="h-6 w-6" />
            ) : (
              <HomeIcon className="h-6 w-6" />
            )}
            Home
          </>
        )}
      </NavLink>
      <NavLink
        to="/map"
        className={({ isActive }) =>
          `${linkClass} ${isActive ? "text-primary" : "text-slate-500 dark:text-slate-400"}`
        }
      >
        {({ isActive }) => (
          <>
            {isActive ? (
              <MapSolid className="h-6 w-6" />
            ) : (
              <MapIcon className="h-6 w-6" />
            )}
            Map
          </>
        )}
      </NavLink>
      <NavLink
        to="/requests"
        className={({ isActive }) =>
          `${linkClass} ${isActive ? "text-primary" : "text-slate-500 dark:text-slate-400"}`
        }
      >
        {({ isActive }) => (
          <>
            {isActive ? (
              <ClipSolid className="h-6 w-6" />
            ) : (
              <ClipboardDocumentListIcon className="h-6 w-6" />
            )}
            Requests
          </>
        )}
      </NavLink>
      <NavLink
        to={dashboardPath(user.role)}
        className={({ isActive }) =>
          `${linkClass} ${isActive ? "text-primary" : "text-slate-500 dark:text-slate-400"}`
        }
      >
        {({ isActive }) => (
          <>
            {isActive ? (
              <UserSolid className="h-6 w-6" />
            ) : (
              <UserCircleIcon className="h-6 w-6" />
            )}
            Dashboard
          </>
        )}
      </NavLink>
    </nav>
  );
}
