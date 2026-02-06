'use client';

import { useEffect, useRef, useMemo } from 'react';

/**
 * DocumentViewer - Scrollable document display with highlighted blocks
 */
export default function DocumentViewer({
  blocks = [],
  issues = [],
  highlightedBlockIds = [],
  onBlockClick,
}) {
  const containerRef = useRef(null);
  const blockRefs = useRef({});

  // Build a map of blockId -> issues for highlighting
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

  // Scroll to highlighted block when it changes
  useEffect(() => {
    if (highlightedBlockIds.length > 0) {
      const firstBlockId = highlightedBlockIds[0];
      const blockEl = blockRefs.current[firstBlockId];
      if (blockEl) {
        blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedBlockIds]);

  if (blocks.length === 0) {
    return (
      <div className="document-viewer document-viewer-empty">
        <p>No document content available</p>
      </div>
    );
  }

  return (
    <div className="document-viewer" ref={containerRef}>
      {blocks.map((block) => {
        const blockIssues = blockIssueMap.get(block.id) || [];
        const isHighlighted = highlightedBlockIds.includes(block.id);
        const hasIssues = blockIssues.length > 0;
        const maxSeverity = getMaxSeverity(blockIssues);

        return (
          <div
            key={block.id}
            ref={(el) => (blockRefs.current[block.id] = el)}
            className={`document-block document-block-${block.type} ${
              isHighlighted ? 'highlighted' : ''
            } ${hasIssues ? `has-issues severity-${maxSeverity}` : ''}`}
            data-block-id={block.id}
            onClick={() => onBlockClick?.(block.id, blockIssues)}
          >
            {block.type === 'heading' ? (
              <HeadingBlock block={block} />
            ) : (
              <ParagraphBlock block={block} />
            )}
            {hasIssues && (
              <span className={`block-issue-indicator severity-${maxSeverity}`}>
                {blockIssues.length} {blockIssues.length === 1 ? 'issue' : 'issues'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HeadingBlock({ block }) {
  const level = block.level || 1;
  const Tag = `h${Math.min(level + 2, 6)}`; // h3-h6 for document headings

  return <Tag className="document-heading">{block.content}</Tag>;
}

function ParagraphBlock({ block }) {
  return <p className="document-paragraph">{block.content}</p>;
}

function getMaxSeverity(issues) {
  if (issues.some((i) => i.severity === 'red')) return 'red';
  if (issues.some((i) => i.severity === 'yellow')) return 'yellow';
  return 'green';
}
