import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Requests = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/requests', {
        headers: {
          Authorization: `Bearer ${token || 
            localStorage.getItem('bloodconnect_token')}`
        }
      });
      setRequests(response.data.requests || 
        response.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    if (urgency === 'critical') 
      return 'bg-red-600 text-white animate-pulse';
    if (urgency === 'medium') 
      return 'bg-orange-500 text-white';
    return 'bg-yellow-500 text-black';
  };

  const getStatusColor = (status) => {
    if (status === 'open') return 'text-green-400';
    if (status === 'fulfilled') return 'text-gray-400';
    return 'text-red-400';
  };

  const bloodTypes = ['all','A+','A-','B+','B-',
    'AB+','AB-','O+','O-'];

  const filtered = filter === 'all' 
    ? requests 
    : requests.filter(r => r.blood_type === filter);

  return (
    <div className="min-h-screen bg-[#0D0D0D] 
      text-white">


      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Open Blood Requests
          </h1>
          <p className="text-gray-400">
            Hospitals post urgent needs here. 
            {isAuthenticated && user?.role === 'donor' && (
              <span className="text-green-400 ml-2">
                ✓ You are logged in and can respond 
                from your dashboard.
              </span>
            )}
            {isAuthenticated && user?.role === 'hospital' && (
              <span className="text-blue-400 ml-2">
                ✓ Logged in as {user?.name}
              </span>
            )}
          </p>
        </div>

        {/* Blood type filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {bloodTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm 
                font-semibold transition border
                ${filter === type 
                  ? 'bg-red-600 border-red-600 text-white' 
                  : 'border-gray-600 text-gray-400 \
                     hover:border-red-500 hover:text-white'
                }`}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          ))}
        </div>

        {/* Requests list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 
              border-red-600 border-t-transparent 
              rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#1A1A1A] rounded-2xl 
            p-16 text-center border border-gray-800">
            <p className="text-gray-400 text-lg">
              No open requests right now.
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Check back soon or stay on standby.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(request => (
              <div key={request.id} 
                className="bg-[#1A1A1A] border 
                border-gray-800 rounded-2xl p-6 
                hover:border-red-800 transition">
                <div className="flex items-start 
                  justify-between flex-wrap gap-4">
                  
                  <div className="flex items-center gap-4">
                    {/* Blood type badge */}
                    <div className="w-16 h-16 rounded-full 
                      bg-red-600 flex items-center 
                      justify-center text-white 
                      font-bold text-xl">
                      {request.blood_type}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {request.hospital_name || 
                          'Hospital'}
                      </h3>
                      <p className="text-gray-400">
                        {request.city || 'Rwanda'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {request.quantity_units} units needed
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col 
                    items-end gap-2">
                    {/* Urgency badge */}
                    <span className={`px-3 py-1 rounded-full 
                      text-xs font-bold uppercase
                      ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency}
                    </span>
                    {/* Status */}
                    <span className={`text-sm font-semibold
                      ${getStatusColor(request.status)}`}>
                      ● {request.status}
                    </span>
                    {/* Time */}
                    <span className="text-gray-600 text-xs">
                      {new Date(request.created_at)
                        .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {request.notes && (
                  <p className="mt-4 text-gray-400 
                    text-sm border-t border-gray-800 pt-4">
                    {request.notes}
                  </p>
                )}

                {/* Donors notified */}
                {request.donors_notified_count > 0 && (
                  <p className="mt-2 text-green-400 text-sm">
                    {request.donors_notified_count} donors 
                    notified
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;
