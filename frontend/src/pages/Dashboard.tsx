import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ vendors: 0, highRisk: 0, avgConfidence: 0 });

  useEffect(() => {
    fetch('https://vendorlens.onrender.com/api/proposals')
      .then(r => r.json())
      .then(data => {
        if (!data.proposals) return;
        const vendors = data.proposals.length;
        const highRisk = data.proposals.filter((p: any) => p.sla_uptime === null).length;
        const avgConf = vendors > 0 
          ? Math.round(data.proposals.reduce((acc: number, p: any) => acc + p.extraction_confidence, 0) / vendors * 100)
          : 0;
        setStats({ vendors, highRisk, avgConfidence: avgConf });
      }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 32 }}>👋 Welcome back, {user?.name.split(' ')[0] ?? 'User'}!</h2>
        <p style={{ fontSize: 16 }}>Here is what's happening with your vendor procurements today.</p>
      </div>

      <div className="dashboard-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 48 }}>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>🏢</div>
          <div>
            <div className="metric-title">Vendors Analyzed</div>
            <div className="metric-val">{stats.vendors}</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>⚠</div>
          <div>
            <div className="metric-title">High Risk Vendors</div>
            <div className="metric-val">{stats.highRisk}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>🤖</div>
          <div>
            <div className="metric-title">AI Extraction Accuracy</div>
            <div className="metric-val">{stats.avgConfidence}%</div>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 18, marginBottom: 20 }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <div className="action-card" onClick={() => navigate('/upload')}>
          <div className="action-icon">📤</div>
          <div className="action-text">
            <h4>Upload Proposals</h4>
            <p>Upload new vendor PDF documents for AI extraction.</p>
          </div>
          <div className="action-arrow">→</div>
        </div>

        <div className="action-card" onClick={() => navigate('/analysis')}>
          <div className="action-icon">📊</div>
          <div className="action-text">
            <h4>Compare Vendors</h4>
            <p>View side-by-side analysis, scoring, and AI recommendations.</p>
          </div>
          <div className="action-arrow">→</div>
        </div>

        <div className="action-card" onClick={() => navigate('/history')}>
          <div className="action-icon">📋</div>
          <div className="action-text">
            <h4>View History</h4>
            <p>Check the history log of all past vendor extractions.</p>
          </div>
          <div className="action-arrow">→</div>
        </div>
      </div>
    </div>
  );
}
