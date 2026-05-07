import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { SkeletonStat, SkeletonTable } from "../components/Skeleton.jsx";
import DonorAcceptanceForm from "../components/DonorAcceptanceForm.jsx";

const COMPATIBILITY = {
  "A+":  { donateTo: ["A+","AB+"],                        receiveFrom: ["A+","A-","O+","O-"] },
  "A-":  { donateTo: ["A+","A-","AB+","AB-"],             receiveFrom: ["A-","O-"] },
  "B+":  { donateTo: ["B+","AB+"],                        receiveFrom: ["B+","B-","O+","O-"] },
  "B-":  { donateTo: ["B+","B-","AB+","AB-"],             receiveFrom: ["B-","O-"] },
  "AB+": { donateTo: ["AB+"],                             receiveFrom: ["A+","A-","B+","B-","AB+","AB-","O+","O-"] },
  "AB-": { donateTo: ["AB+","AB-"],                       receiveFrom: ["AB-","A-","B-","O-"] },
  "O+":  { donateTo: ["A+","B+","AB+","O+"],              receiveFrom: ["O+","O-"] },
  "O-":  { donateTo: ["A+","A-","B+","B-","AB+","AB-","O+","O-"], receiveFrom: ["O-"] },
};

const TIPS = [
  "Drink at least 500ml water before donating",
  "Eat a healthy meal 2 hours before donation",
  "Get a good night sleep before donating",
  "Wait at least 3 months between donations",
  "Avoid heavy exercise on donation day",
];

function getDaysUntilEligible(lastDate) {
  if (!lastDate) return 0;
  const next = new Date(lastDate);
  next.setDate(next.getDate() + 90);
  const diff = Math.ceil((next - new Date()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function getDaysSinceDonation(lastDate) {
  if (!lastDate) return 90;
  const diff = Math.floor((new Date() - new Date(lastDate)) / (1000 * 60 * 60 * 24));
  return Math.min(diff, 90);
}

export default function DonorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dash, setDash] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [availLoading, setAvailLoading] = useState(false);
  const [showAcceptanceForm, setShowAcceptanceForm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, a, h] = await Promise.all([
        api.get("/donors/me/dashboard"),
        api.get("/donors/me/alerts"),
        api.get(`/donors/me/history?page=${page}`),
      ]);
      setDash(d.data);
      setAlerts(a.data.alerts || []);
      setHistory(h.data);
    } catch {
      toast.error("Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function setAvailable(on) {
    setAvailLoading(true);
    try {
      await api.patch("/donors/me/availability", { is_available: on });
      toast.success(on ? "You are now available" : "Marked unavailable");
      const { data } = await api.get("/donors/me/dashboard");
      setDash(data);
    } catch {
      toast.error("Could not update availability");
    } finally {
      setAvailLoading(false);
    }
  }

  async function respond(requestId, status) {
    try {
      await api.post(`/requests/${requestId}/respond`, { status });
      toast.success(status === "accepted" ? "Thank you for helping!" : "Response recorded");
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not respond");
    }
  }

  const available    = Boolean(dash?.donor?.is_available);
  const bloodType    = dash?.donor?.blood_type;
  const lastDonation = dash?.donor?.last_donation_date || dash?.stats?.lastDonation;
  const daysLeft     = getDaysUntilEligible(lastDonation);
  const isEligible   = daysLeft === 0;
  const daysPassed   = getDaysSinceDonation(lastDonation);
  const compat       = COMPATIBILITY[bloodType];

  return (
    <div className="bg-bgLight px-4 py-8 transition-colors dark:bg-bgDark sm:py-10">
      <div className="mx-auto max-w-6xl">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 border-b border-slate-200 pb-8 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-primary">Donor</p>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Welcome back, {user?.name}
            </h1>
            {bloodType && (
              <span className="mt-2 inline-block rounded-full bg-primary/15 px-4 py-1 text-sm font-extrabold text-primary shadow-glow-red">
                {bloodType}
              </span>
            )}
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Availability</span>
            <motion.button
              type="button"
              layout
              disabled={availLoading}
              onClick={() => setAvailable(!available)}
              className={`relative flex h-12 w-52 items-center rounded-full p-1 transition-colors ${
                available ? "bg-success/30" : "bg-slate-300 dark:bg-cardDark"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className={`absolute left-1 top-1 h-10 w-24 rounded-full shadow-md ${
                  available
                    ? "left-[calc(100%-6.25rem)] bg-success shadow-[0_0_20px_rgba(45,198,83,0.5)]"
                    : "left-1 bg-white dark:bg-slate-600"
                }`}
              />
              <span className="relative z-10 flex w-full justify-between px-4 text-xs font-extrabold">
                <span className={!available ? "text-slate-800 dark:text-white" : "text-slate-500"}>Off</span>
                <span className={available ? "text-bgDark" : "text-slate-500"}>On</span>
              </span>
            </motion.button>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {available ? "You are available to donate" : "You are currently unavailable"}
            </p>
          </div>
        </motion.div>

        {/* ── Stats row ── */}
        {loading ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map((i) => <SkeletonStat key={i} />)}
          </div>
        ) : (
          <motion.div
            initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              ["Times responded",   dash?.stats?.timesDonated    ?? 0],
              ["Requests received", dash?.stats?.requestsReceived ?? 0],
              ["Lives helped",      dash?.stats?.livesHelped      ?? 0],
              ["Last donation",     dash?.stats?.lastDonation     || "—"],
            ].map(([label, val]) => (
              <motion.div
                key={label}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                className="glass card-hover rounded-2xl p-5"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-extrabold text-primary">{val}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── ADD 1: Donation Eligibility ── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`mt-6 rounded-2xl border p-5 ${
              isEligible
                ? "border-success/40 bg-success/5"
                : "border-warning/40 bg-warning/5"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Donation Eligibility
                </p>
                <p className={`text-lg font-extrabold ${isEligible ? "text-success" : "text-warning"}`}>
                  {isEligible
                    ? "Eligible to donate"
                    : `Next eligible in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                </p>
                {!isEligible && lastDonation && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Last donation: {new Date(lastDonation).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
            {!isEligible && (
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>{daysPassed} / 90 days passed</span>
                  <span>{Math.round((daysPassed / 90) * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-cardDark">
                  <div
                    className="h-full rounded-full bg-warning transition-all"
                    style={{ width: `${Math.round((daysPassed / 90) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── ADD 2: Blood Type Compatibility ── */}
        {!loading && bloodType && compat && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 rounded-2xl border border-white/10 bg-cardDark p-5 dark:bg-cardDark"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              {bloodType} — Blood Type Compatibility
            </p>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-[120px] text-sm font-semibold text-slate-400">Can donate to:</span>
                <div className="flex flex-wrap gap-1.5">
                  {compat.donateTo.map((t) => (
                    <span key={t} className="rounded-lg bg-success/20 px-2.5 py-0.5 text-xs font-extrabold text-success">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-[120px] text-sm font-semibold text-slate-400">Can receive from:</span>
                <div className="flex flex-wrap gap-1.5">
                  {compat.receiveFrom.map((t) => (
                    <span key={t} className="rounded-lg bg-blue-500/20 px-2.5 py-0.5 text-xs font-extrabold text-blue-400">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ADD 3: Quick Actions ── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 grid gap-3 sm:grid-cols-3"
          >
            {[
              { icon: "", title: "Find Donors",    sub: "See donors near you on the map",    border: "border-blue-500/30  hover:border-blue-500/70  hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",  path: "/map" },
              { icon: "", title: "Open Requests",  sub: "See all active blood requests",      border: "border-orange-500/30 hover:border-orange-500/70 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]", path: "/requests" },
              { icon: "", title: "My Profile",     sub: "Update blood type and details",      border: "border-purple-500/30 hover:border-purple-500/70 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]", path: "/donor/profile" },
            ].map(({ icon, title, sub, border, path }) => (
              <button
                key={title}
                type="button"
                onClick={() => navigate(path)}
                className={`card-hover rounded-2xl border bg-cardDark p-5 text-left transition-all ${border}`}
              >
                <p className="mt-3 font-extrabold text-white">{title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
              </button>
            ))}
          </motion.div>
        )}

        {/* ── Active Alerts ── */}
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Active alerts</h2>
          {!loading && alerts.length === 0 && (
            <div className="glass mt-6 rounded-2xl p-12 text-center text-slate-600 dark:text-slate-400">
              No active alerts. Stay on standby!
            </div>
          )}
          <div className="mt-6 space-y-4">
            <AnimatePresence>
              {alerts.map((a) => (
                <motion.div
                  key={a.id} layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass card-hover rounded-2xl p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white">{a.hospital_name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {a.city} · {a.time_ago}
                        {a.distance_km != null && ` · ${a.distance_km.toFixed(1)} km away`}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-lg bg-primary/15 px-2 py-0.5 text-sm font-bold text-primary">
                          {a.blood_type}
                        </span>
                        <span className={`rounded-lg px-2 py-0.5 text-xs font-extrabold uppercase ${
                          a.urgency === "critical"
                            ? "animate-pulse-glow bg-primary text-white"
                            : a.urgency === "high"
                              ? "bg-warning text-bgDark"
                              : "bg-accentGold/80 text-bgDark"
                        }`}>
                          {a.urgency}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAcceptanceForm(a)}
                        className="min-h-[44px] rounded-xl bg-success px-4 py-2 text-sm font-bold text-white hover:opacity-90"
                      >
                        I&apos;ll donate
                      </button>
                      <button
                        type="button"
                        onClick={() => respond(a.id, "declined")}
                        className="min-h-[44px] rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 dark:border-white/20 dark:text-slate-300"
                      >
                        Can&apos;t help
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* ── Response History ── */}
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Response history</h2>
          {loading ? (
            <SkeletonTable rows={4} />
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surfaceLight dark:bg-cardDark">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">Date</th>
                    <th className="px-4 py-3 font-bold">Hospital</th>
                    <th className="px-4 py-3 font-bold">Type</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(history?.history || []).map((row, i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-white/5">
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {row.responded_at ? new Date(row.responded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row.hospital_name}</td>
                      <td className="px-4 py-3">{row.blood_type}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          row.status === "accepted" || row.status === "completed"
                            ? "bg-success/20 text-success"
                            : row.status === "declined"
                              ? "bg-primary/20 text-primary"
                              : "bg-warning/20 text-warning"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {history && history.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button" disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border px-3 py-1 text-sm font-bold disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-2 py-1 text-sm">{page} / {history.totalPages}</span>
              <button
                type="button" disabled={page >= history.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border px-3 py-1 text-sm font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>

        {/* ── ADD 4: Donation Tips ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-10 mb-8 rounded-2xl border border-white/10 bg-cardDark p-5"
        >
          <p className="mb-4 font-extrabold text-white">Donation Tips</p>
          <ul className="space-y-2">
            {TIPS.map((tip) => (
              <li key={tip} className="text-sm text-slate-400">{tip}</li>
            ))}
          </ul>
        </motion.div>

      </div>

      {/* Donor Acceptance Form Modal */}
      {showAcceptanceForm && (
        <DonorAcceptanceForm
          request={showAcceptanceForm}
          onClose={() => setShowAcceptanceForm(null)}
          onSuccess={() => {
            load();
            setShowAcceptanceForm(null);
          }}
        />
      )}
    </div>
  );
}
