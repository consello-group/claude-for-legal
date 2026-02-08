'use client';

import { useState, useEffect, useCallback } from 'react';
import IssueCard from './IssueCard';

// ─── SVG Icon Components ─────────────────────────────────────────────

const FailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="#DC2626" fillOpacity="0.1" />
    <path d="M5.5 10.5L10.5 5.5M5.5 5.5l5 5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PassIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="#16A34A" fillOpacity="0.1" />
    <path d="M5 8.5L7 10.5L11 6" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ExportIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M4 12h8M8 2v7M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WordDocIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5 5l1.5 6L8 7.5 9.5 11 11 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 1s linear infinite" }}>
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Theme Configuration ─────────────────────────────────────────────

const THEMES = {
  red: {
    bannerBg: "#DC2626",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 20h20L12 2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 9v4M12 16v1" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  yellow: {
    bannerBg: "#92400E",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" />
        <path d="M12 8v5M12 16v1" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  green: {
    bannerBg: "#000",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" />
        <path d="M7.5 12.5L10.5 15.5L16.5 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
};

// ─── Data Mapping ────────────────────────────────────────────────────
// Maps the existing AnalysisResult shape to the new UI fields

function deriveResultData(analysisResult) {
  const classification = analysisResult?.classification || 'green';
  const issues = analysisResult?.issues || [];
  const screening = analysisResult?.screening || [];

  // Map severity: existing uses 'red'/'yellow'/'green', new UI uses 'critical'/'warning'
  const mappedIssues = issues.map((issue, i) => ({
    title: issue.title,
    severity: issue.severity === 'red' ? 'critical' : 'warning',
    section: issue.sourceQuote ? `Source` : `Issue ${i + 1}`,
    detail: [issue.description, issue.risk ? `Risk: ${issue.risk}` : ''].filter(Boolean).join('\n\n'),
    suggestion: issue.recommendation || '',
    // Keep original data for interop
    _original: issue,
  }));

  // Map screening: existing uses 'pass'/'flag'/'fail', new UI uses 'pass'/'fail'
  const mappedScreening = screening.map(s => ({
    criterion: s.criterion,
    status: s.status === 'flag' ? 'fail' : s.status,
    note: s.note,
  }));

  // Determine verdict
  const verdict = classification === 'red' ? 'red' : classification === 'yellow' ? 'yellow' : 'green';

  // Derive headline, label, description
  let verdictHeadline, verdictLabel, verdictDesc;

  if (classification === 'red') {
    verdictHeadline = 'DO NOT SIGN';
    verdictLabel = 'ESCALATE';
    verdictDesc = analysisResult?.recommendation || 'This document contains provisions that violate playbook standards. Escalate to senior counsel.';
  } else if (classification === 'yellow') {
    verdictHeadline = 'REVIEW REQUIRED';
    verdictLabel = 'COUNSEL REVIEW';
    verdictDesc = analysisResult?.recommendation || 'Minor deviations found. Route to designated reviewer.';
  } else {
    verdictHeadline = 'APPROVED';
    verdictLabel = 'STANDARD APPROVAL';
    verdictDesc = analysisResult?.recommendation || 'This document meets all playbook standards.';
  }

  return {
    document: analysisResult?.document || 'Document',
    parties: analysisResult?.parties || '—',
    type: analysisResult?.type || '—',
    term: analysisResult?.term || '—',
    governingLaw: analysisResult?.governingLaw || '—',
    verdict,
    verdictHeadline,
    verdictLabel,
    verdictDesc,
    nextSteps: analysisResult?.nextSteps || [],
    screening: mappedScreening,
    issues: mappedIssues,
  };
}

// ─── ReviewDashboard Component ───────────────────────────────────────

export default function ReviewDashboard({
  parsedDocument,
  analysisResult,
  onBack,
  onExport,
  onExportRedline,
  isExportingRedline = false,
  redlineDecisions = {},
  onDecisionChange,
  onSelectAll,
}) {
  const [openIssueId, setOpenIssueId] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('severity');

  const result = deriveResultData(analysisResult);

  const hasIssues = result.issues.length > 0;
  const passCount = result.screening.filter(s => s.status === 'pass').length;
  const failCount = result.screening.filter(s => s.status === 'fail').length;
  const criticalCount = result.issues.filter(i => i.severity === 'critical').length;
  const warningCount = result.issues.filter(i => i.severity === 'warning').length;
  const theme = THEMES[result.verdict];

  // Filtered and sorted issues for display
  const filteredIssues = severityFilter === 'all'
    ? result.issues
    : result.issues.filter(i => i.severity === severityFilter);
  const sortedIssues = sortOrder === 'severity'
    ? [...filteredIssues].sort((a, b) => (a.severity === 'critical' ? 0 : 1) - (b.severity === 'critical' ? 0 : 1))
    : filteredIssues;

  // Redline selection counts (scoped to filtered view)
  const visibleEditableIds = filteredIssues
    .filter(i => i._original?.editPlans?.length > 0)
    .map(i => i._original?.id)
    .filter(Boolean);
  const totalEditable = visibleEditableIds.length;
  const selectedCount = visibleEditableIds.filter(id => redlineDecisions[id]?.apply).length;
  const allSelected = selectedCount === totalEditable && totalEditable > 0;
  // Global counts for button label and state
  const globalSelectedCount = Object.values(redlineDecisions).filter(d => d.apply).length;
  const globalEditableCount = Object.keys(redlineDecisions).length;
  const redlineDisabled = isExportingRedline || (globalEditableCount > 0 && globalSelectedCount === 0);

  useEffect(() => {
    setMounted(true);
    // Auto-open first issue on mount
    const firstIssue = result.issues[0];
    if (firstIssue) {
      setOpenIssueId(firstIssue._original?.id || 'issue-0');
    }
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', Arial, sans-serif", background: "#F8F9FA", minHeight: "100vh" }}>
      {/* ── Top Bar ── */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "0 32px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={onBack}
            style={{
              display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500,
              color: "#666", background: "none", border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "9999px", padding: "6px 14px", cursor: "pointer",
              fontFamily: "'DM Sans', Arial, sans-serif",
            }}
          >
            <ArrowLeftIcon />
            New Document
          </button>
          <h1 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.3px", margin: 0 }}>Analysis Results</h1>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onExportRedline}
            disabled={redlineDisabled}
            title={redlineDisabled && !isExportingRedline ? "Select issues to include in redline" : ""}
            style={{
              display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600,
              color: "#fff", background: redlineDisabled ? "#c4836e" : "#A64A30", border: "none",
              borderRadius: "9999px", padding: "8px 18px",
              cursor: redlineDisabled ? "default" : "pointer",
              fontFamily: "'DM Sans', Arial, sans-serif",
              opacity: redlineDisabled ? 0.5 : 1,
              transition: "all 0.15s ease",
            }}
          >
            {isExportingRedline ? <SpinnerIcon /> : <WordDocIcon />}
            {isExportingRedline ? "Generating..." : globalSelectedCount > 0 ? `Download Redline (${globalSelectedCount})` : "Download Redline"}
          </button>
          <button
            onClick={onExport}
            style={{
              display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600,
              color: "#333", background: "none", border: "1px solid rgba(0,0,0,0.15)",
              borderRadius: "9999px", padding: "8px 18px", cursor: "pointer",
              fontFamily: "'DM Sans', Arial, sans-serif",
            }}
          >
            <ExportIcon />
            Export Report
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "28px 32px 80px" }}>

        {/* ── Verdict Banner ── */}
        <div className={mounted ? "fade-up" : ""} style={{
          background: theme.bannerBg,
          borderRadius: "16px",
          padding: "24px 28px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          gap: "24px",
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1, minWidth: "280px" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {theme.icon}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.3px" }}>
                  {result.verdictHeadline}
                </span>
                <span style={{
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase",
                  background: "rgba(255,255,255,0.15)", padding: "3px 8px", borderRadius: "4px",
                }}>
                  {result.verdictLabel}
                </span>
              </div>
              <div style={{ fontSize: "13px", opacity: 0.85, lineHeight: 1.5, maxWidth: "520px" }}>
                {result.verdictDesc}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px", flexShrink: 0 }}>
            {[
              { n: result.issues.length, label: "Issues" },
              { n: criticalCount, label: "Critical" },
              { n: warningCount, label: "Warnings" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 700, lineHeight: 1, opacity: s.n === 0 ? 0.4 : 1 }}>{s.n}</div>
                <div style={{ fontSize: "11px", fontWeight: 500, opacity: 0.6, marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.3px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Two-Column Grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: hasIssues ? "1fr 380px" : "1fr",
          gap: "20px",
          alignItems: "start",
        }}>

          {/* ── Left Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Contract Summary */}
            <div className={mounted ? "fade-up d1" : ""} style={{
              background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.06)", padding: "24px 28px",
            }}>
              <h3 style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#999", marginBottom: "18px" }}>
                Contract Summary
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", rowGap: "14px", fontSize: "14px" }}>
                {[
                  ["Document", result.document],
                  ["Parties", result.parties],
                  ["Type", result.type],
                  ["Term", result.term],
                  ["Governing Law", result.governingLaw],
                ].map(([label, value], i) => (
                  <div key={i} style={{ display: "contents" }}>
                    <span style={{ fontWeight: 500, color: "#999", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.3px", paddingTop: "2px" }}>{label}</span>
                    <span style={{ color: "#000", fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Playbook Screening */}
            <div className={mounted ? "fade-up d2" : ""} style={{
              background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.06)", padding: "24px 28px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                <h3 style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#999", margin: 0 }}>
                  Playbook Screening
                </h3>
                <div style={{ display: "flex", gap: "12px", fontSize: "12px", fontWeight: 500 }}>
                  {failCount > 0 && <span style={{ color: "#DC2626" }}>{failCount} failed</span>}
                  <span style={{ color: "#16A34A" }}>{passCount} passed</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {result.screening.map((s, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "20px 170px 1fr", gap: "10px",
                    alignItems: "center", padding: "9px 0",
                    borderBottom: i < result.screening.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                  }}>
                    {s.status === "fail" ? <FailIcon /> : <PassIcon />}
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#000" }}>{s.criterion}</span>
                    <span style={{ fontSize: "12px", color: "#888", lineHeight: 1.4 }}>{s.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Next Steps */}
            <div className={mounted ? "fade-up d3" : ""} style={{
              background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.06)", padding: "24px 28px",
            }}>
              <h3 style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#999", marginBottom: "16px" }}>
                Recommended Next Steps
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {result.nextSteps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "22px", height: "22px", borderRadius: "6px", background: "#000",
                      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: 700, flexShrink: 0,
                    }}>{i + 1}</div>
                    <span style={{ fontSize: "14px", color: "#333", lineHeight: 1.5, paddingTop: "1px" }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{
              fontSize: "12px", color: "#999", lineHeight: 1.5, padding: "0 4px",
            }}>
              This analysis assists with legal workflows but does not constitute legal advice. All findings should be reviewed by qualified legal professionals.
            </div>
          </div>

          {/* ── Right Column — Issues Panel ── */}
          <div className={mounted ? "fade-up d2" : ""} style={{
            position: hasIssues ? "sticky" : "static",
            top: "76px",
            maxHeight: hasIssues ? "calc(100vh - 100px)" : "auto",
            overflowY: hasIssues ? "auto" : "visible",
          }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "12px", padding: "0 2px",
            }}>
              <h3 style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#999", margin: 0 }}>
                Issues ({result.issues.length})
              </h3>
              {criticalCount > 0 && (
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                  {criticalCount === result.issues.length ? "All Critical" : `${criticalCount} Critical`}
                </span>
              )}
            </div>

            {/* Filter + Select All controls */}
            {hasIssues && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
                {result.issues.length > 1 && [
                  { key: 'all', label: `All (${result.issues.length})` },
                  ...(criticalCount > 0 ? [{ key: 'critical', label: `Critical (${criticalCount})` }] : []),
                  ...(warningCount > 0 ? [{ key: 'warning', label: `Warning (${warningCount})` }] : []),
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => { setSeverityFilter(f.key); setOpenIssueId(null); }}
                    style={{
                      fontSize: "11px", fontWeight: 600, padding: "5px 12px", borderRadius: "9999px",
                      border: severityFilter === f.key ? "1px solid #000" : "1px solid rgba(0,0,0,0.1)",
                      background: severityFilter === f.key ? "#000" : "#fff",
                      color: severityFilter === f.key ? "#fff" : "#666",
                      cursor: "pointer", fontFamily: "'DM Sans', Arial, sans-serif",
                      transition: "all 0.15s ease",
                    }}
                  >{f.label}</button>
                ))}
                {totalEditable > 0 && (
                  <>
                    <div style={{ width: "1px", height: "16px", background: "rgba(0,0,0,0.08)", margin: "0 4px" }} />
                    <button
                      onClick={() => {
                        const visibleIds = sortedIssues
                          .filter(i => i._original?.editPlans?.length > 0)
                          .map(i => i._original?.id)
                          .filter(Boolean);
                        onSelectAll?.(!allSelected, visibleIds);
                      }}
                      style={{
                        fontSize: "11px", fontWeight: 500, padding: "5px 12px", borderRadius: "9999px",
                        border: "1px solid rgba(166,74,48,0.15)", background: "rgba(166,74,48,0.04)",
                        color: "#A64A30", cursor: "pointer", fontFamily: "'DM Sans', Arial, sans-serif",
                        transition: "all 0.15s ease",
                      }}
                    >{allSelected ? "Deselect All" : "Select All"}</button>
                    <span style={{ fontSize: "11px", color: "#999" }}>{selectedCount}/{totalEditable}</span>
                  </>
                )}
              </div>
            )}

            {/* Issue cards or empty state */}
            {hasIssues ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {sortedIssues.map((issue, i) => {
                  const issueId = issue._original?.id || `issue-${i}`;
                  return (
                    <IssueCard
                      key={issueId}
                      issue={issue}
                      isOpen={openIssueId === issueId}
                      onToggle={() => setOpenIssueId(openIssueId === issueId ? null : issueId)}
                      decision={redlineDecisions[issueId]}
                      onDecisionChange={(changes) => onDecisionChange?.(issueId, changes)}
                    />
                  );
                })}
              </div>
            ) : (
              <div style={{
                background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.06)",
                padding: "48px 24px", textAlign: "center",
              }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%", background: "rgba(22, 163, 74, 0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
                }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M7 15l4.5 4.5L21 9" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#000", marginBottom: "6px" }}>No issues found</div>
                <div style={{ fontSize: "13px", color: "#888", lineHeight: 1.5 }}>This document meets all playbook standards</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
