import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';

const LINKS = {
  donor: [
    { to: '/donor/dashboard', label: 'Dashboard' },
    { to: '/donor/alerts', label: 'Alerts' },
    { to: '/donor/profile', label: 'My Profile' },
    { to: '/map', label: 'Donors Map' },
    { to: '/request-blood', label: 'Request Blood' },
  ],
  hospital: [
    { to: '/hospital/dashboard', label: 'Dashboard' },
    { to: '/donor/alerts', label: 'Alerts' },
    { to: '/hospital/request', label: 'Post Request' },
    { to: '/map', label: 'Donors Map' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/map', label: 'Donors Map' },
    { to: '/requests', label: 'All Requests' },
  ],
};

const ROLE_META = {
  donor:    { color: '#E63946', label: 'Donor' },
  hospital: { color: '#4361EE', label: 'Hospital' },
  admin:    { color: '#FFD60A', label: 'Admin' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useAlerts();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = LINKS[user?.role] || [];
  const meta  = ROLE_META[user?.role] || { color: '#E63946', label: '' };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const close = () => setMobileOpen(false);

  const sidebarContent = (
    <div style={{
      width: '240px', minWidth: '240px', height: '100vh',
      background: '#111', borderRight: '1px solid #1f1f1f',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: 'Inter, sans-serif', color: '#fff' }}>
          Blood<span style={{ color: '#E63946' }}>Connect</span>
        </span>
      </div>

      {/* User info */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${meta.color}, #333)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '1rem',
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ color: '#fff', fontWeight: 600, margin: 0, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name}
          </p>
          <span style={{ color: meta.color, fontSize: '0.75rem', fontWeight: 600 }}>
            {meta.label}
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <p style={{ color: '#444', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 0.75rem', marginBottom: '0.5rem' }}>
          Navigation
        </p>
        {links.map(link => {
          const badge = link.to === '/donor/alerts' ? unreadCount : 0;
          return (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={close}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem', borderRadius: '10px', textDecoration: 'none',
              fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
              color: isActive ? '#fff' : '#888',
              background: isActive ? 'rgba(230,57,70,0.15)' : 'transparent',
              borderLeft: isActive ? '3px solid #E63946' : '3px solid transparent',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s',
            })}
          >
            <span style={{ flex: 1 }}>{link.label}</span>
            {badge > 0 && (
              <span style={{
                background: '#E63946', color: '#fff',
                borderRadius: '999px', padding: '0.1rem 0.45rem',
                fontSize: '0.7rem', fontWeight: 700,
                minWidth: '20px', textAlign: 'center',
                animation: 'pulse 2s infinite',
              }}>
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid #1f1f1f' }}>
        <button
          onClick={handleLogout}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(230,57,70,0.1)'; e.currentTarget.style.color = '#E63946'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem', borderRadius: '10px', background: 'transparent',
            border: 'none', color: '#888', cursor: 'pointer',
            fontSize: '0.95rem', fontWeight: 500, fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — fixed */}
      <div className="sidebar-desktop" style={{ position: 'fixed', left: 0, top: 0, zIndex: 100, height: '100vh' }}>
        {sidebarContent}
      </div>

      {/* Mobile hamburger button */}
      <button
        className="sidebar-hamburger"
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed', top: '1rem', left: '1rem', zIndex: 200,
          background: '#E63946', border: 'none', borderRadius: '8px',
          padding: '0.5rem 0.65rem', cursor: 'pointer',
          color: '#fff', fontSize: '1.2rem', lineHeight: 1,
        }}
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <>
          <div
            onClick={close}
            style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.6)' }}
          />
          <div style={{ position: 'fixed', left: 0, top: 0, zIndex: 160, height: '100vh' }}>
            {sidebarContent}
          </div>
        </>
      )}

      <style>{`
        .sidebar-desktop { display: flex; }
        .sidebar-hamburger { display: none; }
        @media (max-width: 767px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-hamburger { display: block !important; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
}
