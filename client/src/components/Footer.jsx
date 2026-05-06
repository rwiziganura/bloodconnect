import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0D0D0D] text-[#F5F5F5]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="absolute text-primary/20"
            style={{
              left: `${12 + i * 16}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${7 + i}s`,
            }}
            aria-hidden
          >
            <svg
              width="14"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="animate-drop-fall"
            >
              <path d="M12 2C12 2 6 8.5 6 14a6 6 0 1 0 12 0c0-5.5-6-12-6-12z" />
            </svg>
          </span>
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C12 2 6 8.5 6 14a6 6 0 1 0 12 0c0-5.5-6-12-6-12z"
                  fill="#E63946"
                />
              </svg>
              <span className="text-lg font-extrabold">BloodConnect</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Saving lives, one drop at a time.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primaryLight">
              Quick links
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-slate-400 hover:text-white">
                  Donors map
                </Link>
              </li>
              <li>
                <Link to="/requests" className="text-slate-400 hover:text-white">
                  Requests
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-white">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primaryLight">
              Contact
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>
                <a href="mailto:support@bloodconnect.rw" className="hover:text-white">
                  support@bloodconnect.rw
                </a>
              </li>
              <li>
                <a href="tel:+250788000000" className="hover:text-white">
                  +250 788 000 000
                </a>
              </li>
              <li className="flex gap-3 pt-2">
                <a
                  href="#"
                  className="rounded-lg border border-white/10 px-3 py-1 text-xs hover:border-primary"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="rounded-lg border border-white/10 px-3 py-1 text-xs hover:border-primary"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} BloodConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
