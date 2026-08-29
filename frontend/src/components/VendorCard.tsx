import type { VendorComparison } from '../api';
import ScoreBar from './ScoreBar';

interface Props {
  vendor: VendorComparison;
  isBestCost: boolean;
  isWorstCost: boolean;
  onDelete: (id: string) => void;
}

function fmt(n: number | null, prefix = '', suffix = '', decimals = 0) {
  if (n === null || n === undefined) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  return `${prefix}${n.toLocaleString(undefined, { maximumFractionDigits: decimals })}${suffix}`;
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const cls = score >= 85 ? 'score-badge-high' : score >= 70 ? 'score-badge-mid' : 'score-badge-low';
  return (
    <div className={`score-badge ${cls}`}>
      <span>{Math.round(score)}</span>
      <span className="label">/100</span>
    </div>
  );
}

export default function VendorCard({ vendor, isBestCost, isWorstCost, onDelete }: Props) {
  const {
    proposal_id, vendor_name, total_cost, implementation_time_weeks,
    sla_uptime, payment_terms, support_level, score, score_breakdown,
    features, risk_flags: _rf, risk_summary, is_recommended,
  } = vendor;

  return (
    <div className={`vendor-card ${is_recommended ? 'recommended' : ''}`}>
      {is_recommended && (
        <div className="vendor-card-banner">⭐ Recommended</div>
      )}

      {/* Header */}
      <div className="vendor-card-header">
        <div>
          <div className="vendor-name">{vendor_name ?? 'Unknown Vendor'}</div>
          {risk_summary && (risk_summary.HIGH > 0 || risk_summary.MEDIUM > 0) && (
            <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
              {risk_summary.HIGH > 0 && (
                <span className="badge badge-danger">⚠ {risk_summary.HIGH} HIGH</span>
              )}
              {risk_summary.MEDIUM > 0 && (
                <span className="badge badge-warning">{risk_summary.MEDIUM} MED</span>
              )}
            </div>
          )}
        </div>
        <ScoreBadge score={score} />
      </div>

      {/* Key Metrics */}
      <div className="vendor-card-body">
        <div
          className="metric-row"
          style={isBestCost ? { background: 'var(--success-bg)' } : isWorstCost ? { background: 'var(--danger-bg)' } : {}}
        >
          <span className="metric-label">💰 Total Cost</span>
          <span className={`metric-value ${isBestCost ? 'best' : isWorstCost ? 'worst' : ''}`}>
            {total_cost !== null ? `$${total_cost.toLocaleString()}` : '—'}
          </span>
        </div>

        <div className="metric-row">
          <span className="metric-label">⏱ SLA Uptime</span>
          <span className="metric-value">
            {sla_uptime !== null ? `${sla_uptime}%` : <span style={{ color: 'var(--danger)' }}>Not stated ⚠</span>}
          </span>
        </div>

        <div className="metric-row">
          <span className="metric-label">📅 Implementation</span>
          <span className="metric-value">{fmt(implementation_time_weeks, '', ' wks')}</span>
        </div>

        <div className="metric-row">
          <span className="metric-label">💳 Payment</span>
          <span className="metric-value" style={{ fontSize: 11 }}>{payment_terms ?? '—'}</span>
        </div>

        <div className="metric-row">
          <span className="metric-label">🛎 Support</span>
          <span className="metric-value" style={{ fontSize: 11 }}>{support_level ?? '—'}</span>
        </div>
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div className="features-section">
          <h4>Features ({features.filter(f => f.is_included).length}/{features.length})</h4>
          {features.map((f) => (
            <div key={f.feature_name} className="feature-row">
              <span className="feature-check">{f.is_included ? '✅' : '❌'}</span>
              <span style={{ color: f.is_included ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {f.feature_name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Score Breakdown */}
      {score_breakdown && (
        <div className="score-section">
          <h4>Score Breakdown</h4>
          <ScoreBar label="Cost"    value={score_breakdown.cost_score}    max={40} color="var(--accent)" />
          <ScoreBar label="SLA"     value={score_breakdown.sla_score}     max={30} color="var(--success)" />
          <ScoreBar label="Features" value={score_breakdown.feature_score} max={20} color="var(--purple)" />
          <ScoreBar label="Speed"   value={score_breakdown.speed_score}   max={10} color="var(--warning)" />
        </div>
      )}

      {/* Delete button */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(proposal_id)}
          style={{ width: '100%' }}
        >
          🗑 Remove Vendor
        </button>
      </div>
    </div>
  );
}
