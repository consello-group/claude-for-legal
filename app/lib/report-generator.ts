/**
 * Generate an HTML report from analysis results.
 */

export function generateReportHTML(results: any): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Legal Analysis Report - ${results.document || 'Document'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
    .classification { font-size: 24px; font-weight: bold; }
    .classification.green { color: #16a34a; }
    .classification.yellow { color: #ca8a04; }
    .classification.red { color: #dc2626; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    .issue { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 4px; }
    .issue.red { border-left: 4px solid #dc2626; }
    .issue.yellow { border-left: 4px solid #ca8a04; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Legal Analysis Report</h1>
    <p class="classification ${results.classification}">${results.level} - ${results.summary}</p>
    <p><strong>Document:</strong> ${results.document || 'N/A'}</p>
    <p><strong>Parties:</strong> ${results.parties || 'N/A'}</p>
    <p><strong>Type:</strong> ${results.type || 'N/A'}</p>
    <p><strong>Term:</strong> ${results.term || 'N/A'}</p>
    <p><strong>Governing Law:</strong> ${results.governingLaw || 'N/A'}</p>
  </div>

  <h2>Screening Results</h2>
  <table>
    <tr><th>Criterion</th><th>Status</th><th>Notes</th></tr>
    ${results.screening?.map((s: any) => `
      <tr>
        <td>${s.criterion}</td>
        <td>${s.status === 'pass' ? '✓' : s.status === 'flag' ? '⚠' : '✕'}</td>
        <td>${s.note}</td>
      </tr>
    `).join('') || '<tr><td colspan="3">No screening data</td></tr>'}
  </table>

  <h2>Issues Found (${results.issues?.length || 0})</h2>
  ${results.issues?.map((issue: any) => `
    <div class="issue ${issue.severity}">
      <h3>${issue.title}</h3>
      <p><strong>Description:</strong> ${issue.description}</p>
      <p><strong>Risk:</strong> ${issue.risk}</p>
      <p><strong>Recommendation:</strong> ${issue.recommendation}</p>
    </div>
  `).join('') || '<p>No issues found.</p>'}

  <h2>Recommendation</h2>
  <p>${results.recommendation}</p>

  <h2>Next Steps</h2>
  <ul>
    ${results.nextSteps?.map((step: string) => `<li>${step}</li>`).join('') || '<li>Review analysis</li>'}
  </ul>
  <div class="footer">
    <p>This analysis assists with legal workflows but does not constitute legal advice.</p>
    <p><strong>© ${new Date().getFullYear()} Consello</strong></p>
  </div>
</body>
</html>`;
}
