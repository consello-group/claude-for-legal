'use client';

/**
 * RiskScorecard - Displays overall risk classification and issue counts
 */
export default function RiskScorecard({ classification, issues = [] }) {
  const level = classification?.toUpperCase() || 'UNKNOWN';

  const redCount = issues.filter(i => i.severity === 'red').length;
  const yellowCount = issues.filter(i => i.severity === 'yellow').length;
  const totalIssues = issues.length;

  const classificationConfig = {
    GREEN: {
      emoji: '🟢',
      label: 'Standard Approval',
      description: 'All standard positions met. Approve via delegation.',
      bgClass: 'scorecard-green',
    },
    YELLOW: {
      emoji: '🟡',
      label: 'Counsel Review',
      description: 'Minor deviations within acceptable ranges.',
      bgClass: 'scorecard-yellow',
    },
    RED: {
      emoji: '🔴',
      label: 'Escalate',
      description: 'Outside acceptable ranges. Requires senior counsel.',
      bgClass: 'scorecard-red',
    },
    UNKNOWN: {
      emoji: '⚪',
      label: 'Not Classified',
      description: 'Analysis incomplete or classification unavailable.',
      bgClass: 'scorecard-unknown',
    },
  };

  const config = classificationConfig[level] || classificationConfig.UNKNOWN;

  return (
    <div className={`risk-scorecard ${config.bgClass}`}>
      <div className="scorecard-header">
        <span className="scorecard-emoji">{config.emoji}</span>
        <div className="scorecard-title">
          <h3>{level}</h3>
          <span className="scorecard-label">{config.label}</span>
        </div>
      </div>

      <p className="scorecard-description">{config.description}</p>

      <div className="scorecard-stats">
        <div className="stat">
          <span className="stat-value">{totalIssues}</span>
          <span className="stat-label">Total Issues</span>
        </div>
        <div className="stat stat-red">
          <span className="stat-value">{redCount}</span>
          <span className="stat-label">Critical</span>
        </div>
        <div className="stat stat-yellow">
          <span className="stat-value">{yellowCount}</span>
          <span className="stat-label">Warnings</span>
        </div>
      </div>
    </div>
  );
}
