import { useState, useRef, useCallback } from 'react';
import { uploadProposal, type UploadResult } from '../api';
import Toast, { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const MAX_FILES = 4;

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
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toasts, addToast, dismiss } = useToast();
  const navigate = useNavigate();

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const pdfs = Array.from(incoming).filter((f) => f.name.endsWith('.pdf'));
    if (pdfs.length === 0) { addToast('error', 'Only PDF files are accepted.'); return; }

    const available = MAX_FILES - files.length;
    if (available <= 0) { addToast('error', `Maximum ${MAX_FILES} vendors allowed.`); return; }

    const toAdd = pdfs.slice(0, available).map((file): UploadedFile => ({
      file, status: 'pending', progress: 0,
    }));

    if (pdfs.length > available) {
      addToast('info', `Only ${available} more PDFs can be added. Skipped ${pdfs.length - available}.`);
    }
    setFiles((prev) => [...prev, ...toAdd]);
  }, [files.length, addToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAll = async () => {
    const pending = files.filter((f) => f.status === 'pending');
    if (pending.length === 0) { addToast('info', 'No pending files to upload.'); return; }

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;

      setFiles((prev) => {
        const next = [...prev];
        next[i] = { ...next[i], status: 'loading', progress: 0 };
        return next;
      });

      try {
        const result = await uploadProposal(files[i].file, (pct) => {
          setFiles((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], progress: pct };
            return next;
          });
        });

        setFiles((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'uploaded', progress: 100, result };
          return next;
        });
        addToast('success', `✅ ${result.vendor_name} — ${Math.round(result.extraction_confidence * 100)}% confidence`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setFiles((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'error', progress: 0, error: msg };
          return next;
        });
        addToast('error', `Failed: ${files[i].file.name} — ${msg}`);
      }
    }
  };

  const clearAll = () => setFiles([]);
  const allUploaded = files.length > 0 && files.every((f) => f.status === 'uploaded');

  return (
    <div>
      <div className="page-header">
        <h2>📤 Upload Vendor Proposals</h2>
        <p>Upload up to 4 vendor PDFs. Our AI will extract all commercial and technical details automatically.</p>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={(e) => addFiles(e.target.files)}
        />
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
                {f.status === 'uploaded' ? '✅' :
                 f.status === 'error'    ? '❌' :
                 f.status === 'loading'  ? '' : '📄'}
                {f.status === 'loading' && <span className="spinner" />}
              </span>

              <div className="file-info">
                <div className="file-name">{f.file.name}</div>
                <div className="file-meta">
                  {formatSize(f.file.size)}
                  {f.result && (
                    <> &nbsp;·&nbsp; <strong>{f.result.vendor_name}</strong>
                    &nbsp;·&nbsp; {Math.round(f.result.extraction_confidence * 100)}% confidence
                    &nbsp;·&nbsp;
                    <span className={`badge badge-${f.result.status === 'success' ? 'success' : 'warning'}`}>
                      {f.result.status}
                    </span></>
                  )}
                  {f.error && <span style={{ color: 'var(--danger)' }}> {f.error}</span>}
                </div>

                {f.status === 'loading' && (
                  <div className="upload-progress">
                    <div className="progress-bar-wrap">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${f.progress}%`, background: 'var(--accent)' }}
                      />
                    </div>
                    <span>{f.progress}%</span>
                  </div>
                )}
              </div>

              {f.status !== 'loading' && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-16 mt-24">
        <button
          className="btn btn-primary btn-lg"
          onClick={uploadAll}
          disabled={files.filter(f => f.status === 'pending').length === 0}
        >
          🚀 Analyze Proposals
        </button>

        {allUploaded && (
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}
            style={{ background: 'var(--purple)' }}>
            📊 View Dashboard →
          </button>
        )}

        {files.length > 0 && (
          <button className="btn btn-ghost" onClick={clearAll}>
            🗑 Clear All
          </button>
        )}
      </div>

      {/* Tip */}
      <div style={{ marginTop: 32 }} className="card">
        <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 700 }}>💡 Tips for best results</h4>
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            'Vendor PDFs should contain pricing, SLA, and feature sections',
            'Text-based PDFs work best (not scanned images)',
            'Upload all vendors before viewing the Dashboard',
            'Each PDF represents one vendor proposal',
          ].map((tip) => (
            <li key={tip} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{tip}</li>
          ))}
        </ul>
      </div>

      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
