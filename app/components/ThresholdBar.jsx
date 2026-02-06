'use client';

/**
 * ThresholdBar - Visual range indicator for clauses with numeric thresholds.
 * Shows how values map to GREEN/YELLOW/RED zones.
 *
 * Example:
 *   Liability Cap:  [RED | 6mo ——— GREEN ——— 24mo | RED]
 *                            ↑ Standard: 12mo
 */
export default function ThresholdBar({ threshold }) {
  if (!threshold) return null;

  const { unit, standard, min, max } = threshold;

  // Calculate positions as percentages of total bar
  // We show a range from 0 to max * 1.5 to leave room for the red zone on the right
  const totalRange = max * 1.5;
  const minPct = (min / totalRange) * 100;
  const maxPct = (max / totalRange) * 100;
  const stdPct = (standard / totalRange) * 100;

  return (
    <div className="threshold-bar-container">
      <div className="threshold-bar">
        {/* Red zone left */}
        <div
          className="threshold-zone threshold-red"
          style={{ left: 0, width: `${minPct}%` }}
        />
        {/* Green zone */}
        <div
          className="threshold-zone threshold-green"
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
        />
        {/* Red zone right */}
        <div
          className="threshold-zone threshold-red"
          style={{ left: `${maxPct}%`, width: `${100 - maxPct}%` }}
        />
        {/* Standard marker */}
        <div className="threshold-marker" style={{ left: `${stdPct}%` }}>
          <div className="threshold-marker-line" />
          <div className="threshold-marker-label">
            {standard} {unit}
          </div>
        </div>
      </div>
      <div className="threshold-labels">
        <span className="threshold-label-min">{min} {unit}</span>
        <span className="threshold-label-std">Standard</span>
        <span className="threshold-label-max">{max} {unit}</span>
      </div>
    </div>
  );
}
