'use client';

import { useState } from 'react';

const ChevronIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{
    transition: "transform 0.2s ease",
    transform: open ? "rotate(180deg)" : "rotate(0deg)",
  }}>
    <path d="M4 6l4 4 4-4" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * IssueCard — Expandable card with severity-colored accent bar.
 * Expects issue shape: { title, severity ('critical'|'warning'), section, detail, suggestion }
 */
export default function IssueCard({ issue, isOpen, onToggle }) {
  const [copied, setCopied] = useState(false);
  const severityColor = issue.severity === 'critical' ? '#DC2626' : '#F59E0B';
  const severityLabel = issue.severity === 'critical' ? 'CRITICAL' : 'WARNING';

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid rgba(0,0,0,0.06)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s ease',
      boxShadow: isOpen ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
    }}>
      {/* Clickable header */}
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 16px', background: 'none', border: 'none',
        cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif", textAlign: 'left',
      }}>
        {/* Severity color bar */}
        <div style={{
          width: '4px', height: '28px', borderRadius: '2px',
          background: severityColor, flexShrink: 0,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '13px', fontWeight: 600, color: '#000', lineHeight: 1.3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {issue.title}
          </div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
            {issue.section} · <span style={{ color: severityColor, fontWeight: 600 }}>{severityLabel}</span>
          </div>
        </div>
        <ChevronIcon open={isOpen} />
      </button>

      {/* Expanded detail */}
      {isOpen && (
        <div style={{ padding: '0 16px 16px 32px', animation: 'fadeInUp 0.25s ease forwards' }}>
          <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, marginBottom: '14px', whiteSpace: 'pre-wrap' }}>
            {issue.detail}
          </div>
          {issue.suggestion && (
            <div style={{
              fontSize: '13px', lineHeight: 1.6, padding: '12px 14px', borderRadius: '8px',
              background: 'rgba(166, 74, 48, 0.04)', border: '1px solid rgba(166, 74, 48, 0.1)',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontWeight: 600, color: '#A64A30', fontSize: '11px',
                  textTransform: 'uppercase', letterSpacing: '0.3px',
                }}>Suggested edit</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy(issue.suggestion); }}
                  style={{
                    fontSize: '11px', fontWeight: 500, color: copied ? '#16A34A' : '#A64A30',
                    background: 'none', border: '1px solid ' + (copied ? 'rgba(22,163,74,0.2)' : 'rgba(166,74,48,0.15)'),
                    borderRadius: '6px', padding: '3px 10px', cursor: 'pointer',
                    fontFamily: "'DM Sans', Arial, sans-serif", transition: 'all 0.15s ease',
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ marginTop: '4px', color: '#555' }}>{issue.suggestion}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
