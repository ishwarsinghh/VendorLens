import { getHeaders } from '../api';
import { useState, useEffect } from 'react';

interface Proposal {
  id: string;
  vendor_name: string;
  total_cost: number | null;
  sla_uptime: number | null;
  extraction_confidence: number;
  created_at: string;
  score?: number;
}

export default function History() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch('https://vendorlens.onrender.com/api/proposals', { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { setProposals(d.proposals || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fmt = (n: number | null, prefix = '', suffix = '') =>
    n !== null && n !== undefined ? `${prefix}${n.toLocaleString()}${suffix}` : '—';

  const confidenceColor = (c: number) =>
    c >= 0.8 ? 'var(--success)' : c >= 0.6 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div>
      <div className="page-header">
        <h2>📋 Upload History</h2>
        <p>All vendor proposals that have been analyzed in this session.</p>
      </div>

      {loading && (
        <div className="loading-center">
          <span className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      )}

      {!loading && proposals.length === 0 && (
        <div className="empty-state">
          <span className="icon">📭</span>
          <h3>No history yet</h3>
          <p>Upload vendor PDFs to start building your history.</p>
          <a href="/upload" className="btn btn-primary btn-lg">📤 Upload Proposals</a>
        </div>
      )}

      {!loading && proposals.length > 0 && (
        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vendor Name</th>
                <th>Total Cost</th>
                <th>SLA Uptime</th>
                <th>AI Confidence</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.vendor_name ?? 'Unknown Vendor'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      ID: {p.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{fmt(p.total_cost, '$')}</td>
                  <td>{p.sla_uptime !== null ? `${p.sla_uptime}%` : <span style={{ color: 'var(--danger)' }}>Not stated ⚠</span>}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-surface-2)', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.round(p.extraction_confidence * 100)}%`, background: confidenceColor(p.extraction_confidence), borderRadius: 100 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: confidenceColor(p.extraction_confidence), minWidth: 36 }}>
                        {Math.round(p.extraction_confidence * 100)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${p.extraction_confidence >= 0.6 ? 'badge-success' : 'badge-warning'}`}>
                      {p.extraction_confidence >= 0.6 ? 'Complete' : 'Partial'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
