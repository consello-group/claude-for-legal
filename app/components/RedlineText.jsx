'use client';

/**
 * RedlineText — Renders word-level diff segments as inline colored text.
 *
 * - "unchanged" → normal dark text
 * - "delete"    → red strikethrough with light red background
 * - "insert"    → green underline with light green background
 */
export default function RedlineText({ segments, style }) {
  if (!segments || segments.length === 0) return null;

  return (
    <div style={{
      fontSize: '13px',
      lineHeight: 1.7,
      fontFamily: "'DM Sans', Arial, sans-serif",
      padding: '14px 16px',
      background: '#FAFAFA',
      borderRadius: '8px',
      border: '1px solid rgba(0,0,0,0.06)',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      ...style,
    }}>
      {segments.map((seg, i) => {
        if (seg.type === 'delete') {
          return (
            <span key={i} style={{
              backgroundColor: 'rgba(198, 40, 40, 0.08)',
              color: '#C62828',
              textDecoration: 'line-through',
              textDecorationColor: '#C62828',
              padding: '1px 2px',
              borderRadius: '2px',
            }}>
              {seg.text}
            </span>
          );
        }
        if (seg.type === 'insert') {
          return (
            <span key={i} style={{
              backgroundColor: 'rgba(46, 125, 50, 0.08)',
              color: '#2E7D32',
              textDecoration: 'underline',
              textDecorationColor: '#2E7D32',
              textUnderlineOffset: '2px',
              padding: '1px 2px',
              borderRadius: '2px',
            }}>
              {seg.text}
            </span>
          );
        }
        return <span key={i} style={{ color: '#333' }}>{seg.text}</span>;
      })}
    </div>
  );
}
