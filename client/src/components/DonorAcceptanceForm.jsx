import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorAcceptanceForm({ request, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    age: '',
    weight: '',
    blood_type: request?.blood_type || '',
    last_donation_date: '',
    medical_conditions: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else {
      const age = parseInt(formData.age);
      if (age < 18 || age > 65) {
        newErrors.age = 'You are not eligible to donate. Age must be between 18 and 65.';
      }
    }

    if (!formData.weight) {
      newErrors.weight = 'Weight is required';
    } else {
      const weight = parseFloat(formData.weight);
      if (weight < 50) {
        newErrors.weight = 'Minimum weight is 50kg';
      }
    }

    if (!formData.blood_type) {
      newErrors.blood_type = 'Blood type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/api/donor-acceptance/accept', {
        request_id: request.id,
        ...formData
      });

      toast.success('Your donation acceptance has been submitted successfully!');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to submit acceptance';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 shadow-2xl"
        >
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Donor Acceptance Form
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Please fill in your details to donate blood
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2.5 outline-none transition dark:bg-cardDark dark:text-textDark ${
                  errors.full_name ? 'border-primary' : 'border-slate-200 dark:border-white/10'
                }`}
                placeholder="Enter your full name"
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-primary">{errors.full_name}</p>
              )}
            </div>

            {/* Phone and Email */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number <span className="text-primary">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-2.5 outline-none transition dark:bg-cardDark dark:text-textDark ${
                    errors.phone ? 'border-primary' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="+250 XXX XXX XXX"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-primary">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email <span className="text-primary">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-2.5 outline-none transition dark:bg-cardDark dark:text-textDark ${
                    errors.email ? 'border-primary' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-primary">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Age and Weight */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Age <span className="text-primary">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  className={`w-full rounded-xl border px-4 py-2.5 outline-none transition dark:bg-cardDark dark:text-textDark ${
                    errors.age ? 'border-primary' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="18-65"
                />
                {errors.age && (
                  <p className="mt-1 text-xs text-primary">{errors.age}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Weight (kg) <span className="text-primary">*</span>
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="1"
                  step="0.1"
                  className={`w-full rounded-xl border px-4 py-2.5 outline-none transition dark:bg-cardDark dark:text-textDark ${
                    errors.weight ? 'border-primary' : 'border-slate-200 dark:border-white/10'
                  }`}
                  placeholder="Min 50kg"
                />
                {errors.weight && (
                  <p className="mt-1 text-xs text-primary">{errors.weight}</p>
                )}
              </div>
            </div>

            {/* Blood Type and Last Donation */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Blood Type <span className="text-primary">*</span>
                </label>
                <select
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-2.5 outline-none transition dark:bg-cardDark dark:text-textDark ${
                    errors.blood_type ? 'border-primary' : 'border-slate-200 dark:border-white/10'
                  }`}
                >
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.blood_type && (
                  <p className="mt-1 text-xs text-primary">{errors.blood_type}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Last Donation Date
                </label>
                <input
                  type="date"
                  name="last_donation_date"
                  value={formData.last_donation_date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition dark:border-white/10 dark:bg-cardDark dark:text-textDark"
                />
              </div>
            </div>

            {/* Medical Conditions */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Medical Conditions (Optional)
              </label>
              <textarea
                name="medical_conditions"
                value={formData.medical_conditions}
                onChange={handleChange}
                rows={3}
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition dark:border-white/10 dark:bg-cardDark dark:text-textDark"
                placeholder="Any medical conditions we should know about..."
              />
            </div>

            {/* Eligibility Info */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Eligibility Requirements:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <li>• Age must be between 18 and 65 years</li>
                <li>• Minimum weight of 50kg required</li>
                <li>• At least 3 months since last donation</li>
                <li>• Good general health condition</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] flex-1 rounded-xl border border-slate-200 px-6 font-bold dark:border-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary min-h-[48px] flex-1 px-6 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
