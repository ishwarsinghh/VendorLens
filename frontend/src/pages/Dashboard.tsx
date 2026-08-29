import { useState, useEffect, useCallback } from 'react';
import { compareProposals, deleteProposal, type CompareResponse } from '../api';
import VendorCard from '../components/VendorCard';
import RiskPanel from '../components/RiskPanel';
import Toast, { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData]         = useState<CompareResponse | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const { toasts, addToast, dismiss } = useToast();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await compareProposals();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProposal(id);
      addToast('success', 'Vendor removed');
      load();
    } catch {
      addToast('error', 'Failed to remove vendor');
    }
  };

  const handleExport = () => window.print();

  // Compute best/worst cost
  const costs = data?.vendors.map((v) => v.total_cost).filter((c): c is number => c !== null) ?? [];
  const bestCost  = costs.length > 0 ? Math.min(...costs) : null;
  const worstCost = costs.length > 0 ? Math.max(...costs) : null;

  const gridClass = (n: number) =>
    n === 1 ? 'vendor-grid-1' :
    n === 2 ? 'vendor-grid-2' :
    n === 3 ? 'vendor-grid-3' : 'vendor-grid-4';

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2>📊 Vendor Comparison Dashboard</h2>
          <p>AI-powered scoring across cost, SLA, features, and speed.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={load} disabled={loading}>
            {loading ? <span className="spinner" /> : '🔄'} Refresh
          </button>
          <button className="btn btn-primary" onClick={handleExport} disabled={!data?.vendors.length}>
            📥 Export PDF
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'var(--danger-bg)', border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: 24,
          color: 'var(--danger)', fontSize: 14
        }}>
          ⚠ {error} &nbsp;
          <button className="btn btn-ghost btn-sm" onClick={load}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && !data && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <span className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px', display: 'block' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading vendor data...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && data?.vendors.length === 0 && (
        <div className="empty-state">
          <span className="icon">📭</span>
          <h3>No vendors uploaded yet</h3>
          <p>Upload vendor proposal PDFs to see the comparison dashboard.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/upload')}>
            📤 Upload Proposals
          </button>
        </div>
      )}

      {/* Recommendation Banner */}
      {data?.recommended_vendor && (
        <div className="recommendation-banner">
          <span className="icon">🏆</span>
          <div>
            <h3>Recommended: {data.recommended_vendor}</h3>
            <p>{data.recommendation_reason}</p>
          </div>
        </div>
      )}

      {/* Vendor Grid */}
      {data && data.vendors.length > 0 && (
        <>
          <div className={`vendor-grid ${gridClass(data.vendors.length)}`}>
            {data.vendors.map((vendor) => (
              <VendorCard
                key={vendor.proposal_id}
                vendor={vendor}
                isBestCost={vendor.total_cost !== null && vendor.total_cost === bestCost}
                isWorstCost={vendor.total_cost !== null && vendor.total_cost === worstCost && costs.length > 1}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="divider" style={{ margin: '40px 0 32px' }} />

          {/* Risk Panel */}
          <RiskPanel vendors={data.vendors} />
        </>
      )}

      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
