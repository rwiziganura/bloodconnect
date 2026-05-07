import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { motion, useInView } from "framer-motion";
import CountUp from "react-countup";
import {
  UserPlusIcon,
  BellAlertIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import api from "../services/api.js";
import { requestTypesMatchableByDonor } from "../lib/bloodCompat.js";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const RECEIVE_FROM = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

const TESTIMONIALS = [
  {
    quote:
      "I got an alert and was at the hospital within an hour. This platform is the future.",
    name: "Jean d.",
    role: "Donor, Kigali",
  },
  {
    quote:
      "During a critical night, BloodConnect helped us reach donors we never could have phoned manually.",
    name: "Dr. Mukamana",
    role: "Hospital physician",
  },
  {
    quote:
      "Simple, fast, and focused on saving lives — exactly what we needed.",
    name: "Aline U.",
    role: "Patient family",
  },
];

function StatCounter({ end, label, icon, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass card-hover rounded-2xl p-6 text-center"
    >
      <div className="text-2xl">{icon}</div>
      <p className="mt-3 text-4xl font-extrabold tabular-nums text-primary">
        {inView ? <CountUp end={end} duration={2.2} separator="," /> : "0"}
      </p>
      <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </motion.div>
  );
}

export default function Home() {
  const [stats, setStats] = useState(null);
  const [feed, setFeed] = useState([]);
  const [selectedBlood, setSelectedBlood] = useState("O+");
  const [tIndex, setTIndex] = useState(0);

  useEffect(() => {
    let c = true;
    (async () => {
      try {
        const [s, f] = await Promise.all([
          api.get("/public/stats"),
          api.get("/public/recent-requests"),
        ]);
        if (!c) return;
        setStats(s.data);
        setFeed(f.data.items || []);
      } catch {
        /* silent */
      }
    })();
    return () => {
      c = false;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTIndex((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const donateTo = useMemo(
    () => requestTypesMatchableByDonor(selectedBlood),
    [selectedBlood]
  );
  const receiveFrom = RECEIVE_FROM[selectedBlood] || [];

  const tickerItems = feed.length ? [...feed, ...feed] : [];

  return (
    <div className="bg-bgLight transition-colors dark:bg-bgDark">
      <Navbar />
      <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-gradient-to-b from-primaryDark via-bgDark to-bgDark px-4 pb-16 pt-24">
        <div className="pointer-events-none absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-primary/25"
              style={{ left: `${8 + i * 14}%`, top: `${15 + (i % 3) * 22}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.2, 0.55, 0.2] }}
              transition={{
                duration: 5 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <svg width="22" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 6 8.5 6 14a6 6 0 1 0 12 0c0-5.5-6-12-6-12z" />
              </svg>
            </motion.span>
          ))}
        </div>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Every Drop
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-2 bg-gradient-to-r from-primaryLight to-primary bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-6xl"
          >
            Saves A Life
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mx-auto mt-8 max-w-2xl text-lg text-red-100/85"
          >
            Connect blood donors with hospitals in real time. Register today and
            be someone&apos;s hero.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              to="/register"
              className="btn-primary inline-flex min-h-[48px] animate-pulse-glow items-center justify-center px-10"
            >
              Become a Donor
            </Link>
            <Link
              to="/requests"
              className="btn-outline min-h-[48px] px-10 text-center"
            >
              I Need Blood
            </Link>
          </motion.div>
        </div>
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-2xl">↓</span>
        </motion.div>
      </section>

      {tickerItems.length > 0 && (
        <div className="border-y border-primary/20 bg-surfaceDark py-3 text-white">
          <div className="flex overflow-hidden whitespace-nowrap">
            <motion.div
              className="flex gap-12 pr-12"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 45,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {tickerItems.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 text-sm">
                  <span className="font-bold text-primaryLight">
                    {item.hospital_name}
                  </span>
                  needs <span className="font-extrabold">{item.blood_type}</span> ·{" "}
                  {item.city} ·
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      item.urgency === "critical"
                        ? "animate-pulse-glow bg-primary text-white"
                        : item.urgency === "high"
                          ? "bg-warning text-bgDark"
                          : "bg-accentGold/90 text-bgDark"
                    }`}
                  >
                    {item.urgency}
                  </span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Live impact
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCounter
            end={stats?.totalDonorsRegistered ?? 0}
            label="Donors registered"
            icon="🩸"
            delay={0}
          />
          <StatCounter
            end={stats?.hospitalsCount ?? 0}
            label="Hospitals connected"
            icon="🏥"
            delay={0.05}
          />
          <StatCounter
            end={stats?.fulfilledRequests ?? 0}
            label="Lives saved (fulfilled)"
            icon="✅"
            delay={0.1}
          />
          <StatCounter
            end={stats?.citiesCovered ?? 0}
            label="Cities covered"
            icon="🌍"
            delay={0.15}
          />
        </div>
      </section>

      <section className="border-t border-slate-200 bg-surfaceLight py-16 dark:border-white/5 dark:bg-surfaceDark">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            How it works
          </h2>
          <div className="relative mt-14 grid gap-8 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
            {[
              {
                icon: UserPlusIcon,
                title: "Register",
                body: "Create your donor or hospital profile with blood type and location.",
              },
              {
                icon: BellAlertIcon,
                title: "Get alerted",
                body: "Receive instant notifications for emergencies near you.",
              },
              {
                icon: HeartIcon,
                title: "Donate",
                body: "Respond, donate on site, and track the lives you help save.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass card-hover relative z-10 rounded-2xl p-8 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <s.icon className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {s.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Blood type compatibility
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-600 dark:text-slate-400">
          Select your type to see who you can help and who can help you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {BLOOD_TYPES.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBlood(b)}
              className={`min-h-[44px] rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition ${
                selectedBlood === b
                  ? "border-primary bg-primary/15 text-primary shadow-glow-red"
                  : "border-slate-200 dark:border-white/10"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <motion.div
            key={`d-${selectedBlood}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-success">
              You can donate to patients needing
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {donateTo.map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-success/20 px-3 py-1 text-sm font-bold text-success"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div
            key={`r-${selectedBlood}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              You can receive from donors with
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {receiveFrom.map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-primary/15 px-3 py-1 text-sm font-bold text-primary"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-surfaceLight py-16 dark:border-white/5 dark:bg-surfaceDark">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="glass rounded-3xl p-10">
            <p className="text-lg font-medium italic text-slate-700 dark:text-slate-200">
              &ldquo;{TESTIMONIALS[tIndex].quote}&rdquo;
            </p>
            <p className="mt-4 font-bold text-primary">
              {TESTIMONIALS[tIndex].name}
            </p>
            <p className="text-sm text-slate-500">{TESTIMONIALS[tIndex].role}</p>
            <div className="mt-6 flex justify-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTIndex(i)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    i === tIndex ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-primary to-primaryDark px-8 py-14 text-center text-white shadow-glow-red-lg">
          <h2 className="text-3xl font-extrabold">Ready to save a life?</h2>
          <p className="mx-auto mt-3 max-w-lg text-red-100">
            Join thousands of donors and verified hospitals on BloodConnect.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-10 font-extrabold text-primary shadow-lg transition hover:scale-105 hover:shadow-xl"
          >
            Register now
          </Link>
        </div>
      </section>
    </div>
  );
}
