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
      <div className="sidebar-brand" style={{ padding: '24px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* Logo Icon */}
          <div style={{
            position: 'relative',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px -4px rgba(168, 85, 247, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
            flexShrink: 0
          }}>
            {/* Sparkle top right */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white" style={{ position: 'absolute', top: -4, right: -4, filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' }}>
              <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
            </svg>
            
            {/* Magnifying Glass / Lens */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10.5" cy="10.5" r="7" />
              <line x1="21" y1="21" x2="15.5" y2="15.5" />
              <path d="M10.5 7a3.5 3.5 0 0 0-3.5 3.5" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
            </svg>
          </div>

          {/* Text Area */}
          <div>
            <h1 style={{ 
              fontSize: '22px', 
              fontWeight: 800, 
              margin: 0, 
              background: 'linear-gradient(to right, #ffffff, #c4b5fd)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              lineHeight: 1.2
            }}>VendorLens</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981'
              }} />
              <p style={{ 
                fontSize: '11px', 
                margin: 0, 
                color: '#9ca3af', 
                textTransform: 'uppercase', 
                letterSpacing: '1px',
                fontWeight: 700 
              }}>AI Procurement</p>
            </div>
          </div>
        </div>
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
        <p>Powered by Groq + GPT-OSS 120B</p>
        <p style={{ marginTop: 4, color: 'var(--accent)', fontWeight: 600 }}>Hackathon 2026 🏆</p>
      </div>
    </aside>
  );
}
