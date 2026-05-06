import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function HospitalDonorManagement() {
  const [acceptances, setAcceptances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    location: '',
    date: '',
    time: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadAcceptances();
  }, []);

  const loadAcceptances = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/donor-acceptance/hospital/acceptances');
      setAcceptances(data.acceptances || []);
    } catch (error) {
      toast.error('Failed to load donor acceptances');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!appointmentData.location || !appointmentData.date || !appointmentData.time) {
      toast.error('Please fill in all appointment details');
      return;
    }

    setProcessing(true);
    try {
      await api.put(`/api/donor-acceptance/hospital/approve/${approveModal.id}`, {
        appointment_location: appointmentData.location,
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time
      });

      toast.success('Donor approved successfully!');
      setApproveModal(null);
      setAppointmentData({ location: '', date: '', time: '' });
      loadAcceptances();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve donor');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await api.put(`/api/donor-acceptance/hospital/reject/${rejectModal.id}`, {
        rejection_reason: rejectionReason
      });

      toast.success('Donor rejected');
      setRejectModal(null);
      setRejectionReason('');
      loadAcceptances();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject donor');
    } finally {
      setProcessing(false);
    }
  };

  const filteredAcceptances = acceptances.filter(acc => {
    if (filter === 'all') return true;
    return acc.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-success/20 text-success';
      case 'rejected':
        return 'bg-primary/20 text-primary';
      default:
        return 'bg-warning/20 text-warning';
    }
  };

  const getEligibilityStatus = (age, weight) => {
    const issues = [];
    if (age < 18 || age > 65) issues.push('Age');
    if (weight < 50) issues.push('Weight');
    
    if (issues.length === 0) {
      return <span className="text-success text-xs font-bold">✓ Eligible</span>;
    }
    return <span className="text-primary text-xs font-bold">⚠ {issues.join(', ')} issue</span>;
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Donor Applications
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Review and manage donor acceptances
          </p>
        </div>

        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'border border-slate-200 dark:border-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredAcceptances.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            No donor applications found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAcceptances.map(acc => (
            <motion.div
              key={acc.id}
              layout
              className="glass card-hover rounded-2xl p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {acc.full_name}
                    </h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusColor(acc.status)}`}>
                      {acc.status}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <span className="text-slate-500">Phone:</span>{' '}
                      <a href={`tel:${acc.phone}`} className="font-semibold text-blue-600 hover:underline">
                        {acc.phone}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-500">Email:</span>{' '}
                      <a href={`mailto:${acc.email}`} className="font-semibold text-blue-600 hover:underline">
                        {acc.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-500">Blood Type:</span>{' '}
                      <span className="font-bold text-primary">{acc.blood_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Age:</span>{' '}
                      <span className="font-semibold">{acc.age} years</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Weight:</span>{' '}
                      <span className="font-semibold">{acc.weight} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Eligibility:</span>{' '}
                      {getEligibilityStatus(acc.age, acc.weight)}
                    </div>
                    {acc.last_donation_date && (
                      <div>
                        <span className="text-slate-500">Last Donation:</span>{' '}
                        <span className="font-semibold">
                          {new Date(acc.last_donation_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {acc.medical_conditions && (
                    <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 p-3">
                      <p className="text-xs font-bold uppercase text-warning">Medical Conditions:</p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                        {acc.medical_conditions}
                      </p>
                    </div>
                  )}

                  {acc.status === 'approved' && acc.appointment_location && (
                    <div className="mt-3 rounded-lg border border-success/30 bg-success/10 p-3">
                      <p className="text-xs font-bold uppercase text-success">Appointment Details:</p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                        <strong>Location:</strong> {acc.appointment_location}<br />
                        <strong>Date:</strong> {new Date(acc.appointment_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}<br />
                        <strong>Time:</strong> {acc.appointment_time}
                      </p>
                    </div>
                  )}

                  {acc.status === 'rejected' && acc.rejection_reason && (
                    <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
                      <p className="text-xs font-bold uppercase text-primary">Rejection Reason:</p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                        {acc.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>

                {acc.status === 'pending' && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setApproveModal(acc)}
                      className="min-h-[44px] rounded-xl bg-success px-4 py-2 text-sm font-bold text-white hover:opacity-90"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectModal(acc)}
                      className="min-h-[44px] rounded-xl border border-primary/50 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Applied: {new Date(acc.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      <AnimatePresence>
        {approveModal && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setApproveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass max-w-lg w-full rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Approve Donor: {approveModal.full_name}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Set appointment details for the donor
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Location <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={appointmentData.location}
                    onChange={(e) => setAppointmentData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none dark:border-white/10 dark:bg-cardDark dark:text-textDark"
                    placeholder="Hospital address or room number"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Date <span className="text-primary">*</span>
                    </label>
                    <input
                      type="date"
                      value={appointmentData.date}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none dark:border-white/10 dark:bg-cardDark dark:text-textDark"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Time <span className="text-primary">*</span>
                    </label>
                    <input
                      type="time"
                      value={appointmentData.time}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none dark:border-white/10 dark:bg-cardDark dark:text-textDark"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setApproveModal(null)}
                  className="min-h-[44px] flex-1 rounded-xl border border-slate-200 font-bold dark:border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="btn-primary min-h-[44px] flex-1 disabled:opacity-50"
                >
                  {processing ? 'Approving...' : 'Approve Donor'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
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
              className="glass max-w-lg w-full rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Reject Donor: {rejectModal.full_name}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Please provide a reason for rejection
              </p>

              <div className="mt-4">
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-2.5 outline-none dark:border-white/10 dark:bg-cardDark dark:text-textDark"
                  placeholder="e.g., Medical conditions not suitable, weight below requirement..."
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setRejectModal(null)}
                  className="min-h-[44px] flex-1 rounded-xl border border-slate-200 font-bold dark:border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="min-h-[44px] flex-1 rounded-xl bg-primary px-4 font-bold text-white disabled:opacity-50"
                >
                  {processing ? 'Rejecting...' : 'Reject Donor'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
