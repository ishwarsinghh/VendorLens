interface Props {
  label: string;
  value: number;
  max: number;
  color: string;
}

export default function ScoreBar({ label, value, max, color }: Props) {
  const pct = Math.min(100, (value / max) * 100);

  return (
    <div className="score-bar-row">
      <span className="score-bar-label">{label}</span>
      <div className="progress-bar-wrap flex-1">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="score-bar-value">{value.toFixed(1)}/{max}</span>
    </div>
  );
}
