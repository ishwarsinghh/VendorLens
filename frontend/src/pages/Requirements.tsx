import { useState } from 'react';
import { saveRequirements } from '../api';
import Toast, { useToast } from '../components/Toast';

const ALL_FEATURES = [
  'SSO Integration',
  'Mobile App',
  'API Access',
  '24/7 Support',
  'Data Export',
  'Custom Reporting',
  'Multi-tenant',
  'GDPR Compliance',
  'Audit Logs',
  'Role-Based Access',
];

export default function Requirements() {
  const [maxBudget, setMaxBudget]         = useState('');
  const [minSla, setMinSla]               = useState('99.5');
  const [maxWeeks, setMaxWeeks]           = useState('');
  const [selected, setSelected]           = useState<Set<string>>(new Set());
  const [saving, setSaving]               = useState(false);
  const { toasts, addToast, dismiss }     = useToast();

  const toggle = (feature: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(feature) ? next.delete(feature) : next.add(feature);
      return next;
    });
  };

  const selectAll   = () => setSelected(new Set(ALL_FEATURES));
  const deselectAll = () => setSelected(new Set());

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveRequirements({
        session_id:                'default',
        max_budget:                maxBudget   ? parseFloat(maxBudget)   : null,
        min_sla_uptime:            minSla      ? parseFloat(minSla)      : null,
        max_implementation_weeks:  maxWeeks    ? parseInt(maxWeeks, 10)  : null,
        required_features:         Array.from(selected),
      });
      addToast('success', '✅ Requirements saved successfully!');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to save requirements');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>⚙️ Procurement Requirements</h2>
        <p>Define your constraints. Vendors will be scored against these requirements.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>

        {/* Budget & SLA */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>📋 Thresholds</h3>

          <div className="form-group">
            <label className="form-label">Max Budget (USD)</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 100000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
            />
            {maxBudget && (
              <span className="text-muted text-sm">${parseInt(maxBudget).toLocaleString()}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Min SLA Uptime (%)</label>
            <input
              className="form-input"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="e.g. 99.5"
              value={minSla}
              onChange={(e) => setMinSla(e.target.value)}
            />
            <span className="text-muted text-sm">
              {minSla && `~${((1 - parseFloat(minSla) / 100) * 8760).toFixed(1)} hrs/year max downtime`}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Max Implementation Time (weeks)</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 12"
              value={maxWeeks}
              onChange={(e) => setMaxWeeks(e.target.value)}
            />
          </div>
        </div>

        {/* Required Features */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>✅ Required Features</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={selectAll}>All</button>
              <button className="btn btn-ghost btn-sm" onClick={deselectAll}>None</button>
            </div>
          </div>

          <div className="checkbox-grid">
            {ALL_FEATURES.map((feature) => {
              const checked = selected.has(feature);
              return (
                <div
                  key={feature}
                  className={`checkbox-item ${checked ? 'checked' : ''}`}
                  onClick={() => toggle(feature)}
                >
                  <div className="checkbox-box">{checked && '✓'}</div>
                  <span className="checkbox-label">{feature}</span>
                </div>
              );
            })}
          </div>

          <div className="text-muted text-sm">
            {selected.size} of {ALL_FEATURES.length} features selected
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <><span className="spinner" /> Saving...</> : '💾 Save Requirements'}
        </button>
        <span className="text-muted text-sm">
          Requirements are used to filter and score vendor proposals.
        </span>
      </div>

      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
