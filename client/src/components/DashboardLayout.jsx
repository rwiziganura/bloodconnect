import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0D0D', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      {/* 240px offset on desktop, 0 on mobile (hamburger used instead) */}
      <div className="dashboard-main" style={{ flex: 1, minHeight: '100vh', overflow: 'auto' }}>
        {children}
      </div>
      <style>{`
        .dashboard-main { margin-left: 240px; }
        @media (max-width: 767px) { .dashboard-main { margin-left: 0; } }
      `}</style>
    </div>
  );
}
