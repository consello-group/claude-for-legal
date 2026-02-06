'use client';

/**
 * IssueCard - Displays a single issue with navigation and details
 */
export default function IssueCard({
  issue,
  isExpanded = false,
  onToggle,
  onViewInDocument,
}) {
  const severityConfig = {
    red: {
      emoji: '🔴',
      label: 'Critical',
      className: 'issue-card-red',
    },
    yellow: {
      emoji: '🟡',
      label: 'Warning',
      className: 'issue-card-yellow',
    },
    green: {
      emoji: '🟢',
      label: 'Info',
      className: 'issue-card-green',
    },
  };

  const config = severityConfig[issue.severity] || severityConfig.yellow;

  return (
    <div className={`issue-card ${config.className} ${isExpanded ? 'expanded' : ''}`}>
      <div className="issue-card-header" onClick={onToggle}>
        <div className="issue-card-title-row">
          <span className="issue-severity-badge">
            {config.emoji} {config.label}
          </span>
          <h4 className="issue-title">{issue.title}</h4>
        </div>
        <button
          className="issue-expand-btn"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="issue-card-body">
          <div className="issue-section">
            <strong>What:</strong>
            <p>{issue.description}</p>
          </div>

          <div className="issue-section">
            <strong>Risk:</strong>
            <p>{issue.risk}</p>
          </div>

          <div className="issue-section">
            <strong>Recommendation:</strong>
            <p>{issue.recommendation}</p>
          </div>

          {issue.sourceQuote && (
            <div className="issue-section issue-quote">
              <strong>Source:</strong>
              <blockquote>"{issue.sourceQuote}"</blockquote>
            </div>
          )}

          {issue.sourceBlockIds?.length > 0 && (
            <div className="issue-actions">
              <button
                className="btn btn-secondary btn-small"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewInDocument?.(issue.sourceBlockIds);
                }}
              >
                View in Document
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
