import type { VendorComparison } from '../api';

interface Props {
  vendors: VendorComparison[];
}

const SEVERITY_CLASS: Record<string, string> = {
  HIGH:   'badge-danger',
  MEDIUM: 'badge-warning',
  LOW:    'badge badge-accent',
};

const SEVERITY_ICON: Record<string, string> = {
  HIGH:   '🔴',
  MEDIUM: '🟠',
  LOW:    '🟡',
};

export default function RiskPanel({ vendors }: Props) {
  const hasAnyRisk = vendors.some((v) => v.risk_flags && v.risk_flags.length > 0);

  return (
    <div className="risk-section">
      <h3>
        <span>⚠️</span>
        Risk Analysis
        {!hasAnyRisk && (
          <span className="badge badge-success" style={{ marginLeft: 12 }}>All Clear</span>
        )}
      </h3>

      <div className="risk-grid">
        {vendors.map((vendor) => (
          <div key={vendor.proposal_id} className="risk-card">
            <div className="risk-card-header">
              <h4>{vendor.vendor_name ?? 'Unknown'}</h4>
              {vendor.risk_summary && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {vendor.risk_summary.HIGH > 0 && (
                    <span className="badge badge-danger">{vendor.risk_summary.HIGH} High</span>
                  )}
                  {vendor.risk_summary.MEDIUM > 0 && (
                    <span className="badge badge-warning">{vendor.risk_summary.MEDIUM} Med</span>
                  )}
                  {vendor.risk_summary.LOW > 0 && (
                    <span className="badge badge-accent">{vendor.risk_summary.LOW} Low</span>
                  )}
                </div>
              )}
            </div>

            {vendor.risk_flags && vendor.risk_flags.length > 0 ? (
              vendor.risk_flags.map((flag) => (
                <div key={flag.risk_id} className="risk-flag">
                  <span className={`badge ${SEVERITY_CLASS[flag.severity] ?? 'badge-accent'} risk-flag-badge`}>
                    {SEVERITY_ICON[flag.severity]} {flag.severity}
                  </span>
                  <span className="risk-flag-desc">{flag.description}</span>
                </div>
              ))
            ) : (
              <div className="no-risk">✅ No risks detected</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
