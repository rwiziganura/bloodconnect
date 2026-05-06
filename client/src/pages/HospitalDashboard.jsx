import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import HospitalDonorManagement from "../components/HospitalDonorManagement.jsx";

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function HospitalDashboard() {
  const { user } = useAuth();
  const [hospital, setHospital] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [modalReq, setModalReq] = useState(null);
  const [modalDonors, setModalDonors] = useState([]);
  const [listView, setListView] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    let c = true;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const [profileRes, reqRes] = await Promise.all([
          api.get("/api/hospitals/me"),
          api.get("/api/requests/hospital"),
        ]);
        if (!c) return;
        setHospital(profileRes.data.hospital);
        setRequests(reqRes.data.requests || []);
      } catch (err) {
        if (!c) return;
        setError(
          err.response?.data?.error ||
            err.message ||
            "Could not load dashboard data."
        );
      } finally {
        if (c) setLoading(false);
      }
    })();
    return () => {
      c = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = requests.length;
    const fulfilled = requests.filter((r) => r.status === "fulfilled").length;
    const notified = requests.reduce(
      (s, r) => s + (Number(r.donors_notified_count) || 0),
      0
    );
    return { total, fulfilled, notified };
  }, [requests]);

  async function updateStatus(requestId, status) {
    setUpdatingId(requestId);
    setError("");
    try {
      const { data } = await api.put(`/api/requests/${requestId}/status`, {
        status,
      });
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? data.request : r))
      );
      toast.success("Updated");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  async function openModal(r) {
    setModalReq(r);
    try {
      const { data } = await api.get(`/api/requests/${r.id}/responses`);
      setModalDonors(data.donors || []);
    } catch {
      setModalDonors([]);
      toast.error("Could not load donor responses");
    }
  }

  const activeRequests = requests.filter((r) => r.status === "open");

  return (
    <div className="bg-bgLight dark:bg-bgDark">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-8 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {hospital?.hospital_name || "Hospital"}
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              {hospital?.city}
            </p>
            <span
              className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${
                hospital?.is_approved
                  ? "bg-success/20 text-success"
                  : "bg-warning/20 text-warning"
              }`}
            >
              {hospital?.is_approved ? "Verified" : "Pending approval"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setListView((v) => !v)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold dark:border-white/10"
            >
              {listView ? "Board view" : "List view"}
            </button>
            <Link
              to="/hospital/request"
              className="btn-primary min-h-[48px] px-6"
            >
              Post emergency request
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex gap-2 border-b border-slate-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 font-bold transition ${
              activeTab === 'requests'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Blood Requests
          </button>
          <button
            onClick={() => setActiveTab('donors')}
            className={`px-4 py-2 font-bold transition ${
              activeTab === 'donors'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Donor Applications
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Total requests", stats.total],
            ["Fulfilled", stats.fulfilled],
            ["Donors notified (sum)", stats.notified],
          ].map(([l, v]) => (
            <div key={l} className="glass card-hover rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {l}
              </p>
              <p className="mt-2 text-3xl font-extrabold text-primary">{v}</p>
            </div>
          ))}
        </div>

        {activeTab === 'requests' && (
        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Requests
            </h2>
            <p className="text-sm text-slate-500">
              {activeRequests.length} open
            </p>
          </div>

          {loading ? (
            <div className="mt-10 flex justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div
              className={`mt-6 ${
                listView ? "space-y-4" : "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {requests.map((r) => {
                const accepted = Number(r.accepted_count) || 0;
                const need = Number(r.quantity_units) || 1;
                const pct = Math.min(100, Math.round((accepted / need) * 100));
                return (
                  <motion.div
                    layout
                    key={r.id}
                    className="glass card-hover cursor-pointer rounded-2xl p-5"
                    onClick={() => openModal(r)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-2xl font-extrabold text-primary">
                        {r.blood_type}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-extrabold uppercase ${
                          r.urgency === "critical"
                            ? "animate-pulse-glow bg-primary text-white"
                            : r.urgency === "high"
                              ? "bg-warning text-bgDark"
                              : "bg-slate-200 dark:bg-cardDark"
                        }`}
                      >
                        {r.urgency}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {r.quantity_units} units · {timeAgo(r.created_at)} ·{" "}
                      {r.donors_notified_count ?? 0} notified · {accepted} accepted
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-cardDark">
                      <div
                        className="h-full bg-success transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {r.status === "open" && (
                      <div
                        className="mt-4 flex flex-wrap gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          disabled={updatingId === r.id}
                          onClick={() => updateStatus(r.id, "fulfilled")}
                          className="min-h-[44px] rounded-xl bg-success px-3 py-2 text-xs font-bold text-white"
                        >
                          Fulfilled
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === r.id}
                          onClick={() => updateStatus(r.id, "cancelled")}
                          className="min-h-[44px] rounded-xl border px-3 py-2 text-xs font-bold dark:border-white/20"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
        )}

        {activeTab === 'donors' && (
          <section className="mt-12">
            <HospitalDonorManagement />
          </section>
        )}
      </div>

      <AnimatePresence>
        {modalReq && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalReq(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Donor responses · {modalReq.blood_type}
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b dark:border-white/10">
                      <th className="py-2 pr-4 font-bold">Donor</th>
                      <th className="py-2 pr-4 font-bold">Type</th>
                      <th className="py-2 pr-4 font-bold">City</th>
                      <th className="py-2 pr-4 font-bold">Km</th>
                      <th className="py-2 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalDonors.map((d, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-white/5">
                        <td className="py-2 pr-4 font-medium">{d.donor_name}</td>
                        <td className="py-2 pr-4">{d.blood_type}</td>
                        <td className="py-2 pr-4">{d.city}</td>
                        <td className="py-2 pr-4">
                          {d.distance_km != null ? d.distance_km.toFixed(1) : "—"}
                        </td>
                        <td className="py-2">
                          <span className="rounded-full bg-primary/15 px-2 text-xs font-bold text-primary">
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="btn-primary mt-6 w-full"
                onClick={() => setModalReq(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
