import { useEffect, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const outlet = useOutlet();
  const location = useLocation();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`flex min-h-screen flex-col transition-all duration-theme ${user ? "pb-16 md:pb-0" : ""}`}
    >
      <Navbar scrolled={scrolled} />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1"
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
      <Footer />
      <MobileBottomNav />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className:
            "!bg-surfaceLight !text-slate-900 !shadow-lg dark:!bg-cardDark dark:!text-[#F5F5F5] !border !border-red-100/50 dark:!border-red-900/30",
          style: { borderRadius: "12px" },
          success: {
            iconTheme: { primary: "#2DC653", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#E63946", secondary: "#fff" },
          },
        }}
      />
    </div>
  );
}
