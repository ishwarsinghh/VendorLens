import ReactMarkdown from 'react-markdown';
import './NegotiationModal.css';

interface NegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbook: string | null;
  loading: boolean;
  error: string | null;
}

export default function NegotiationModal({ isOpen, onClose, playbook, loading, error }: NegotiationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content playbook-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🤖 AI Negotiation Playbook</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading && (
            <div className="loading-center">
              <span className="spinner" style={{ width: 40, height: 40 }}></span>
              <p>Analyzing vendor differences and crafting strategy...</p>
            </div>
          )}

          {error && (
            <div className="alert-box alert-danger">
              ⚠ {error}
            </div>
          )}

          {!loading && !error && playbook && (
            <div className="markdown-body playbook-content">
              <ReactMarkdown>{playbook}</ReactMarkdown>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
