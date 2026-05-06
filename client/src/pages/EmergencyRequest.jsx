import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_OPTIONS = [
  {
    value: "low",
    label: "Low",
    sub: "Planned need",
    className:
      "border-warning/50 bg-warning/10 text-warning hover:bg-warning/20 data-[sel=true]:shadow-[0_0_24px_rgba(255,159,28,0.35)]",
  },
  {
    value: "medium",
    label: "Medium",
    sub: "Soon",
    className:
      "border-warning/60 bg-warning/15 text-slate-900 hover:bg-warning/25 data-[sel=true]:ring-2 data-[sel=true]:ring-warning",
  },
  {
    value: "critical",
    label: "Critical",
    sub: "Immediate",
    className:
      "border-primary bg-primary/15 text-primary data-[sel=true]:animate-pulse-glow data-[sel=true]:border-primary data-[sel=true]:bg-primary/25",
  },
];

function BloodDropIcon({ active }) {
  return (
    <svg
      viewBox="0 0 24 32"
      className={`h-8 w-6 transition ${active ? "scale-110 drop-shadow-[0_0_12px_rgba(230,57,70,0.8)]" : "opacity-70"}`}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M12 0C8 8 2 14 2 20c0 5.5 4.5 10 10 10s10-4.5 10-10c0-6-6-12-10-20z"
      />
    </svg>
  );
}

export default function EmergencyRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bloodType, setBloodType] = useState("O+");
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState("medium");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState("form");

  function bumpQty(delta) {
    setQuantity((q) => Math.min(500, Math.max(1, q + delta)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    const q = Math.min(500, Math.max(1, Number(quantity) || 1));
    if (notes.length > 2000) {
      setError("Notes must be at most 2000 characters.");
      return;
    }
    setSubmitting(true);
    setPhase("sending");
    try {
      const { data } = await api.post("/api/requests", {
        blood_type: bloodType,
        quantity_units: q,
        urgency,
        notes: notes.trim() || undefined,
      });
      setSuccess(data);
      setPhase("done");
      setTimeout(() => navigate("/hospital/dashboard"), 2800);
    } catch (err) {
      setPhase("form");
      const d = err.response?.data;
      console.error("Emergency request failed:");
      console.error("Status:", err.response?.status);
      console.error("Server response:", JSON.stringify(d, null, 2));
      setError(
        d?.sqlMessage ||
        d?.message ||
        d?.error ||
        err.message ||
        "Could not post request. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const notified = success?.donorsNotified ?? 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bgDark text-textDark transition-colors duration-300">
      <div
        className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-100"
        style={{
          background:
            "linear-gradient(165deg, #1a0508 0%, #0D0D0D 40%, #1a0a0c 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(230,57,70,0.45), transparent 42%), radial-gradient(circle at 85% 10%, rgba(193,18,31,0.35), transparent 38%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-6">
        <Link
          to="/hospital/dashboard"
          className="inline-flex text-sm font-semibold text-primaryLight transition hover:text-white"
        >
          ← Back to dashboard
        </Link>
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primaryLight">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Post emergency blood request
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              <span className="text-white">🚨 </span>
              Alerts go out immediately
            </h1>
            <p className="mt-2 max-w-xl text-slate-300">
              Matching donors within{" "}
              <strong className="text-white">50 km</strong> receive SMS, email,
              and in-app notifications.
            </p>
          </div>
          {user && (
            <p className="text-sm text-slate-400">
              Signed in as{" "}
              <span className="font-bold text-white">{user.name}</span>
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="glass rounded-3xl border border-primary/25 p-6 shadow-glow-red-lg sm:p-10"
        >
          <AnimatePresence mode="wait">
            {phase === "done" && success ? (
              <motion.div
                key="done"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20 text-4xl text-success"
                >
                  ✓
                </motion.div>
                <p className="mt-6 text-xl font-extrabold text-white">
                  {notified} donor{notified === 1 ? "" : "s"} notified
                </p>
                <p className="mt-2 text-slate-400">Redirecting to your dashboard…</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {error && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-primary/50 bg-primary/15 px-4 py-3 text-sm text-primaryLight"
                  >
                    {error}
                  </div>
                )}

                {phase === "sending" && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Sending alerts to nearby donors…
                    </span>
                  </div>
                )}

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Blood type needed
                  </label>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                    {BLOOD_TYPES.map((t) => {
                      const on = bloodType === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setBloodType(t)}
                          className={`card-hover flex min-h-[72px] flex-col items-center justify-center rounded-2xl border-2 py-2 text-sm font-extrabold transition ${
                            on
                              ? "border-primary bg-primary/20 text-primaryLight shadow-glow-red"
                              : "border-white/10 bg-white/5 text-slate-300 hover:border-primary/40"
                          }`}
                        >
                          <BloodDropIcon active={on} />
                          <span className="mt-1">{t}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Units required
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => bumpQty(-1)}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 text-xl font-bold hover:bg-white/10"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value, 10) || 1)
                          )
                        }
                        className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-center text-lg font-bold text-white outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <button
                        type="button"
                        onClick={() => bumpQty(1)}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 text-xl font-bold hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Urgency
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {URGENCY_OPTIONS.map((u) => {
                      const sel = urgency === u.value;
                      return (
                        <button
                          key={u.value}
                          type="button"
                          data-sel={sel}
                          onClick={() => setUrgency(u.value)}
                          className={`card-hover min-h-[88px] rounded-2xl border-2 p-4 text-left transition ${u.className} ${
                            sel ? "ring-2 ring-offset-2 ring-offset-bgDark ring-primary" : ""
                          }`}
                        >
                          <p className="text-lg font-extrabold">{u.label}</p>
                          <p className="text-xs font-semibold opacity-80">{u.sub}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Notes <span className="font-normal opacity-60">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Ward, contact, cross-match, etc."
                    className="w-full resize-y rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Preview
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    Requesting{" "}
                    <strong className="text-primaryLight">
                      {quantity} unit{quantity === 1 ? "" : "s"}
                    </strong>{" "}
                    of <strong className="text-white">{bloodType}</strong> blood ·
                    urgency{" "}
                    <strong className="capitalize text-warning">{urgency}</strong>
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    By submitting, you confirm this request is accurate.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting || !!success}
                    className="btn-primary min-h-[52px] w-full animate-pulse-glow px-8 text-base font-extrabold uppercase tracking-wide sm:w-auto disabled:animate-none disabled:opacity-50"
                  >
                    {submitting
                      ? "Dispatching…"
                      : "🚨 Send emergency alert"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
