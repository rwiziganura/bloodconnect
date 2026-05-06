import { useMemo, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  UserPlusIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function dashboardPath(role) {
  if (role === "donor") return "/donor/dashboard";
  if (role === "hospital") return "/hospital/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/";
}

function passwordStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

function FieldHint({ ok, show }) {
  if (!show) return null;
  return (
    <span className="mt-1 flex items-center gap-1">
      {ok ? (
        <CheckCircleIcon className="h-4 w-4 text-success" />
      ) : (
        <XCircleIcon className="h-4 w-4 text-warning" />
      )}
    </span>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("donor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [bloodType, setBloodType] = useState("O+");
  const [city, setCity] = useState("");
  const [lastDonation, setLastDonation] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalCity, setHospitalCity] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const strengthPct = (strength / 4) * 100;

  const fieldOk = {
    name: name.trim().length >= 2,
    email: EMAIL_RE.test(email.trim()),
    password: password.length >= 6,
    confirm: password === confirm && confirm.length > 0,
    donorCity: role !== "donor" || city.trim().length >= 2,
    hospital:
      role !== "hospital" || (hospitalName.trim() && hospitalCity.trim()),
  };

  if (user) {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }

  function nextStep() {
    if (step === 1) setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (!fieldOk.name || !fieldOk.email || !fieldOk.password || !fieldOk.confirm) {
      toast.error("Please complete all required fields");
      return;
    }
    if (role === "donor" && !fieldOk.donorCity) {
      toast.error("City is required for donors");
      return;
    }
    if (role === "hospital" && !fieldOk.hospital) {
      toast.error("Hospital details required");
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      password,
      role,
    };
    if (role === "donor") {
      payload.donorProfile = {
        blood_type: bloodType,
        city: city.trim(),
        last_donation_date: lastDonation || undefined,
      };
    } else {
      payload.hospitalProfile = {
        hospital_name: hospitalName.trim(),
        city: hospitalCity.trim(),
        address: address.trim() || undefined,
      };
    }

    setSubmitting(true);
    try {
      const response = await api.post("/api/auth/register", payload);
      const { user: newUser, token } = response.data;
      login(newUser, token);
      toast.success("Account created!");
      navigate(dashboardPath(newUser.role), { replace: true });
    } catch (err) {
      console.error("Register error:", err);
      toast.error(err.response?.data?.error || "Could not register");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bgLight transition-colors dark:bg-bgDark">
      <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-primaryDark via-bgDark to-bgDark lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:px-12">
          <div className="pointer-events-none absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-primary/30"
                style={{ left: `${15 + i * 12}%`, top: `${10 + (i % 3) * 20}%` }}
                animate={{ y: [0, -18, 0], opacity: [0.3, 0.7, 0.3] }}
                transition={{
                  duration: 4 + i * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <svg width="28" height="36" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C12 2 6 8.5 6 14a6 6 0 1 0 12 0c0-5.5-6-12-6-12z" />
                </svg>
              </motion.span>
            ))}
          </div>
          <div className="relative z-10 text-white">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
              Join the network that saves lives.
            </h2>
            <p className="mt-4 max-w-md text-red-100/80">
              Donors and hospitals coordinate in real time across Rwanda.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center px-4 py-12 sm:px-8">
          <div className="mx-auto w-full max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Step {step} of 2
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Create account
            </h1>
            <Link
              to="/login"
              className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Already have an account?
            </Link>

            <div className="glass mt-8 rounded-3xl p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="s1"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="space-y-4"
                  >
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Choose how you will use BloodConnect
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setRole("donor")}
                        className={`card-hover relative rounded-2xl border-2 p-5 text-left transition ${
                          role === "donor"
                            ? "border-primary shadow-glow-red"
                            : "border-slate-200 dark:border-white/10"
                        }`}
                      >
                        <UserPlusIcon className="h-8 w-8 text-primary" />
                        <p className="mt-3 font-bold text-slate-900 dark:text-white">
                          I am a donor
                        </p>
                        {role === "donor" && (
                          <CheckCircleIcon className="absolute right-3 top-3 h-6 w-6 text-success" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("hospital")}
                        className={`card-hover relative rounded-2xl border-2 p-5 text-left transition ${
                          role === "hospital"
                            ? "border-primary shadow-glow-red"
                            : "border-slate-200 dark:border-white/10"
                        }`}
                      >
                        <BuildingOffice2Icon className="h-8 w-8 text-primary" />
                        <p className="mt-3 font-bold text-slate-900 dark:text-white">
                          I represent a hospital
                        </p>
                        {role === "hospital" && (
                          <CheckCircleIcon className="absolute right-3 top-3 h-6 w-6 text-success" />
                        )}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn-primary mt-4 w-full"
                    >
                      Continue
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="s2"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-sm font-semibold text-primary"
                    >
                      ← Back
                    </button>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Full name
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition focus:ring-2 focus:ring-primary/30 dark:border-white/10 dark:bg-cardDark/80 dark:text-white"
                      />
                      <FieldHint ok={fieldOk.name} show={name.length > 0} />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30 dark:border-white/10 dark:bg-cardDark/80 dark:text-white"
                      />
                      <FieldHint ok={fieldOk.email} show={email.length > 0} />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Phone (optional)
                      </label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 outline-none dark:border-white/10 dark:bg-cardDark/80 dark:text-white"
                      />
                    </div>

                    {role === "donor" && (
                      <>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Blood type
                          </label>
                          <div className="mt-2 grid grid-cols-4 gap-2">
                            {BLOOD.map((b) => (
                              <button
                                key={b}
                                type="button"
                                onClick={() => setBloodType(b)}
                                className={`rounded-xl border py-2 text-xs font-bold ${
                                  bloodType === b
                                    ? "border-primary bg-primary/15 text-primary"
                                    : "border-slate-200 dark:border-white/10"
                                }`}
                              >
                                {b}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            City
                          </label>
                          <input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-cardDark/80 dark:text-white"
                          />
                          <FieldHint ok={fieldOk.donorCity} show={city.length > 0} />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Last donation (optional)
                          </label>
                          <input
                            type="date"
                            value={lastDonation}
                            onChange={(e) => setLastDonation(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-cardDark/80 dark:text-white"
                          />
                        </div>
                      </>
                    )}

                    {role === "hospital" && (
                      <>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Hospital name
                          </label>
                          <input
                            value={hospitalName}
                            onChange={(e) => setHospitalName(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-cardDark/80 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            City
                          </label>
                          <input
                            value={hospitalCity}
                            onChange={(e) => setHospitalCity(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-cardDark/80 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Address (optional)
                          </label>
                          <input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-cardDark/80 dark:text-white"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Password
                      </label>
                      <div className="relative mt-1">
                        <input
                          type={showPw ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 pr-12 dark:border-white/10 dark:bg-cardDark/80 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                        >
                          {showPw ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-cardDark">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-warning to-success transition-all"
                          style={{ width: `${strengthPct}%` }}
                        />
                      </div>
                      <FieldHint ok={fieldOk.password} show={password.length > 0} />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Confirm password
                      </label>
                      <input
                        type={showPw ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-cardDark/80 dark:text-white"
                      />
                      <FieldHint ok={fieldOk.confirm} show={confirm.length > 0} />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : null}
                      Create account
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
