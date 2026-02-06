'use client';

import { useState, useCallback } from 'react';
import RiskScorecard from './RiskScorecard';
import ClauseMap from './ClauseMap';
import DocumentViewer from './DocumentViewer';
import IssueCard from './IssueCard';

/**
 * ReviewDashboard - Mode A: Interactive document review with issue navigation
 */
export default function ReviewDashboard({
  parsedDocument,
  analysisResult,
  onBack,
}) {
  const [highlightedBlockIds, setHighlightedBlockIds] = useState([]);
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [activeBlockId, setActiveBlockId] = useState(null);

  const blocks = parsedDocument?.blocks || [];
  const issues = analysisResult?.issues || [];
  const classification = analysisResult?.classification || analysisResult?.level;

  // Handle clicking "View in Document" on an issue
  const handleViewInDocument = useCallback((blockIds) => {
    setHighlightedBlockIds(blockIds);
    setActiveBlockId(blockIds[0]);
  }, []);

  // Handle clicking a block in the clause map
  const handleClauseMapClick = useCallback((blockId) => {
    setHighlightedBlockIds([blockId]);
    setActiveBlockId(blockId);
  }, []);

  // Handle clicking a block in the document viewer
  const handleBlockClick = useCallback((blockId, blockIssues) => {
    setActiveBlockId(blockId);
    // If this block has issues, expand the first one
    if (blockIssues?.length > 0) {
      setExpandedIssueId(blockIssues[0].id);
    }
  }, []);

  // Toggle issue expansion
  const handleToggleIssue = useCallback((issueId) => {
    setExpandedIssueId((prev) => (prev === issueId ? null : issueId));
  }, []);

  return (
    <div className="review-dashboard">
      {/* Header */}
      <div className="review-dashboard-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Triage
        </button>
        <h2>Review Dashboard</h2>
        <div className="document-name-badge">
          {parsedDocument?.filename || 'Document'}
        </div>
      </div>

      {/* Main Content */}
      <div className="review-dashboard-content">
        {/* Left Sidebar: Scorecard + Clause Map */}
        <aside className="review-sidebar">
          <RiskScorecard classification={classification} issues={issues} />
          <ClauseMap
            blocks={blocks}
            issues={issues}
            activeBlockId={activeBlockId}
            onBlockClick={handleClauseMapClick}
          />
        </aside>

        {/* Center: Document Viewer */}
        <main className="review-main">
          <div className="review-document-container">
            <h3>Document</h3>
            <DocumentViewer
              blocks={blocks}
              issues={issues}
              highlightedBlockIds={highlightedBlockIds}
              onBlockClick={handleBlockClick}
            />
          </div>
        </main>

        {/* Right Sidebar: Issues List */}
        <aside className="review-issues">
          <h3>Issues ({issues.length})</h3>
          <div className="issues-list">
            {issues.length === 0 ? (
              <p className="no-issues">No issues found</p>
            ) : (
              issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  isExpanded={expandedIssueId === issue.id}
                  onToggle={() => handleToggleIssue(issue.id)}
                  onViewInDocument={handleViewInDocument}
                />
              ))
            )}
          </div>
        </aside>
      </div>

      {/* Footer with summary */}
      {analysisResult?.recommendation && (
        <div className="review-dashboard-footer">
          <h4>Recommendation</h4>
          <p>{analysisResult.recommendation}</p>
        </div>
      )}
    </div>
  );
}
