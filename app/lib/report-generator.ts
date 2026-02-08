/**
 * Generate a branded HTML report from analysis results.
 * Mirrors the DOCX redline-builder's brand treatment.
 */

const BRAND = {
  primary: '#000000',
  terracotta: '#A64A30',
  green: '#2E7D32',
  greenBg: '#E8F5E9',
  yellow: '#92400E',
  yellowBg: '#FFF8E1',
  red: '#C62828',
  redBg: '#FFEBEE',
  gray: '#666666',
  lightGray: '#F5F5F5',
  border: '#E0E0E0',
};

function classificationStyle(classification: string) {
  switch (classification) {
    case 'red': return { color: BRAND.red, bg: BRAND.redBg, label: 'ESCALATION REQUIRED' };
    case 'yellow': return { color: BRAND.yellow, bg: BRAND.yellowBg, label: 'COUNSEL REVIEW' };
    default: return { color: BRAND.green, bg: BRAND.greenBg, label: 'STANDARD APPROVAL' };
  }
}

function severityStyle(severity: string) {
  if (severity === 'red') return { color: BRAND.red, border: BRAND.red, label: 'CRITICAL' };
  return { color: BRAND.yellow, border: '#F59E0B', label: 'WARNING' };
}

function statusIcon(status: string) {
  if (status === 'pass') {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" fill="${BRAND.greenBg}" stroke="${BRAND.green}" stroke-width="1"/>
      <path d="M5 8.5L7 10.5L11 6" stroke="${BRAND.green}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="7" fill="${BRAND.redBg}" stroke="${BRAND.red}" stroke-width="1"/>
    <path d="M5.5 10.5L10.5 5.5M5.5 5.5l5 5" stroke="${BRAND.red}" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
}

function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateReportHTML(results: any): string {
  const cls = classificationStyle(results.classification);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const issueCount = results.issues?.length || 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Legal Analysis Report — ${escapeHtml(results.document || 'Document')}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'DM Sans', Arial, Helvetica, sans-serif;
      color: #000;
      background: #fff;
      max-width: 860px;
      margin: 0 auto;
      padding: 48px 40px;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Header */
    .report-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 16px;
      border-bottom: 3px solid ${BRAND.terracotta};
      margin-bottom: 32px;
    }
    .report-header h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .report-header .date {
      font-size: 12px;
      color: ${BRAND.gray};
      font-weight: 500;
    }

    /* Classification Badge */
    .classification-badge {
      background: ${cls.bg};
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 28px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .badge-indicator {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: ${cls.color};
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .badge-text h2 {
      font-size: 18px;
      font-weight: 700;
      color: ${cls.color};
      margin-bottom: 2px;
    }
    .badge-label {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background: ${cls.color};
      color: #fff;
      padding: 2px 8px;
      border-radius: 4px;
      margin-left: 8px;
      vertical-align: middle;
    }
    .badge-text p {
      font-size: 13px;
      color: ${BRAND.gray};
      margin-top: 4px;
    }

    /* Section headers */
    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #999;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid ${BRAND.border};
    }

    /* Summary table */
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    .summary-table td {
      padding: 10px 14px;
      font-size: 13px;
      border-bottom: 1px solid ${BRAND.border};
    }
    .summary-table td:first-child {
      font-weight: 600;
      color: #999;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.3px;
      width: 160px;
      background: ${BRAND.lightGray};
    }
    .summary-table td:last-child {
      font-weight: 500;
      color: #000;
    }

    /* Screening table */
    .screening-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    .screening-table th {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #999;
      text-align: left;
      padding: 8px 12px;
      border-bottom: 2px solid ${BRAND.border};
    }
    .screening-table td {
      padding: 8px 12px;
      font-size: 13px;
      border-bottom: 1px solid ${BRAND.border};
      vertical-align: middle;
    }
    .screening-table td:first-child {
      width: 28px;
      text-align: center;
    }
    .screening-table td svg {
      vertical-align: middle;
    }
    .status-pass { color: ${BRAND.green}; font-weight: 600; }
    .status-fail { color: ${BRAND.red}; font-weight: 600; }

    /* Issue cards */
    .issue-card {
      border-radius: 10px;
      border: 1px solid ${BRAND.border};
      padding: 18px 20px;
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    .issue-card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .severity-bar {
      width: 4px;
      height: 24px;
      border-radius: 2px;
      flex-shrink: 0;
    }
    .issue-card h3 {
      font-size: 14px;
      font-weight: 600;
      color: #000;
      flex: 1;
    }
    .severity-badge {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .issue-card p {
      font-size: 13px;
      color: #555;
      margin-bottom: 8px;
    }
    .issue-card .recommendation {
      background: rgba(166, 74, 48, 0.04);
      border: 1px solid rgba(166, 74, 48, 0.1);
      border-radius: 6px;
      padding: 10px 14px;
      margin-top: 10px;
    }
    .recommendation-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: ${BRAND.terracotta};
      margin-bottom: 4px;
    }
    .recommendation p {
      font-size: 13px;
      color: #555;
      margin-bottom: 0;
    }

    /* Next Steps */
    .next-steps {
      margin-bottom: 28px;
    }
    .step-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    .step-number {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: #000;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .step-text {
      font-size: 14px;
      color: #333;
      padding-top: 1px;
    }

    /* Footer */
    .report-footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid ${BRAND.border};
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .report-footer p {
      font-size: 11px;
      color: #999;
    }
    .report-footer .confidential {
      font-weight: 600;
      color: ${BRAND.gray};
    }

    /* Print */
    @media print {
      body { padding: 20px; }
      .issue-card { break-inside: avoid; }
      .classification-badge, .severity-badge, .badge-label, .badge-indicator,
      .step-number, .summary-table td:first-child { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="report-header">
    <h1>CONSELLO &nbsp;|&nbsp; Legal Analysis Report</h1>
    <span class="date">${date}</span>
  </div>

  <!-- Classification Badge -->
  <div class="classification-badge">
    <div class="badge-indicator">
      ${results.classification === 'red'
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 20h20L12 2z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M12 9v4M12 16v1" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>'
        : results.classification === 'yellow'
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="2"/><path d="M12 8v5M12 16v1" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="2"/><path d="M7.5 12.5L10.5 15.5L16.5 9" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      }
    </div>
    <div class="badge-text">
      <h2>
        ${escapeHtml(results.level || results.classification?.toUpperCase() || 'ANALYSIS')}
        <span class="badge-label">${cls.label}</span>
      </h2>
      <p>${escapeHtml(results.summary || '')}</p>
    </div>
  </div>

  <!-- Contract Summary -->
  <div class="section-title">Contract Summary</div>
  <table class="summary-table">
    ${[
      ['Document', results.document],
      ['Parties', results.parties],
      ['Type', results.type],
      ['Term', results.term],
      ['Governing Law', results.governingLaw],
    ].map(([label, value]: [string, string]) => `
      <tr>
        <td>${label}</td>
        <td>${escapeHtml(value || 'N/A')}</td>
      </tr>
    `).join('')}
  </table>

  <!-- Playbook Screening -->
  <div class="section-title">Playbook Screening</div>
  <table class="screening-table">
    <thead>
      <tr><th></th><th>Criterion</th><th>Status</th><th>Notes</th></tr>
    </thead>
    <tbody>
      ${results.screening?.map((s: any) => {
        const isPassing = s.status === 'pass';
        return `
        <tr>
          <td>${statusIcon(s.status)}</td>
          <td style="font-weight:500">${escapeHtml(s.criterion)}</td>
          <td class="${isPassing ? 'status-pass' : 'status-fail'}">${isPassing ? 'PASS' : 'FAIL'}</td>
          <td style="color:#888">${escapeHtml(s.note)}</td>
        </tr>`;
      }).join('') || '<tr><td colspan="4">No screening data</td></tr>'}
    </tbody>
  </table>

  <!-- Issues Requiring Action -->
  <div class="section-title">Issues Requiring Action (${issueCount})</div>
  ${issueCount > 0 ? results.issues.map((issue: any) => {
    const sev = severityStyle(issue.severity);
    return `
    <div class="issue-card">
      <div class="issue-card-header">
        <div class="severity-bar" style="background:${sev.border}"></div>
        <h3>${escapeHtml(issue.title)}</h3>
        <span class="severity-badge" style="background:${sev.color}15;color:${sev.color}">${sev.label}</span>
      </div>
      <p>${escapeHtml(issue.description)}</p>
      ${issue.risk ? `<p><strong>Risk:</strong> ${escapeHtml(issue.risk)}</p>` : ''}
      ${issue.recommendation ? `
      <div class="recommendation">
        <div class="recommendation-label">Recommended Action</div>
        <p>${escapeHtml(issue.recommendation)}</p>
      </div>` : ''}
    </div>`;
  }).join('') : `
    <div style="text-align:center;padding:32px;color:#888;font-size:14px">
      No issues found — this document meets all playbook standards.
    </div>`}

  <!-- Overall Recommendation -->
  ${results.recommendation ? `
  <div class="section-title" style="margin-top:28px">Recommendation</div>
  <p style="font-size:14px;color:#333;margin-bottom:28px">${escapeHtml(results.recommendation)}</p>
  ` : ''}

  <!-- Next Steps -->
  ${results.nextSteps?.length > 0 ? `
  <div class="section-title">Next Steps</div>
  <div class="next-steps">
    ${results.nextSteps.map((step: string, i: number) => `
    <div class="step-item">
      <div class="step-number">${i + 1}</div>
      <span class="step-text">${escapeHtml(step)}</span>
    </div>`).join('')}
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="report-footer">
    <p class="confidential">Confidential — Consello LLC</p>
    <p>This analysis assists with legal workflows but does not constitute legal advice.</p>
  </div>

</body>
</html>`;
}
