import { useState, useRef, useCallback, useEffect } from 'react';
import { uploadProposal, compareProposals, deleteProposal, type UploadResult, type CompareResponse } from '../api';
import Toast, { useToast } from '../components/Toast';
import VendorCard from '../components/VendorCard';
import RiskPanel from '../components/RiskPanel';

const MAX_FILES = 10;

interface UploadedFile {
  file: File;
  status: 'pending' | 'loading' | 'uploaded' | 'error';
  progress: number;
  result?: UploadResult;
  error?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Upload() {
  const [files, setFiles]               = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver]         = useState(false);
  const [existingCount, setExistingCount] = useState(0);
  const [clearing, setClearing]         = useState(false);
  const [analyzing, setAnalyzing]       = useState(false);
  const [comparison, setComparison]     = useState<CompareResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toasts, addToast, dismiss } = useToast();

  // Check if there are existing vendors in DB on load
  useEffect(() => {
    fetch('https://vendorlens.onrender.com/api/proposals')
      .then(r => r.json())
      .then(data => setExistingCount(data.count ?? 0))
      .catch(() => {});
  }, []);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const pdfs = Array.from(incoming).filter((f) => f.name.endsWith('.pdf'));
    if (pdfs.length === 0) { addToast('error', 'Only PDF files are accepted.'); return; }
    const available = MAX_FILES - files.length;
    if (available <= 0) { addToast('error', `Maximum ${MAX_FILES} vendors allowed.`); return; }
    const toAdd = pdfs.slice(0, available).map((file): UploadedFile => ({ file, status: 'pending', progress: 0 }));
    if (pdfs.length > available) addToast('info', `Only ${available} more PDFs can be added.`);
    setFiles((prev) => [...prev, ...toAdd]);
    setComparison(null);
  }, [files.length, addToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  // Clear all existing vendors from DB
  const clearSession = async () => {
    setClearing(true);
    try {
      const res = await fetch('https://vendorlens.onrender.com/api/proposals');
      const data = await res.json();
      for (const p of data.proposals) {
        await fetch(`https://vendorlens.onrender.com/api/proposals/${p.id}`, { method: 'DELETE' });
      }
      setExistingCount(0);
      setComparison(null);
      addToast('success', 'Previous vendors cleared. Start fresh!');
    } catch {
      addToast('error', 'Failed to clear previous vendors.');
    } finally {
      setClearing(false);
    }
  };

  // Upload all pending PDFs
  const uploadAll = async () => {
    const pending = files.filter((f) => f.status === 'pending');
    if (pending.length === 0) { addToast('info', 'No pending files to upload.'); return; }

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;
      setFiles((prev) => { const next = [...prev]; next[i] = { ...next[i], status: 'loading', progress: 0 }; return next; });

      try {
        const result = await uploadProposal(files[i].file, (pct) => {
          setFiles((prev) => { const next = [...prev]; next[i] = { ...next[i], progress: pct }; return next; });
        });
        setFiles((prev) => { const next = [...prev]; next[i] = { ...next[i], status: 'uploaded', progress: 100, result }; return next; });
        addToast('success', `✅ ${result.vendor_name} — ${Math.round(result.extraction_confidence * 100)}% confidence`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setFiles((prev) => { const next = [...prev]; next[i] = { ...next[i], status: 'error', progress: 0, error: msg }; return next; });
        addToast('error', `Failed: ${files[i].file.name} — ${msg}`);
      }
    }
  };

  // Analyze vendors right here on this page
  const analyzeNow = async () => {
    setAnalyzing(true);
    try {
      const result = await compareProposals();
      setComparison(result);
      addToast('success', `Analysis complete! ${result.vendors.length} vendors compared.`);
    } catch {
      addToast('error', 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Remove a vendor from analysis
  const handleDelete = async (id: string) => {
    try {
      await deleteProposal(id);
      addToast('success', 'Vendor removed.');
      // Refresh comparison
      const result = await compareProposals();
      setComparison(result);
      setExistingCount(result.vendors.length);
    } catch {
      addToast('error', 'Failed to remove vendor.');
    }
  };

  const allUploaded = files.length > 0 && files.every((f) => f.status === 'uploaded');
  const costs = comparison?.vendors.map((v) => v.total_cost).filter((c): c is number => c !== null) ?? [];
  const bestCost  = costs.length > 0 ? Math.min(...costs) : null;
  const worstCost = costs.length > 0 ? Math.max(...costs) : null;
  const gridClass = (n: number) => n === 1 ? 'vendor-grid-1' : n === 2 ? 'vendor-grid-2' : n === 3 ? 'vendor-grid-3' : 'vendor-grid-4';

  return (
    <div>
      <div className="page-header">
        <h2>📤 Upload Vendor Proposals</h2>
        <p>Upload vendor PDFs, analyze them instantly, and compare side-by-side.</p>
      </div>

      {/* Existing vendors warning */}
      {existingCount > 0 && !comparison && (
        <div style={{
          background: 'var(--warning-bg, #2a2200)', border: '1px solid var(--warning, #f59e0b)',
          borderRadius: 'var(--radius-md)', padding: '14px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
        }}>
          <span style={{ color: 'var(--warning, #f59e0b)', fontSize: 14 }}>
            ⚠ You have <strong>{existingCount}</strong> vendor(s) from a previous session.
            New uploads will be added to them.
          </span>
          <button className="btn btn-danger btn-sm" onClick={clearSession} disabled={clearing}>
            {clearing ? 'Clearing...' : '🗑 Clear All & Start Fresh'}
          </button>
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input ref={inputRef} type="file" accept=".pdf" multiple onChange={(e) => addFiles(e.target.files)} />
        <span className="drop-zone-icon">📁</span>
        <h3>Drop vendor PDFs here</h3>
        <p>or click to browse files • Max {MAX_FILES} PDFs • PDF only</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="file-list">
          {files.map((f, i) => (
            <div key={i} className={`file-item ${f.status}`}>
              <span className="file-icon">
                {f.status === 'uploaded' ? '✅' : f.status === 'error' ? '❌' : f.status === 'loading' ? '' : '📄'}
                {f.status === 'loading' && <span className="spinner" />}
              </span>
              <div className="file-info">
                <div className="file-name">{f.file.name}</div>
                <div className="file-meta">
                  {formatSize(f.file.size)}
                  {f.result && (<> &nbsp;·&nbsp; <strong>{f.result.vendor_name}</strong> &nbsp;·&nbsp; {Math.round(f.result.extraction_confidence * 100)}% confidence</>)}
                  {f.error && <span style={{ color: 'var(--danger)' }}> {f.error}</span>}
                </div>
                {f.status === 'loading' && (
                  <div className="upload-progress">
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${f.progress}%`, background: 'var(--accent)' }} />
                    </div>
                    <span>{f.progress}%</span>
                  </div>
                )}
              </div>
              {f.status !== 'loading' && (
                <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); removeFile(i); }}>✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-16 mt-24">
        <button className="btn btn-primary btn-lg" onClick={uploadAll}
          disabled={files.filter(f => f.status === 'pending').length === 0}>
          🚀 Upload Proposals
        </button>

        {allUploaded && (
          <button className="btn btn-primary btn-lg" onClick={analyzeNow} disabled={analyzing}
            style={{ background: 'var(--success, #22c55e)' }}>
            {analyzing ? <><span className="spinner" /> Analyzing...</> : '🔍 Analyze & Compare'}
          </button>
        )}

        {files.length > 0 && (
          <button className="btn btn-ghost" onClick={() => { setFiles([]); setComparison(null); }}>
            🗑 Clear Files
          </button>
        )}
      </div>

      {/* ── Inline Comparison Results ── */}
      {comparison && comparison.vendors.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <div style={{ borderTop: '2px solid var(--border)', paddingTop: 32, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 4 }}>📊 Comparison Results</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Click <strong>🗑 Remove Vendor</strong> on any card to remove them from the comparison.
            </p>
          </div>

          {/* Recommendation Banner */}
          {comparison.recommended_vendor && (
            <div className="recommendation-banner" style={{ marginBottom: 24 }}>
              <span className="icon">🏆</span>
              <div>
                <h3>Recommended: {comparison.recommended_vendor}</h3>
                <p>{comparison.recommendation_reason}</p>
              </div>
            </div>
          )}

          {/* Vendor Cards */}
          <div className={`vendor-grid ${gridClass(comparison.vendors.length)}`}>
            {comparison.vendors.map((vendor) => (
              <VendorCard
                key={vendor.proposal_id}
                vendor={vendor}
                isBestCost={vendor.total_cost !== null && vendor.total_cost === bestCost}
                isWorstCost={vendor.total_cost !== null && vendor.total_cost === worstCost && costs.length > 1}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Risk Panel */}
          <div style={{ marginTop: 40 }}>
            <RiskPanel vendors={comparison.vendors} />
          </div>
        </div>
      )}

      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
