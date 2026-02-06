'use client';

import { useMemo } from 'react';

/**
 * ClauseMap - Document outline showing structure with issue indicators
 */
export default function ClauseMap({
  blocks = [],
  issues = [],
  activeBlockId,
  onBlockClick,
}) {
  // Build a map of blockId -> issues for that block
  const blockIssueMap = useMemo(() => {
    const map = new Map();
    for (const issue of issues) {
      for (const blockId of issue.sourceBlockIds || []) {
        const existing = map.get(blockId) || [];
        existing.push(issue);
        map.set(blockId, existing);
      }
    }
    return map;
  }, [issues]);

  // Extract headings and important blocks for the map
  const mapItems = useMemo(() => {
    const items = [];
    let currentSection = null;

    for (const block of blocks) {
      if (block.type === 'heading') {
        const blockIssues = blockIssueMap.get(block.id) || [];
        items.push({
          id: block.id,
          type: 'heading',
          level: block.level || 1,
          content: block.content,
          hasIssues: blockIssues.length > 0,
          issueCount: blockIssues.length,
          maxSeverity: getMaxSeverity(blockIssues),
        });
        currentSection = block.id;
      } else {
        // Check if this paragraph has issues
        const blockIssues = blockIssueMap.get(block.id) || [];
        if (blockIssues.length > 0) {
          // Add a marker for paragraphs with issues (under current section)
          items.push({
            id: block.id,
            type: 'issue-marker',
            level: currentSection ? 2 : 1,
            content: truncate(block.content, 50),
            hasIssues: true,
            issueCount: blockIssues.length,
            maxSeverity: getMaxSeverity(blockIssues),
            parentSection: currentSection,
          });
        }
      }
    }

    return items;
  }, [blocks, blockIssueMap]);

  if (blocks.length === 0) {
    return (
      <div className="clause-map clause-map-empty">
        <p>No document structure available</p>
      </div>
    );
  }

  return (
    <div className="clause-map">
      <h4 className="clause-map-title">Document Structure</h4>
      <nav className="clause-map-nav">
        {mapItems.map((item) => (
          <button
            key={item.id}
            className={`clause-map-item clause-map-level-${item.level} ${
              item.type === 'issue-marker' ? 'clause-map-issue-marker' : ''
            } ${item.hasIssues ? `has-issues severity-${item.maxSeverity}` : ''} ${
              activeBlockId === item.id ? 'active' : ''
            }`}
            onClick={() => onBlockClick?.(item.id)}
            title={item.content}
          >
            <span className="clause-map-text">
              {item.type === 'issue-marker' ? '↳ ' : ''}
              {item.content}
            </span>
            {item.hasIssues && (
              <span className={`clause-map-badge severity-${item.maxSeverity}`}>
                {item.issueCount}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

function getMaxSeverity(issues) {
  if (issues.some(i => i.severity === 'red')) return 'red';
  if (issues.some(i => i.severity === 'yellow')) return 'yellow';
  return 'green';
}

function truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
