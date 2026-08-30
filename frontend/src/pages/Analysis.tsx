import { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { compareProposals, deleteProposal, generateNegotiationPlaybook, type CompareResponse } from '../api';
import VendorCard from '../components/VendorCard';
import RiskPanel from '../components/RiskPanel';
import Toast, { useToast } from '../components/Toast';

export default function Analysis() {
  const [data, setData]       = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [playbook, setPlaybook] = useState<string | null>(null);
  const [playbookLoading, setPlaybookLoading] = useState(false);
  const [playbookError, setPlaybookError] = useState<string | null>(null);
  const { toasts, addToast, dismiss } = useToast();
  const playbookRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await compareProposals()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProposal(id);
      addToast('success', 'Vendor removed');
      load();
    } catch { addToast('error', 'Failed to remove vendor'); }
  };

  const handleGeneratePlaybook = async () => {
    if (playbook) {
      playbookRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setPlaybookLoading(true);
    setPlaybookError(null);
    setTimeout(() => playbookRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const result = await generateNegotiationPlaybook();
      setPlaybook(result);
    } catch (err) {
      setPlaybookError(err instanceof Error ? err.message : 'Failed to generate playbook');
    } finally {
      setPlaybookLoading(false);
    }
  };

  const costs    = data?.vendors.map(v => v.total_cost).filter((c): c is number => c !== null) ?? [];
  const bestCost = costs.length > 0 ? Math.min(...costs) : null;
  const worstCost= costs.length > 0 ? Math.max(...costs) : null;
  const gridClass = (n: number) => n <= 1 ? 'vendor-grid-1' : n === 2 ? 'vendor-grid-2' : n === 3 ? 'vendor-grid-3' : 'vendor-grid-4';

  return (
    <div>
      <div className="page-header flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2>📊 Vendor Analysis</h2>
          <p>AI-scored comparison across cost, SLA, features and speed.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary" onClick={handleGeneratePlaybook} disabled={loading || !data || data.vendors.length === 0}>
            🤖 Generate Playbook
          </button>
          <button className="btn btn-ghost" onClick={load} disabled={loading}>
            {loading ? <span className="spinner" /> : '🔄'} Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-danger">⚠ {error} &nbsp;
          <button className="btn btn-ghost btn-sm" onClick={load}>Retry</button>
        </div>
      )}

      {loading && !data && (
        <div className="loading-center">
          <span className="spinner" style={{ width: 40, height: 40 }} />
          <p style={{ color: 'var(--text-muted)', marginTop: 16 }}>Loading vendor data...</p>
        </div>
      )}

      {!loading && !error && data?.vendors.length === 0 && (
        <div className="empty-state">
          <span className="icon">📭</span>
          <h3>No vendors analyzed yet</h3>
          <p>Upload vendor proposal PDFs to see the comparison here.</p>
          <a href="/upload" className="btn btn-primary btn-lg">📤 Upload Proposals</a>
        </div>
      )}

      {data && data.vendors.length > 0 && (
        <>
          {data.recommended_vendor && (
            <div className="recommendation-banner">
              <span className="icon">🏆</span>
              <div>
                <h3>Recommended: {data.recommended_vendor}</h3>
                <p>{data.recommendation_reason}</p>
              </div>
            </div>
          )}

          <div className={`vendor-grid ${gridClass(data.vendors.length)}`}>
            {data.vendors.map(vendor => (
              <VendorCard key={vendor.proposal_id} vendor={vendor}
                isBestCost={vendor.total_cost !== null && vendor.total_cost === bestCost}
                isWorstCost={vendor.total_cost !== null && vendor.total_cost === worstCost && costs.length > 1}
                onDelete={handleDelete} />
            ))}
          </div>

          <div className="divider" style={{ margin: '40px 0 32px' }} />
          <RiskPanel vendors={data.vendors} />
        </>
      )}

      <Toast toasts={toasts} onDismiss={dismiss} />
      
      {(playbook || playbookLoading || playbookError) && (
        <div ref={playbookRef} style={{ marginTop: 64, padding: 32, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--brand)', marginBottom: 24, fontSize: 24 }}>🤖 AI Negotiation Playbook</h2>
          
          {playbookLoading && (
            <div className="loading-center" style={{ padding: 40 }}>
              <span className="spinner" style={{ width: 40, height: 40 }}></span>
              <p style={{ marginTop: 16 }}>Analyzing vendor differences and crafting strategy...</p>
            </div>
          )}

          {playbookError && (
            <div className="alert-box alert-danger">
              ⚠ {playbookError}
            </div>
          )}

          {!playbookLoading && !playbookError && playbook && (
            <div className="markdown-body playbook-content" style={{ fontSize: 16, lineHeight: 1.6 }}>
              <ReactMarkdown>{playbook}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
