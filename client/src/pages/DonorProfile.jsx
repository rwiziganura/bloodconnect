import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CITIES = [
  'Kigali', 'Butare', 'Musanze', 'Huye', 'Muhanga',
  'Rubavu', 'Kayonza', 'Kirehe', 'Nyagatare', 'Ruhango', 'Karongi', 'Rusizi',
];

export default function DonorProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', blood_type: '', city: '', last_donation_date: '',
  });

  useEffect(() => {
    api.get('/donors/profile/me')
      .then(({ data }) => {
        const d = data.donor;
        setForm({
          name: d.name || '',
          phone: d.phone || '',
          blood_type: d.blood_type || '',
          city: d.city || '',
          last_donation_date: d.last_donation_date ? d.last_donation_date.split('T')[0] : '',
        });
        setIsAvailable(Boolean(d.is_available));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.put('/donors/profile/me', form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const { data } = await api.put('/donors/me/availability', {});
      setIsAvailable(data.is_available);
    } catch {
      alert('Failed to update availability');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bgDark">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgDark px-4 py-8 font-sans text-white">
      <div className="mx-auto max-w-xl">

        {/* Header */}
        <button
          onClick={() => navigate('/donor/dashboard')}
          className="mb-4 text-primary hover:underline"
        >
          ← Back to Dashboard
        </button>
        <h1 className="mb-1 text-3xl font-extrabold">👤 My Donor Profile</h1>
        <p className="mb-6 text-slate-400">
          Keep your profile updated so hospitals and patients can find you easily.
        </p>

        {/* Availability toggle */}
        <div className={`mb-4 flex items-center justify-between rounded-2xl border p-5 ${isAvailable ? 'border-success bg-success/10' : 'border-white/10 bg-cardDark'}`}>
          <div>
            <p className="font-bold">Donation Availability</p>
            <p className={`text-sm ${isAvailable ? 'text-success' : 'text-slate-500'}`}>
              {isAvailable ? '✅ You are available to donate' : '⏸️ You are currently unavailable'}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            aria-label="Toggle availability"
            className={`relative h-8 w-16 rounded-full transition-colors ${isAvailable ? 'bg-success' : 'bg-slate-600'}`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${isAvailable ? 'left-9' : 'left-1'}`}
            />
          </button>
        </div>

        {/* Blood type picker */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-cardDark p-5">
          <p className="mb-3 font-bold">🩸 Your Blood Type</p>
          <div className="grid grid-cols-4 gap-2">
            {BLOOD_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, blood_type: t })}
                className={`rounded-xl py-3 text-lg font-extrabold transition-all ${
                  form.blood_type === t
                    ? 'border-2 border-primary bg-primary/20 text-primary'
                    : 'border border-white/10 bg-bgDark text-slate-400 hover:border-primary/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Profile form */}
        <div className="rounded-2xl border border-white/10 bg-cardDark p-5">
          <p className="mb-4 font-bold">📋 Personal Details</p>
          <form onSubmit={handleSave} className="space-y-4">

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-bgDark px-4 py-3 text-white outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+250 7XX XXX XXX"
                className="w-full rounded-xl border border-white/10 bg-bgDark px-4 py-3 text-white outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">City</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-bgDark px-4 py-3 text-white outline-none focus:border-primary"
              >
                <option value="">Select your city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Last Donation Date</label>
              <input
                type="date"
                value={form.last_donation_date}
                onChange={(e) => setForm({ ...form, last_donation_date: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-bgDark px-4 py-3 text-white outline-none focus:border-primary"
              />
              <p className="mt-1 text-xs text-slate-500">Wait at least 3 months between donations.</p>
            </div>

            {success && (
              <div className="rounded-xl border border-success bg-success/15 px-4 py-3 text-center font-bold text-success">
                ✅ Profile saved successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
