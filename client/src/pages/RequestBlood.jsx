import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY = [
  { value: 'low', label: '🟡 Low', color: 'text-yellow-400 border-yellow-400' },
  { value: 'medium', label: '🟠 Medium', color: 'text-orange-400 border-orange-400' },
  { value: 'critical', label: '🔴 Critical', color: 'text-primary border-primary' },
];

export default function RequestBlood() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    blood_type: '', quantity_units: 1, urgency: 'medium',
    patient_name: '', contact_phone: '', notes: '',
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.blood_type) { alert('Please select a blood type'); return; }
    setLoading(true);
    try {
      console.log('Submitting request:', form);
      const { data } = await api.post('/api/requests', form);
      console.log('Success:', data);
      setResult(data.donorsNotified ?? 0);
    } catch (err) {
      console.error('FULL ERROR:', err);
      console.error('Response data:', err.response?.data);
      console.error('Status:', err.response?.status);
      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to post request. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (result !== null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bgDark px-4">
        <div className="w-full max-w-md rounded-2xl border border-success bg-cardDark p-10 text-center">
          <div className="text-6xl">✅</div>
          <h2 className="mt-4 text-2xl font-extrabold text-success">Request Sent!</h2>
          <p className="mt-2 text-slate-400">Your blood request has been posted.</p>
          <div className="my-6 rounded-xl border border-primary bg-primary/10 py-6">
            <p className="text-5xl font-extrabold text-primary">{result}</p>
            <p className="mt-1 text-slate-400">matching donors notified nearby</p>
          </div>
          <p className="mb-6 text-sm text-slate-500">
            Donors will contact you on the phone number you provided.
          </p>
          <button onClick={() => navigate('/donor/dashboard')} className="btn-primary w-full">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgDark px-4 py-8 font-sans text-white">
      <div className="mx-auto max-w-xl">

        <button onClick={() => navigate('/donor/dashboard')} className="mb-4 block text-primary hover:underline">
          ← Back to Dashboard
        </button>
        <h1 className="mb-1 text-3xl font-extrabold">🆘 Request Blood</h1>
        <p className="mb-6 text-slate-400">
          Fill in the details. Matching donors nearby will be notified immediately.
        </p>

        <div className="rounded-2xl border border-white/10 bg-cardDark p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Patient name */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Patient Name</label>
              <input
                type="text" required
                value={form.patient_name}
                onChange={(e) => set('patient_name', e.target.value)}
                placeholder="Full name of patient"
                className="w-full rounded-xl border border-white/10 bg-bgDark px-4 py-3 text-white outline-none focus:border-primary"
              />
            </div>

            {/* Contact phone */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Contact Phone</label>
              <input
                type="tel" required
                value={form.contact_phone}
                onChange={(e) => set('contact_phone', e.target.value)}
                placeholder="+250 7XX XXX XXX"
                className="w-full rounded-xl border border-white/10 bg-bgDark px-4 py-3 text-white outline-none focus:border-primary"
              />
            </div>

            {/* Blood type */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Blood Type Needed</label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map((t) => (
                  <button
                    key={t} type="button"
                    onClick={() => set('blood_type', t)}
                    className={`rounded-xl py-3 text-base font-extrabold transition-all ${
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

            {/* Quantity */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Units Needed</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => set('quantity_units', Math.max(1, form.quantity_units - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-bgDark text-2xl font-bold hover:border-primary"
                >−</button>
                <span className="min-w-[2rem] text-center text-2xl font-extrabold">{form.quantity_units}</span>
                <button
                  type="button"
                  onClick={() => set('quantity_units', form.quantity_units + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-bgDark text-2xl font-bold hover:border-primary"
                >+</button>
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Urgency Level</label>
              <div className="grid grid-cols-3 gap-2">
                {URGENCY.map((opt) => (
                  <button
                    key={opt.value} type="button"
                    onClick={() => set('urgency', opt.value)}
                    className={`rounded-xl border py-3 text-sm font-bold transition-all ${
                      form.urgency === opt.value
                        ? `border-2 bg-primary/10 ${opt.color}`
                        : 'border-white/10 bg-bgDark text-slate-400 hover:border-white/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Notes (optional)</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Hospital name, ward number, any other details..."
                className="w-full resize-y rounded-xl border border-white/10 bg-bgDark px-4 py-3 text-white outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.blood_type}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '⏳ Sending alerts to donors...' : '🚨 Send Blood Request'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
