import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';
import api from '../services/api';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function urgencyColor(urgency) {
  if (urgency === 'critical') return '#E63946';
  if (urgency === 'high')     return '#FF6B35';
  if (urgency === 'medium')   return '#FF9F1C';
  return '#FFD60A';
}

// ── Hospital view: fetches accepted donors for a request ──────────────────
function HospitalAlertView({ requestId }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) { setLoading(false); return; }
    
    const fetchAcceptedDonors = async () => {
      try {
        console.log('Fetching donors for request:', requestId);
        
        const token = localStorage.getItem('bloodconnect_token');
        
        const response = await api.get(
          `/api/requests/${requestId}/donors`
        );
        
        console.log('All donors response:', response.data);
        
        const allDonors = response.data.donors || [];
        console.log('All donors:', allDonors);
        
        const accepted = allDonors.filter(
          d => d.status === 'accepted'
        );
        console.log('Accepted donors:', accepted);
        
        setDonors(accepted);
      } catch (error) {
        console.error('Error fetching donors:', error);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAcceptedDonors();
  }, [requestId]);

  if (loading) return (
    <p style={{ color: '#555', fontSize: '0.9rem', margin: 0 }}>Loading responses…</p>
  );

  if (donors.length === 0) return (
    <div style={{
      background: '#242424', borderRadius: '10px', padding: '1rem',
      color: '#555', textAlign: 'center', fontSize: '0.9rem',
    }}>
      ⏳ Waiting for donors to respond…
    </div>
  );

  return (
    <div>
      <p style={{ color: '#2DC653', fontWeight: 700, margin: '0 0 0.75rem', fontSize: '0.95rem' }}>
        ✅ {donors.length} donor{donors.length > 1 ? 's' : ''} accepted
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {donors.map((donor, i) => (
          <div key={i} style={{
            background: 'rgba(45,198,83,0.08)',
            border: '1px solid rgba(45,198,83,0.2)',
            borderRadius: '12px', padding: '1.25rem',
          }}>
            {/* Header with name and blood type */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              marginBottom: '1rem', paddingBottom: '1rem',
              borderBottom: '1px solid rgba(45,198,83,0.15)'
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                background: '#E63946', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem',
              }}>
                {donor.donor_name?.charAt(0).toUpperCase() || 'D'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '1rem' }}>
                  {donor.donor_name || 'Donor'}
                </p>
                <p style={{ color: '#2DC653', margin: '0.25rem 0 0', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✅ Accepted
                </p>
              </div>
              <div style={{
                background: '#E63946', color: '#fff',
                borderRadius: '8px', padding: '0.5rem 0.75rem',
                fontWeight: 700, fontSize: '0.9rem'
              }}>
                {donor.blood_type}
              </div>
            </div>

            {/* Contact Info */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '1rem', marginBottom: '1rem'
            }}>
              <div>
                <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.3rem', textTransform: 'uppercase' }}>Phone</p>
                <a href={`tel:${donor.donor_phone || donor.user_phone}`} style={{
                  color: '#2DC653', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem'
                }}>
                  {donor.donor_phone || donor.user_phone || 'Not provided'}
                </a>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.3rem', textTransform: 'uppercase' }}>Email</p>
                <a href={`mailto:${donor.donor_email || donor.user_email}`} style={{
                  color: '#2DC653', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem'
                }}>
                  {donor.donor_email || donor.user_email || 'Not provided'}
                </a>
              </div>
            </div>

            {/* Health Details */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '1rem', marginBottom: '1rem',
              background: '#1A1A1A', borderRadius: '8px', padding: '1rem'
            }}>
              <div>
                <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.3rem', textTransform: 'uppercase' }}>Age</p>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                  {donor.donor_age || 'Not provided'} years
                </p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.3rem', textTransform: 'uppercase' }}>Weight</p>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                  {donor.donor_weight || 'Not provided'} kg
                </p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.3rem', textTransform: 'uppercase' }}>City</p>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>
                  {donor.city || 'Not provided'}
                </p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.3rem', textTransform: 'uppercase' }}>Medical Notes</p>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>
                  {donor.medical_conditions || 'None reported'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex', gap: '0.75rem', flexWrap: 'wrap'
            }}>
              <a href={`tel:${donor.donor_phone || donor.user_phone}`} style={{
                flex: 1, minWidth: '120px',
                background: '#E63946', color: '#fff', borderRadius: '8px',
                padding: '0.6rem 1rem', fontWeight: 600, fontSize: '0.9rem',
                textDecoration: 'none', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.5rem'
              }}>
                📞 Call Donor
              </a>
              <button style={{
                flex: 1, minWidth: '120px',
                background: 'transparent', color: '#2DC653', border: '1px solid #2DC653',
                borderRadius: '8px', padding: '0.6rem 1rem', fontWeight: 600, fontSize: '0.9rem',
                cursor: 'pointer'
              }}>
                📍 Send Location
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function DonorAlerts() {
  const { user } = useAuth();
  const { setUnreadCount, fetchUnreadCount } = useAlerts();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [healthForm, setHealthForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    weight: '',
    age: '',
    medical_conditions: ''
  });
  const [healthErrors, setHealthErrors] = useState({});

  const { token: contextToken } = useAuth();
  const isHospital = user?.role === 'hospital';

  const getToken = () => {
    return contextToken || 
      localStorage.getItem('bloodconnect_token');
  };

  useEffect(() => {
    api.get('/api/notifications')
      .then(({ data }) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setUnreadCount]);

  const handleResponse = async (notificationId, requestId, responseStatus) => {
    if (!requestId) { alert('No request linked to this alert.'); return; }
    if (responseStatus === 'accepted') {
      const notification = notifications.find(n => n.id === notificationId);
      console.log('Button clicked:', notification);
      setSelectedNotification(notification);
      setShowModal(true);
      return;
    }
    setResponding(prev => ({ ...prev, [notificationId]: true }));
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      await api.post(`/api/requests/${requestId}/respond`, { status: responseStatus });
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: true, donor_response: responseStatus }
            : n
        )
      );
      fetchUnreadCount();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to submit response');
    } finally {
      setResponding(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleHealthSubmit = async (notification) => {
    const errors = {};

    if (!healthForm.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    if (!healthForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!healthForm.email.trim()) {
      errors.email = 'Email is required';
    }

    const age = parseInt(healthForm.age);
    if (!healthForm.age) {
      errors.age = 'Age is required';
    } else if (age < 18) {
      errors.age = 'Must be at least 18 years old';
    } else if (age > 65) {
      errors.age = 'Must be under 65 years old';
    }

    const weight = parseFloat(healthForm.weight);
    if (!healthForm.weight) {
      errors.weight = 'Weight is required';
    } else if (weight < 50) {
      errors.weight = 'Must weigh at least 50kg';
    }

    if (Object.keys(errors).length > 0) {
      setHealthErrors(errors);
      return;
    }

    setHealthErrors({});
    setResponding(prev => ({
      ...prev, [notification.id]: true
    }));

    try {
      await api.put(
        `/api/notifications/${notification.id}/read`,
        {}
      );

      await api.post(
        `/api/requests/${notification.request_id}/respond`,
        {
          status: 'accepted',
          donor_weight: healthForm.weight,
          donor_age: healthForm.age,
          donor_email: healthForm.email,
          donor_phone: healthForm.phone,
          medical_conditions: 
            healthForm.medical_conditions
        }
      );

      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id
            ? {
                ...n,
                is_read: true,
                donor_response: 'accepted'
              }
            : n
        )
      );

      setShowModal(false);
      setSelectedNotification(null);
      setHealthForm({
        full_name: '', phone: '',
        email: '', weight: '',
        age: '', medical_conditions: ''
      });
      fetchUnreadCount();

    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setResponding(prev => ({
        ...prev, [notification.id]: false
      }));
    }
  };

  const handleMarkAllRead = async () => {
    await api.put('/api/notifications/mark-all-read').catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', fontFamily: 'Inter, sans-serif', padding: '2rem' }}>

      {/* Modal - placed here at top level */}
      {showModal && selectedNotification && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#1A1A1A',
            borderRadius: '20px',
            padding: '2rem',
            width: '100%',
            maxWidth: '520px',
            border: '1px solid #333',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            zIndex: 10000
          }}>

            {/* Close button */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <div>
                <h2 style={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.4rem',
                  margin: 0
                }}>
                  Confirm Donation
                </h2>
                <p style={{
                  color: '#666',
                  margin: '0.25rem 0 0',
                  fontSize: '0.9rem'
                }}>
                  Fill in your health details to proceed
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedNotification(null);
                  setHealthErrors({});
                }}
                style={{
                  background: '#242424',
                  border: 'none',
                  color: '#aaa',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                X
              </button>
            </div>

            {/* Request summary */}
            <div style={{
              background: '#242424',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div>
                <p style={{
                  color: '#555',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  margin: '0 0 0.25rem',
                  textTransform: 'uppercase'
                }}>
                  Blood Type Needed
                </p>
                <p style={{
                  color: '#E63946',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  margin: 0
                }}>
                  {selectedNotification.blood_type}
                </p>
              </div>
              <div>
                <p style={{
                  color: '#555',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  margin: '0 0 0.25rem',
                  textTransform: 'uppercase'
                }}>
                  Hospital
                </p>
                <p style={{
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  margin: 0
                }}>
                  {selectedNotification.hospital_name 
                    || 'Emergency Request'}
                </p>
              </div>
            </div>

            {/* Health warning */}
            <div style={{
              background: 'rgba(230,57,70,0.08)',
              border: '1px solid rgba(230,57,70,0.25)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{
                color: '#E63946',
                fontWeight: 700,
                margin: '0 0 0.3rem',
                fontSize: '0.9rem'
              }}>
                Health Requirements
              </p>
              <p style={{
                color: '#888',
                margin: 0,
                fontSize: '0.85rem',
                lineHeight: 1.6
              }}>
                You must be 18 to 65 years old and 
                weigh at least 50kg to donate blood.
              </p>
            </div>

            {/* Form fields */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>

              {/* Full Name */}
              <div>
                <label style={{
                  color: '#aaa',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={healthForm.full_name}
                  onChange={e => setHealthForm({
                    ...healthForm,
                    full_name: e.target.value
                  })}
                  placeholder="Your full name"
                  style={{
                    width: '100%',
                    background: '#242424',
                    border: healthErrors.full_name
                      ? '1px solid #E63946'
                      : '1px solid #333',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {healthErrors.full_name && (
                  <p style={{
                    color: '#E63946',
                    fontSize: '0.8rem',
                    margin: '0.3rem 0 0'
                  }}>
                    {healthErrors.full_name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label style={{
                  color: '#aaa',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase'
                }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={healthForm.phone}
                  onChange={e => setHealthForm({
                    ...healthForm,
                    phone: e.target.value
                  })}
                  placeholder="+250 7XX XXX XXX"
                  style={{
                    width: '100%',
                    background: '#242424',
                    border: healthErrors.phone
                      ? '1px solid #E63946'
                      : '1px solid #333',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {healthErrors.phone && (
                  <p style={{
                    color: '#E63946',
                    fontSize: '0.8rem',
                    margin: '0.3rem 0 0'
                  }}>
                    {healthErrors.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label style={{
                  color: '#aaa',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={healthForm.email}
                  onChange={e => setHealthForm({
                    ...healthForm,
                    email: e.target.value
                  })}
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    background: '#242424',
                    border: healthErrors.email
                      ? '1px solid #E63946'
                      : '1px solid #333',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {healthErrors.email && (
                  <p style={{
                    color: '#E63946',
                    fontSize: '0.8rem',
                    margin: '0.3rem 0 0'
                  }}>
                    {healthErrors.email}
                  </p>
                )}
              </div>

              {/* Age and Weight */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <div>
                  <label style={{
                    color: '#aaa',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase'
                  }}>
                    Age (years) *
                  </label>
                  <input
                    type="number"
                    value={healthForm.age}
                    onChange={e => setHealthForm({
                      ...healthForm,
                      age: e.target.value
                    })}
                    placeholder="25"
                    min="1"
                    max="120"
                    style={{
                      width: '100%',
                      background: '#242424',
                      border: healthErrors.age
                        ? '1px solid #E63946'
                        : '1px solid #333',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {healthErrors.age && (
                    <p style={{
                      color: '#E63946',
                      fontSize: '0.8rem',
                      margin: '0.3rem 0 0'
                    }}>
                      {healthErrors.age}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    color: '#aaa',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase'
                  }}>
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    value={healthForm.weight}
                    onChange={e => setHealthForm({
                      ...healthForm,
                      weight: e.target.value
                    })}
                    placeholder="70"
                    min="1"
                    max="300"
                    style={{
                      width: '100%',
                      background: '#242424',
                      border: healthErrors.weight
                        ? '1px solid #E63946'
                        : '1px solid #333',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {healthErrors.weight && (
                    <p style={{
                      color: '#E63946',
                      fontSize: '0.8rem',
                      margin: '0.3rem 0 0'
                    }}>
                      {healthErrors.weight}
                    </p>
                  )}
                </div>
              </div>

              {/* Medical Conditions */}
              <div>
                <label style={{
                  color: '#aaa',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase'
                }}>
                  Medical Conditions (optional)
                </label>
                <textarea
                  value={healthForm.medical_conditions}
                  onChange={e => setHealthForm({
                    ...healthForm,
                    medical_conditions: e.target.value
                  })}
                  placeholder="Any medical conditions, medications, or allergies..."
                  rows={3}
                  style={{
                    width: '100%',
                    background: '#242424',
                    border: '1px solid #333',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Confirm Button */}
              <button
                onClick={() => handleHealthSubmit(
                  selectedNotification
                )}
                style={{
                  width: '100%',
                  background: 
                    'linear-gradient(135deg,#2DC653,#1a8c35)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Confirm Donation
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedNotification(null);
                  setHealthErrors({});
                  setHealthForm({
                    full_name: '',
                    phone: '',
                    email: '',
                    weight: '',
                    age: '',
                    medical_conditions: ''
                  });
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#666',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
            🔔 My Alerts
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            {isHospital ? 'Donor responses to your blood requests' : 'Blood requests that need your help'}
          </p>
        </div>
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            style={{
              background: 'transparent', border: '1px solid #444',
              borderRadius: '10px', padding: '0.6rem 1.25rem',
              color: '#888', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            ✓ Mark all as read
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '4px solid #E63946', borderTop: '4px solid transparent',
            borderRadius: '50%', animation: 'spin 1s linear infinite',
          }} />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{
          background: '#1A1A1A', borderRadius: '16px', padding: '4rem',
          textAlign: 'center', border: '1px solid #2a2a2a',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔕</div>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>No alerts yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(n => (
            <div key={n.id} style={{
              background: n.is_read ? '#1A1A1A' : 'rgba(230,57,70,0.06)',
              border: n.is_read ? '1px solid #2a2a2a' : '1px solid rgba(230,57,70,0.25)',
              borderRadius: '16px', padding: '1.5rem', transition: 'all 0.2s',
            }}>

              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
                    background: '#E63946', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem',
                  }}>
                    {n.blood_type || '🩸'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>
                        {n.hospital_name || n.requester_name || 'Emergency Request'}
                      </span>
                      {!n.is_read && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E63946', display: 'inline-block' }} />
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {n.hospital_city && (
                        <span style={{ color: '#666', fontSize: '0.85rem' }}>📍 {n.hospital_city}</span>
                      )}
                      <span style={{ color: '#555', fontSize: '0.85rem' }}>🕐 {timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                </div>
                {n.urgency && (
                  <span style={{
                    background: urgencyColor(n.urgency),
                    color: n.urgency === 'low' ? '#000' : '#fff',
                    borderRadius: '8px', padding: '0.3rem 0.8rem',
                    fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    {n.urgency}
                  </span>
                )}
              </div>

              {/* Request details strip — only for blood request notifications */}
              {n.blood_type && (
                <div style={{
                  background: '#242424', borderRadius: '10px', padding: '1rem',
                  marginBottom: '1.25rem', display: 'flex', gap: '2rem', flexWrap: 'wrap',
                }}>
                  <div>
                    <p style={{ color: '#555', fontSize: '0.7rem', fontWeight: 600, margin: '0 0 0.2rem', textTransform: 'uppercase' }}>Blood Type</p>
                    <p style={{ color: '#E63946', fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>{n.blood_type}</p>
                  </div>
                  <div>
                    <p style={{ color: '#555', fontSize: '0.7rem', fontWeight: 600, margin: '0 0 0.2rem', textTransform: 'uppercase' }}>Units Needed</p>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>{n.quantity_units || 1}</p>
                  </div>
                  <div>
                    <p style={{ color: '#555', fontSize: '0.7rem', fontWeight: 600, margin: '0 0 0.2rem', textTransform: 'uppercase' }}>Request Status</p>
                    <p style={{ color: n.request_status === 'open' ? '#2DC653' : '#888', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                      ● {n.request_status || 'open'}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Action area: role-split ── */}
              {isHospital ? (
                // HOSPITAL: show accepted donor cards
                <HospitalAlertView requestId={n.request_id} />
              ) : (
                // DONOR: show accept / decline buttons
                n.donor_response === 'accepted' ? (
                  <div style={{
                    background: 'rgba(45,198,83,0.1)', border: '1px solid #2DC653',
                    borderRadius: '10px', padding: '0.85rem 1rem',
                    color: '#2DC653', fontWeight: 600, textAlign: 'center',
                  }}>
                    ✅ You accepted. The hospital has been notified.
                  </div>
                ) : n.donor_response === 'declined' ? (
                  <div style={{
                    background: 'rgba(100,100,100,0.1)', border: '1px solid #333',
                    borderRadius: '10px', padding: '0.85rem 1rem',
                    color: '#555', fontWeight: 600, textAlign: 'center',
                  }}>
                    ❌ You declined this request.
                  </div>
                ) : n.request_status && n.request_status !== 'open' ? (
                  <div style={{
                    background: 'rgba(100,100,100,0.08)', border: '1px solid #2a2a2a',
                    borderRadius: '10px', padding: '0.85rem 1rem',
                    color: '#555', textAlign: 'center',
                  }}>
                    This request is no longer active.
                  </div>
                ) : n.request_id ? (
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleResponse(n.id, n.request_id, 'accepted')}
                      disabled={responding[n.id]}
                      style={{
                        flex: 1, minWidth: '140px',
                        background: responding[n.id] ? '#333' : 'linear-gradient(135deg,#2DC653,#1a8c35)',
                        color: responding[n.id] ? '#666' : '#fff',
                        border: 'none', borderRadius: '10px', padding: '0.9rem',
                        fontWeight: 700, fontSize: '1rem',
                        cursor: responding[n.id] ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {responding[n.id] ? 'Sending…' : '✅ I will Donate'}
                    </button>
                    <button
                      onClick={() => handleResponse(n.id, n.request_id, 'declined')}
                      disabled={responding[n.id]}
                      style={{
                        flex: 1, minWidth: '140px',
                        background: 'transparent', color: '#888',
                        border: '1px solid #333', borderRadius: '10px', padding: '0.9rem',
                        fontWeight: 600, fontSize: '1rem',
                        cursor: responding[n.id] ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      ❌ Can't Help
                    </button>
                  </div>
                ) : (
                  // Notification with no linked request (e.g. system message)
                  <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>{n.message}</p>
                )
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
