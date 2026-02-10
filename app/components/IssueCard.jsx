'use client';

import { useState } from 'react';
import RedlineText from './RedlineText';

const ChevronIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{
    transition: "transform 0.2s ease",
    transform: open ? "rotate(180deg)" : "rotate(0deg)",
  }}>
    <path d="M4 6l4 4 4-4" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Extract the "result" text (unchanged + inserted) from diff segments */
function getInsertTextFromSegments(segments) {
  if (!segments) return '';
  return segments
    .filter(s => s.type === 'insert' || s.type === 'unchanged')
    .map(s => s.text)
    .join('');
}

/**
 * IssueCard — Expandable card with severity-colored accent bar,
 * optional redline selection checkbox, variant toggle, inline redline
 * preview, and edit mode.
 */
export default function IssueCard({ issue, isOpen, onToggle, decision, onDecisionChange }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const severityColor = issue.severity === 'critical' ? '#DC2626' : '#F59E0B';
  const severityLabel = issue.severity === 'critical' ? 'CRITICAL' : 'WARNING';

  const hasEdits = issue._original?.editPlans?.length > 0;
  const hasVariants = issue._original?.editPlans?.length > 1;
  const isSelected = decision?.apply;
  const hasCustomText = !!decision?.customText;

  // Get diff segments for the currently selected variant
  const activeDiffSegments = (() => {
    const diffSegs = issue._original?.diffSegments;
    if (!diffSegs) return null;
    const variant = decision?.variant || 'preferred';
    return diffSegs[variant] || diffSegs.preferred || null;
  })();

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
      border: isSelected ? '1px solid rgba(166, 74, 48, 0.2)' : '1px solid rgba(0,0,0,0.06)',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      boxShadow: isOpen ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
    }}>
      {/* Clickable header */}
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '14px 16px', background: 'none', border: 'none',
        cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif", textAlign: 'left',
      }}>
        {/* Checkbox for redline inclusion */}
        {hasEdits && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onDecisionChange?.({ apply: !isSelected });
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                onDecisionChange?.({ apply: !isSelected });
              }
            }}
            role="checkbox"
            tabIndex={0}
            aria-checked={!!isSelected}
            aria-label={`Include "${issue.title}" in redline`}
            style={{
              width: '18px', height: '18px', borderRadius: '4px',
              border: isSelected ? '2px solid #A64A30' : '2px solid #ccc',
              background: isSelected ? '#A64A30' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s ease',
            }}
          >
            {isSelected && <CheckIcon />}
          </div>
        )}

        {/* Severity color bar */}
        <div style={{
          width: '4px', height: '28px', borderRadius: '2px',
          background: severityColor, flexShrink: 0,
        }} />

        {/* Title and labels */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '13px', fontWeight: 600, color: '#000', lineHeight: 1.3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {issue.title}
          </div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
            {issue.section} · <span style={{ color: severityColor, fontWeight: 600 }}>{severityLabel}</span>
            {hasEdits && isSelected && (
              <span style={{ color: '#A64A30', marginLeft: '6px' }}>
                · {hasCustomText ? 'Edited' : 'In redline'}
              </span>
            )}
          </div>
        </div>
        <ChevronIcon open={isOpen} />
      </button>

      {/* Expanded detail */}
      {isOpen && (
        <div style={{
          padding: '0 16px 16px',
          paddingLeft: hasEdits ? '60px' : '32px',
          animation: 'fadeInUp 0.25s ease forwards',
        }}>
          {/* Inline redline preview — shown when diffSegments exist and no custom edit */}
          {activeDiffSegments && activeDiffSegments.length > 0 && !hasCustomText && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{
                fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.3px', color: '#999', marginBottom: '8px',
              }}>
                Proposed Change
              </div>
              <RedlineText segments={activeDiffSegments} />
            </div>
          )}

          {/* Custom edit indicator */}
          {hasCustomText && (
            <div style={{
              marginBottom: '14px', padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(166, 74, 48, 0.04)', border: '1px solid rgba(166, 74, 48, 0.1)',
            }}>
              <div style={{
                fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.3px', color: '#A64A30', marginBottom: '6px',
              }}>
                Your Edit
              </div>
              <div style={{ fontSize: '13px', color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {decision.customText}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDecisionChange?.({ customText: undefined });
                }}
                style={{
                  fontSize: '11px', fontWeight: 500, color: '#999', background: 'none',
                  border: '1px solid rgba(0,0,0,0.08)', borderRadius: '6px',
                  padding: '3px 10px', cursor: 'pointer', marginTop: '8px',
                  fontFamily: "'DM Sans', Arial, sans-serif",
                }}
              >
                Revert to suggestion
              </button>
            </div>
          )}

          <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, marginBottom: '14px', whiteSpace: 'pre-wrap' }}>
            {issue.detail}
          </div>

          {/* Variant toggle (preferred/fallback) — only when selected and >1 variant */}
          {hasEdits && hasVariants && isSelected && !hasCustomText && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {issue._original.editPlans.map(plan => (
                <button
                  key={plan.variant}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDecisionChange?.({ variant: plan.variant });
                  }}
                  style={{
                    fontSize: '11px', fontWeight: 600, padding: '5px 12px',
                    borderRadius: '9999px',
                    border: decision?.variant === plan.variant
                      ? '1px solid #A64A30' : '1px solid rgba(0,0,0,0.1)',
                    background: decision?.variant === plan.variant
                      ? 'rgba(166, 74, 48, 0.08)' : '#fff',
                    color: decision?.variant === plan.variant ? '#A64A30' : '#666',
                    cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif",
                    transition: 'all 0.15s ease', textAlign: 'left',
                  }}
                >
                  {plan.variant === 'preferred' ? 'Preferred' : 'Fallback'}
                  {plan.description && (
                    <span style={{ fontWeight: 400, marginLeft: '4px', opacity: 0.7 }}>
                      — {plan.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Edit textarea mode */}
          {isEditing ? (
            <div style={{
              fontSize: '13px', lineHeight: 1.6, padding: '12px 14px', borderRadius: '8px',
              background: 'rgba(166, 74, 48, 0.04)', border: '1px solid rgba(166, 74, 48, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                  fontWeight: 600, color: '#A64A30', fontSize: '11px',
                  textTransform: 'uppercase', letterSpacing: '0.3px',
                }}>Edit Suggested Text</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDecisionChange?.({ customText: editText, apply: true });
                      setIsEditing(false);
                    }}
                    style={{
                      fontSize: '11px', fontWeight: 600, color: '#fff', background: '#A64A30',
                      border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer',
                      fontFamily: "'DM Sans', Arial, sans-serif",
                    }}
                  >Save</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
                    style={{
                      fontSize: '11px', fontWeight: 500, color: '#666', background: 'none',
                      border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', padding: '4px 12px',
                      cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif",
                    }}
                  >Cancel</button>
                </div>
              </div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%', minHeight: '80px', padding: '10px', fontSize: '13px',
                  fontFamily: "'DM Sans', Arial, sans-serif", lineHeight: 1.6,
                  border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px',
                  background: '#fff', resize: 'vertical', color: '#333', boxSizing: 'border-box',
                }}
              />
            </div>
          ) : (
            /* Suggestion box with Copy and Edit buttons */
            issue.suggestion && (
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
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {hasEdits && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const suggestedText = getInsertTextFromSegments(activeDiffSegments) || issue.suggestion || '';
                          setEditText(suggestedText);
                          setIsEditing(true);
                        }}
                        style={{
                          fontSize: '11px', fontWeight: 500, color: '#A64A30',
                          background: 'none', border: '1px solid rgba(166,74,48,0.15)',
                          borderRadius: '6px', padding: '3px 10px', cursor: 'pointer',
                          fontFamily: "'DM Sans', Arial, sans-serif", transition: 'all 0.15s ease',
                        }}
                      >
                        Edit
                      </button>
                    )}
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
                </div>
                <div style={{ marginTop: '4px', color: '#555' }}>{issue.suggestion}</div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
