import { useLocation, useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/',             icon: '🏠', label: 'Dashboard'    },
  { to: '/upload',       icon: '📤', label: 'Upload'       },
  { to: '/analysis',     icon: '📊', label: 'Analysis'     },
  { to: '/history',      icon: '📋', label: 'History'      },
  { to: '/requirements', icon: '⚙️',  label: 'Settings'     },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>🔍 VendorLens</h1>
        <p>AI Procurement Tool</p>
      </div>

      <nav className="sidebar-nav">
        {NAV_LINKS.map(({ to, icon, label }) => (
          <button
            key={to}
            className={`nav-link ${location.pathname === to ? 'active' : ''}`}
            onClick={() => navigate(to)}
          >
            <span className="icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Powered by Groq + Llama 3.3</p>
        <p style={{ marginTop: 4, color: 'var(--accent)', fontWeight: 600 }}>Hackathon 2026 🏆</p>
      </div>
    </aside>
  );
}
