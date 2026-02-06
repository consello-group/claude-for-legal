'use client';

import { useState, useCallback } from 'react';
import RiskScorecard from './RiskScorecard';
import ClauseMap from './ClauseMap';
import DocumentViewer from './DocumentViewer';
import IssueCard from './IssueCard';

/**
 * ReviewDashboard - Main results view with interactive document review
 */
export default function ReviewDashboard({
  parsedDocument,
  analysisResult,
  onBack,
  onExport,
}) {
  const [highlightedBlockIds, setHighlightedBlockIds] = useState([]);
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [activeBlockId, setActiveBlockId] = useState(null);

  const blocks = parsedDocument?.blocks || [];
  const issues = analysisResult?.issues || [];
  const screening = analysisResult?.screening || [];
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
    if (blockIssues?.length > 0) {
      setExpandedIssueId(blockIssues[0].id);
    }
  }, []);

  // Toggle issue expansion
  const handleToggleIssue = useCallback((issueId) => {
    setExpandedIssueId((prev) => (prev === issueId ? null : issueId));
  }, []);

  // If no parsed document, show a simpler view with just screening results
  const hasDocumentBlocks = blocks.length > 0;

  return (
    <div className="review-dashboard">
      {/* Header */}
      <div className="review-dashboard-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← New Document
        </button>
        <h2>Analysis Results</h2>
        <div className="results-actions">
          {onExport && (
            <button className="btn btn-primary btn-sm" onClick={onExport}>
              Export Report
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="review-dashboard-content">
        {/* Left Sidebar: Scorecard + Screening/Clause Map */}
        <aside className="review-sidebar">
          <RiskScorecard classification={classification} issues={issues} />

          {/* Show clause map if we have blocks, otherwise show screening table */}
          {hasDocumentBlocks ? (
            <ClauseMap
              blocks={blocks}
              issues={issues}
              activeBlockId={activeBlockId}
              onBlockClick={handleClauseMapClick}
            />
          ) : (
            <div className="screening-results">
              <h4 className="screening-title">Screening Results</h4>
              <div className="screening-list">
                {screening.map((item, idx) => (
                  <div key={idx} className={`screening-item status-${item.status}`}>
                    <span className="screening-status">
                      {item.status === 'pass' ? '✓' : item.status === 'flag' ? '⚠' : '✕'}
                    </span>
                    <div className="screening-content">
                      <span className="screening-criterion">{item.criterion}</span>
                      <span className="screening-note">{item.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Center: Document Viewer or Contract Summary */}
        <main className="review-main">
          <div className="review-document-container">
            {hasDocumentBlocks ? (
              <>
                <h3>Document</h3>
                <DocumentViewer
                  blocks={blocks}
                  issues={issues}
                  highlightedBlockIds={highlightedBlockIds}
                  onBlockClick={handleBlockClick}
                />
              </>
            ) : (
              <>
                <h3>Contract Summary</h3>
                <div className="contract-summary">
                  <div className="summary-item">
                    <label>Document</label>
                    <span>{analysisResult?.document || 'N/A'}</span>
                  </div>
                  <div className="summary-item">
                    <label>Parties</label>
                    <span>{analysisResult?.parties || 'N/A'}</span>
                  </div>
                  <div className="summary-item">
                    <label>Type</label>
                    <span>{analysisResult?.type || 'N/A'}</span>
                  </div>
                  <div className="summary-item">
                    <label>Term</label>
                    <span>{analysisResult?.term || 'N/A'}</span>
                  </div>
                  <div className="summary-item">
                    <label>Governing Law</label>
                    <span>{analysisResult?.governingLaw || 'N/A'}</span>
                  </div>

                  {/* Screening table for demo mode */}
                  <div className="summary-screening">
                    <h4>Screening Results</h4>
                    <table className="screening-table">
                      <thead>
                        <tr>
                          <th>Criterion</th>
                          <th>Status</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {screening.map((item, idx) => (
                          <tr key={idx} className={`status-${item.status}`}>
                            <td>{item.criterion}</td>
                            <td className="status-cell">
                              {item.status === 'pass' ? '✓' : item.status === 'flag' ? '⚠' : '✕'}
                            </td>
                            <td>{item.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        {/* Right Sidebar: Issues List */}
        <aside className="review-issues">
          <h3>Issues ({issues.length})</h3>
          <div className="issues-list">
            {issues.length === 0 ? (
              <div className="no-issues">
                <span className="no-issues-icon">✓</span>
                <p>No issues found</p>
                <span className="no-issues-hint">This document meets playbook standards</span>
              </div>
            ) : (
              issues.map((issue, idx) => (
                <IssueCard
                  key={issue.id || idx}
                  issue={issue}
                  isExpanded={expandedIssueId === (issue.id || idx)}
                  onToggle={() => handleToggleIssue(issue.id || idx)}
                  onViewInDocument={hasDocumentBlocks ? handleViewInDocument : null}
                />
              ))
            )}
          </div>
        </aside>
      </div>

      {/* Footer with recommendation and next steps */}
      <div className="review-dashboard-footer">
        <div className="footer-recommendation">
          <h4>Recommendation</h4>
          <p>{analysisResult?.recommendation || 'Review the analysis above.'}</p>
        </div>

        {analysisResult?.nextSteps?.length > 0 && (
          <div className="footer-next-steps">
            <h4>Next Steps</h4>
            <ol>
              {analysisResult.nextSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Generate Redline CTA - only show if there are issues with edit plans */}
        {issues.some(i => i.editPlans?.length > 0) && (
          <div className="generate-redline-cta">
            <div>
              <h4>Ready to Generate Redline?</h4>
              <p>Select which changes to include and export a marked-up document.</p>
            </div>
            <button className="btn" disabled>
              Coming Soon
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
