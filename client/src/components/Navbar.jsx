import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function dashboardPath(role) {
  if (role === "donor") return "/donor/dashboard";
  if (role === "hospital") return "/hospital/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/";
}

function initials(name) {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase().slice(0, 2);
}

const navClass = ({ isActive }) =>
  `nav-link-underline px-3 py-2 text-sm font-semibold tracking-wide transition-colors ${
    isActive
      ? "text-primary"
      : "text-slate-600 dark:text-slate-300"
  }`;

export default function Navbar({ scrolled }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'donor') return '/donor/dashboard';
    if (user.role === 'hospital') return '/hospital/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [user]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-theme ${
          scrolled
            ? "glass-nav shadow-md dark:shadow-[0_8px_30px_rgba(230,57,70,0.15)]"
            : "glass-nav"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-[0_0_8px_rgba(230,57,70,0.6)]"
              aria-hidden
            >
              <path
                d="M12 2C12 2 6 8.5 6 14a6 6 0 1 0 12 0c0-5.5-6-12-6-12z"
                fill="#E63946"
                stroke="#C1121F"
                strokeWidth="1"
              />
            </svg>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-[#F5F5F5]">
              Blood<span className="text-primary">Connect</span>
            </span>
          </Link>



          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/50 text-slate-700 transition hover:scale-105 dark:border-white/10 dark:bg-cardDark/80 dark:text-accentGold"
              aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5 text-accentGold" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-primaryDark" />
                )}
              </motion.span>
            </button>

            <div className="hidden items-center gap-2 md:flex">
              {isAuthenticated ? (
                <Link
                  to={getDashboardLink()}
                  className="btn-primary !py-2 !text-sm"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <nav className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary !py-2 !text-sm"
                  >
                    Register
                  </Link>
                </nav>
              )}
            </div>

            <button
              type="button"
              className="rounded-xl border border-slate-200 p-2 dark:border-white/10 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6 text-slate-800 dark:text-[#F5F5F5]" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 z-[70] flex h-full w-[min(100vw-3rem,320px)] flex-col bg-surfaceLight shadow-2xl dark:bg-surfaceDark lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
                <span className="font-bold text-slate-900 dark:text-white">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-cardDark"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {isAuthenticated ? (
                  <>
                    <NavLink
                      to={getDashboardLink()}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `rounded-xl px-4 py-3 text-sm font-bold ${isActive ? "bg-primary/15 text-primary" : "text-slate-700 dark:text-slate-200"}`
                      }
                    >
                      Go to Dashboard
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/"
                      end
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `rounded-xl px-4 py-3 text-sm font-bold ${isActive ? "bg-primary/15 text-primary" : "text-slate-700 dark:text-slate-200"}`
                      }
                    >
                      Home
                    </NavLink>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="mt-4 rounded-xl border-2 border-primary py-3 text-center text-sm font-bold text-primary"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl bg-primary py-3 text-center text-sm font-bold text-white"
                    >
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
