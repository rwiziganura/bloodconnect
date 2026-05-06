import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";

const PIE_COLORS = [
  "#E63946",
  "#C1121F",
  "#FF6B6B",
  "#FFD60A",
  "#2DC653",
  "#FF9F1C",
  "#9333ea",
  "#2563eb",
];

const PAGE_SIZE = 10;

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const gridStroke = isDark ? "rgba(255,255,255,0.08)" : "#fecaca";
  const tickFill = isDark ? "#94a3b8" : "#64748b";
  const tooltipBg = isDark ? "#242424" : "#fff";
  const tooltipBorder = isDark ? "rgba(230,57,70,0.35)" : "#fecaca";

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [broadcastSubject, setBroadcastSubject] = useState("BloodConnect update");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("donors");
  const [broadcastChannel, setBroadcastChannel] = useState("both");
  const [broadcastErrors, setBroadcastErrors] = useState({});
  const [broadcastResult, setBroadcastResult] = useState(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userPage, setUserPage] = useState(0);

  const load = useCallback(async () => {
    setError("");
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/users"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Could not load admin data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setUserPage(0);
  }, [userSearch, userRoleFilter]);

  async function approveHospital(hospitalId) {
    setActionId(`approve-${hospitalId}`);
    setError("");
    try {
      await api.put(`/api/admin/hospitals/${hospitalId}/approve`);
      toast.success("Hospital approved");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Approve failed");
    } finally {
      setActionId(null);
    }
  }

  async function confirmRejectHospital() {
    if (!rejectModal) return;
    setActionId(`reject-${rejectModal.id}`);
    setError("");
    try {
      await api.delete(`/api/admin/hospitals/${rejectModal.id}/reject`);
      toast.success("Hospital registration rejected");
      setRejectModal(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Reject failed");
    } finally {
      setActionId(null);
    }
  }

  async function confirmDeleteUser() {
    if (!deleteModal) return;
    setActionId(`del-${deleteModal.id}`);
    setError("");
    try {
      await api.delete(`/api/admin/users/${deleteModal.id}`);
      toast.success("User deleted");
      setDeleteModal(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    } finally {
      setActionId(null);
    }
  }

  function validateBroadcast() {
    const errs = {};
    const sub = broadcastSubject.trim();
    const msg = broadcastMessage.trim();
    if (!sub || sub.length < 3) {
      errs.subject = "Subject must be at least 3 characters.";
    }
    if (sub.length > 200) errs.subject = "Subject is too long (max 200).";
    if (msg.length < 5) errs.message = "Message must be at least 5 characters.";
    if (msg.length > 2000) errs.message = "Message is too long (max 2000).";
    setBroadcastErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submitBroadcast(e) {
    e.preventDefault();
    setBroadcastResult(null);
    if (!validateBroadcast()) return;
    setBroadcasting(true);
    setError("");
    try {
      const { data } = await api.post("/api/admin/broadcast", {
        subject: broadcastSubject.trim(),
        message: broadcastMessage.trim(),
        target: broadcastTarget,
        channel: broadcastChannel,
      });
      setBroadcastResult(data);
      setBroadcastMessage("");
      toast.success(`Reached ${data.reached} recipient(s)`);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Broadcast failed."
      );
    } finally {
      setBroadcasting(false);
    }
  }

  const chartData30 =
    stats?.requestsOverTime30?.map((r) => ({
      day: r.day,
      count: Number(r.count),
    })) || [];

  const pieData =
    stats?.requestsByBloodType?.map((r) => ({
      name: r.name,
      value: Number(r.value),
    })) || [];

  const barData =
    stats?.donorsByCity?.map((r) => ({
      name: r.name,
      value: Number(r.value),
    })) || [];

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
      if (!q) return true;
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && String(u.phone).toLowerCase().includes(q))
      );
    });
  }, [users, userSearch, userRoleFilter]);

  const userPageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = useMemo(() => {
    const start = userPage * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, userPage]);

  useEffect(() => {
    if (userPage >= userPageCount) setUserPage(Math.max(0, userPageCount - 1));
  }, [userPage, userPageCount]);

  const statCards = stats
    ? [
        { label: "Total donors", value: stats.totalDonors, icon: "" },
        { label: "Total hospitals", value: stats.totalHospitals, icon: "" },
        { label: "Total requests", value: stats.totalRequests, icon: "" },
        { label: "Fulfilled", value: stats.fulfilledRequests, icon: "" },
        { label: "Pending approvals", value: stats.pendingApprovals, icon: "" },
        { label: "Active alerts", value: stats.activeAlerts, icon: "" },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-bgLight dark:bg-bgDark">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-bgLight dark:bg-bgDark transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-textLight dark:text-textDark">
            Admin panel
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage users, approve hospitals, and broadcast updates.
          </p>
        </motion.div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary"
          >
            {error}
          </div>
        )}

        {statCards.length > 0 && (
          <motion.div
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {statCards.map((s) => (
              <motion.div
                key={s.label}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 },
                }}
                className="glass card-hover rounded-2xl p-5"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {s.label}
                </p>
                <p className="mt-2 text-3xl font-extrabold tabular-nums text-primary">
                  {s.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {chartData30.length > 0 && (
            <div className="glass rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg font-extrabold text-textLight dark:text-textDark">
                Requests (30 days)
              </h2>
              <div className="mt-4 h-64 w-full sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData30} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: tickFill }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: tickFill }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: `1px solid ${tooltipBorder}`,
                        background: tooltipBg,
                        color: isDark ? "#f5f5f5" : "#1a1a1a",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#E63946"
                      strokeWidth={2}
                      dot={{ fill: "#E63946", r: 3 }}
                      name="Requests"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {pieData.length > 0 && (
            <div className="glass rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg font-extrabold text-textLight dark:text-textDark">
                Requests by blood type
              </h2>
              <div className="mt-4 h-64 w-full sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: `1px solid ${tooltipBorder}`,
                        background: tooltipBg,
                        color: isDark ? "#f5f5f5" : "#1a1a1a",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {barData.length > 0 && (
          <div className="mt-6 glass rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-extrabold text-textLight dark:text-textDark">
              Donors by city (top 12)
            </h2>
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: tickFill }}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: tickFill }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: `1px solid ${tooltipBorder}`,
                      background: tooltipBg,
                      color: isDark ? "#f5f5f5" : "#1a1a1a",
                    }}
                  />
                  <Bar dataKey="value" fill="#E63946" radius={[6, 6, 0, 0]} name="Donors" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-textLight dark:text-textDark">
            Hospitals pending approval
          </h2>
          {!stats?.pendingHospitals?.length ? (
            <p className="mt-4 rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
              No pending hospitals.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.pendingHospitals.map((h) => (
                <li
                  key={h.id}
                  className="flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 dark:bg-warning/5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-textLight dark:text-textDark">
                      {h.hospital_name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {h.city} · {h.contact_name} ({h.email})
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={actionId === `approve-${h.id}`}
                      onClick={() => approveHospital(h.id)}
                      className="min-h-[44px] rounded-xl bg-success px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={actionId === `reject-${h.id}`}
                      onClick={() => setRejectModal({ id: h.id, name: h.hospital_name })}
                      className="min-h-[44px] rounded-xl border border-primary/50 px-4 py-2 text-sm font-bold text-primary disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-textLight dark:text-textDark">
            Broadcast
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            In-app notifications are always saved. SMS and email run when configured and
            channel allows.
          </p>
          <form
            onSubmit={submitBroadcast}
            className="mt-4 glass rounded-2xl p-5 sm:p-6"
          >
            {broadcastResult && (
              <p className="mb-4 rounded-xl bg-success/15 px-4 py-3 text-sm text-success">
                Reached <strong>{broadcastResult.reached}</strong> recipients.
                Notifications saved:{" "}
                <strong>{broadcastResult.notificationsWritten}</strong>.
                {broadcastResult.failed > 0 && (
                  <span className="block text-warning">
                    Delivery failures: {broadcastResult.failed}
                  </span>
                )}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target audience
                </label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-surfaceLight px-4 py-2.5 text-textLight outline-none dark:border-white/10 dark:bg-cardDark dark:text-textDark"
                >
                  <option value="donors">All available donors</option>
                  <option value="hospitals">All hospitals</option>
                  <option value="all">Everyone (donors + hospitals)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Send via
                </label>
                <select
                  value={broadcastChannel}
                  onChange={(e) => setBroadcastChannel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-surfaceLight px-4 py-2.5 text-textLight outline-none dark:border-white/10 dark:bg-cardDark dark:text-textDark"
                >
                  <option value="both">SMS + Email</option>
                  <option value="sms">SMS only</option>
                  <option value="email">Email only</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email subject
              </label>
              <input
                type="text"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 outline-none transition dark:bg-cardDark dark:text-textDark ${
                  broadcastErrors.subject
                    ? "border-primary"
                    : "border-slate-200 dark:border-white/10"
                }`}
              />
              {broadcastErrors.subject && (
                <p className="mt-1 text-xs text-primary">{broadcastErrors.subject}</p>
              )}
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Message
              </label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={5}
                className={`w-full resize-y rounded-xl border px-4 py-2.5 outline-none transition dark:bg-cardDark dark:text-textDark ${
                  broadcastErrors.message
                    ? "border-primary"
                    : "border-slate-200 dark:border-white/10"
                }`}
                placeholder="Important update…"
              />
              {broadcastErrors.message && (
                <p className="mt-1 text-xs text-primary">{broadcastErrors.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={broadcasting}
              className="btn-primary mt-6 min-h-[48px] w-full sm:w-auto"
            >
              {broadcasting ? "Sending…" : "Send broadcast"}
            </button>
          </form>
        </section>

        <section className="mt-12 pb-10">
          <h2 className="text-xl font-extrabold text-textLight dark:text-textDark">
            All users
          </h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              placeholder="Search name, email, phone…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-surfaceLight px-4 py-2 dark:border-white/10 dark:bg-cardDark dark:text-textDark sm:max-w-md"
            />
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="min-h-[44px] rounded-xl border border-slate-200 bg-surfaceLight px-4 py-2 dark:border-white/10 dark:bg-cardDark dark:text-textDark"
            >
              <option value="all">All roles</option>
              <option value="donor">Donor</option>
              <option value="hospital">Hospital</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Showing {filteredUsers.length} user(s)
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
            <table className="min-w-[640px] w-full divide-y divide-slate-200 text-sm dark:divide-white/10">
              <thead className="bg-cardLight text-left dark:bg-cardDark">
                <tr>
                  <th className="px-4 py-3 font-bold text-textLight dark:text-textDark">
                    Name
                  </th>
                  <th className="px-4 py-3 font-bold text-textLight dark:text-textDark">
                    Email
                  </th>
                  <th className="px-4 py-3 font-bold text-textLight dark:text-textDark">
                    Role
                  </th>
                  <th className="px-4 py-3 font-bold text-textLight dark:text-textDark">
                    Hospital
                  </th>
                  <th className="px-4 py-3 font-bold text-textLight dark:text-textDark">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {pagedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-primary/5">
                    <td className="px-4 py-3 font-semibold text-textLight dark:text-textDark">
                      {u.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-700 dark:text-slate-300">
                      {u.role}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {u.role === "hospital" && u.hospital_name ? (
                        <span>
                          {u.hospital_name}
                          {Number(u.hospital_is_approved) ? (
                            <span className="ml-1 text-success">verified</span>
                          ) : (
                            <span className="ml-1 text-warning">pending</span>
                          )}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {u.role === "hospital" &&
                          u.hospital_id &&
                          !Number(u.hospital_is_approved) && (
                            <button
                              type="button"
                              disabled={actionId === `approve-${u.hospital_id}`}
                              onClick={() => approveHospital(u.hospital_id)}
                              className="min-h-[40px] rounded-lg bg-success px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                        <button
                          type="button"
                          disabled={actionId === `del-${u.id}`}
                          onClick={() =>
                            setDeleteModal({ id: u.id, name: u.name, email: u.email })
                          }
                          className="min-h-[40px] rounded-lg border border-primary/40 px-3 py-1 text-xs font-bold text-primary disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {userPageCount > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Page {userPage + 1} of {userPageCount}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={userPage === 0}
                  onClick={() => setUserPage((p) => Math.max(0, p - 1))}
                  className="min-h-[44px] rounded-xl border px-4 py-2 text-sm font-bold dark:border-white/15 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={userPage >= userPageCount - 1}
                  onClick={() => setUserPage((p) => p + 1)}
                  className="min-h-[44px] rounded-xl border px-4 py-2 text-sm font-bold dark:border-white/15 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {rejectModal && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRejectModal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-extrabold text-textLight dark:text-textDark">
                Reject hospital?
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                This will delete <strong>{rejectModal.name}</strong> and their user
                account. This cannot be undone.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="min-h-[44px] flex-1 rounded-xl border px-4 font-bold dark:border-white/15"
                  onClick={() => setRejectModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionId === `reject-${rejectModal.id}`}
                  className="min-h-[44px] flex-1 rounded-xl bg-primary px-4 font-bold text-white disabled:opacity-50"
                  onClick={confirmRejectHospital}
                >
                  Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModal && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-extrabold text-textLight dark:text-textDark">
                Delete user?
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Remove <strong>{deleteModal.name}</strong> ({deleteModal.email}) and
                related data. This cannot be undone.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="min-h-[44px] flex-1 rounded-xl border px-4 font-bold dark:border-white/15"
                  onClick={() => setDeleteModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionId === `del-${deleteModal.id}`}
                  className="min-h-[44px] flex-1 rounded-xl bg-primary px-4 font-bold text-white disabled:opacity-50"
                  onClick={confirmDeleteUser}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
