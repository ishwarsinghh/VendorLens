import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateNegotiationPlaybook } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Playbook() {
  const [playbook, setPlaybook] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchPlaybook = async () => {
      try {
        const result = await generateNegotiationPlaybook();
        if (mounted) setPlaybook(result);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to generate playbook');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPlaybook();
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 60 }}>
      <div className="page-header flex items-center justify-between">
        <div>
          <h2>🤖 AI Negotiation Playbook</h2>
          <p>Your executive strategy for vendor negotiations.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          ← Back to Analysis
        </button>
      </div>

      <div className="card" style={{ minHeight: 400 }}>
        {loading && (
          <div className="loading-center" style={{ padding: '60px 0' }}>
            <span className="spinner" style={{ width: 40, height: 40 }} />
            <p style={{ marginTop: 16 }}>Analyzing vendor differences and crafting your strategy...</p>
          </div>
        )}

        {error && (
          <div className="alert-box alert-danger">
            ⚠ {error}
          </div>
        )}

        {!loading && !error && playbook && (
          <div className="markdown-body" style={{ fontSize: 16, lineHeight: 1.6 }}>
            <ReactMarkdown>{playbook}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
